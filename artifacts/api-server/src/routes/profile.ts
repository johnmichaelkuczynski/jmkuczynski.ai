import { Router, type IRouter } from "express";
import { requireAdmin } from "../lib/admin";
import { eq } from "drizzle-orm";
import { db, profilesTable } from "@workspace/db";
import {
  GetProfileResponse,
  UpdateProfileBody,
  UpdateProfileResponse,
} from "@workspace/api-zod";

const router: IRouter = Router();

function serializeProfile<T extends { updatedAt: Date }>(row: T) {
  return { ...row, updatedAt: row.updatedAt.toISOString() };
}

async function getOrCreateProfile() {
  const [existing] = await db.select().from(profilesTable).limit(1);
  if (existing) return existing;
  const [created] = await db
    .insert(profilesTable)
    .values({ fullName: "Your Name", headline: "", summary: "" })
    .returning();
  return created;
}

router.get("/profile", async (_req, res): Promise<void> => {
  const profile = await getOrCreateProfile();
  res.json(GetProfileResponse.parse(serializeProfile(profile!)));
});

router.put("/profile", requireAdmin, async (req, res): Promise<void> => {
  const parsed = UpdateProfileBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const profile = await getOrCreateProfile();
  const [updated] = await db
    .update(profilesTable)
    .set({ ...parsed.data, updatedAt: new Date() })
    .where(eq(profilesTable.id, profile!.id))
    .returning();

  res.json(UpdateProfileResponse.parse(serializeProfile(updated!)));
});

export default router;
