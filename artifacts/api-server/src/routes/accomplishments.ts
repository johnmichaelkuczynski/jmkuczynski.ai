import { Router, type IRouter } from "express";
import { requireAdmin } from "../lib/admin";
import { desc, eq } from "drizzle-orm";
import { db, accomplishmentsTable } from "@workspace/db";
import {
  ListAccomplishmentsResponse,
  CreateAccomplishmentBody,
  CreateAccomplishmentResponse,
  GetAccomplishmentParams,
  GetAccomplishmentResponse,
  UpdateAccomplishmentParams,
  UpdateAccomplishmentBody,
  UpdateAccomplishmentResponse,
  DeleteAccomplishmentParams,
  ToggleFeaturedParams,
  ToggleFeaturedResponse,
} from "@workspace/api-zod";
import { serializeAccomplishment } from "../lib/serialize";

const router: IRouter = Router();

router.get("/accomplishments", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(accomplishmentsTable)
    .orderBy(
      desc(accomplishmentsTable.year),
      desc(accomplishmentsTable.createdAt),
    );
  res.json(ListAccomplishmentsResponse.parse(rows.map(serializeAccomplishment)));
});

router.post("/accomplishments", requireAdmin, async (req, res): Promise<void> => {
  const parsed = CreateAccomplishmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .insert(accomplishmentsTable)
    .values(parsed.data)
    .returning();

  res.status(201).json(CreateAccomplishmentResponse.parse(serializeAccomplishment(row!)));
});

router.get("/accomplishments/:id", async (req, res): Promise<void> => {
  const params = GetAccomplishmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .select()
    .from(accomplishmentsTable)
    .where(eq(accomplishmentsTable.id, params.data.id));

  if (!row) {
    res.status(404).json({ error: "Accomplishment not found" });
    return;
  }

  res.json(GetAccomplishmentResponse.parse(serializeAccomplishment(row)));
});

router.patch("/accomplishments/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = UpdateAccomplishmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const parsed = UpdateAccomplishmentBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [row] = await db
    .update(accomplishmentsTable)
    .set(parsed.data)
    .where(eq(accomplishmentsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Accomplishment not found" });
    return;
  }

  res.json(UpdateAccomplishmentResponse.parse(serializeAccomplishment(row)));
});

router.delete("/accomplishments/:id", requireAdmin, async (req, res): Promise<void> => {
  const params = DeleteAccomplishmentParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [row] = await db
    .delete(accomplishmentsTable)
    .where(eq(accomplishmentsTable.id, params.data.id))
    .returning();

  if (!row) {
    res.status(404).json({ error: "Accomplishment not found" });
    return;
  }

  res.sendStatus(204);
});

router.patch("/accomplishments/:id/feature", requireAdmin, async (req, res): Promise<void> => {
  const params = ToggleFeaturedParams.safeParse(req.params);
  if (!params.success) {
    res.status(400).json({ error: params.error.message });
    return;
  }

  const [existing] = await db
    .select()
    .from(accomplishmentsTable)
    .where(eq(accomplishmentsTable.id, params.data.id));

  if (!existing) {
    res.status(404).json({ error: "Accomplishment not found" });
    return;
  }

  const [row] = await db
    .update(accomplishmentsTable)
    .set({ featured: !existing.featured })
    .where(eq(accomplishmentsTable.id, params.data.id))
    .returning();

  res.json(ToggleFeaturedResponse.parse(serializeAccomplishment(row!)));
});

export default router;
