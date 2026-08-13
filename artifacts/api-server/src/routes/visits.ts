import crypto from "node:crypto";
import { Router, type IRouter } from "express";
import { sql } from "drizzle-orm";
import { db, visitorsTable } from "@workspace/db";
import { requireAdmin } from "../lib/admin";

const router: IRouter = Router();

const COOKIE_NAME = "lr_visitor";
const MAX_AGE_MS = 365 * 24 * 60 * 60 * 1000; // 1 year

// Record a visit. Sets a long-lived anonymous cookie the first time; each
// unique cookie id counts as one unique visitor.
router.post("/visit", async (req, res): Promise<void> => {
  try {
    const cookies = (req as { cookies?: Record<string, string> }).cookies;
    let id = cookies?.[COOKIE_NAME];
    if (!id || !/^[a-f0-9-]{36}$/.test(id)) {
      id = crypto.randomUUID();
    }
    res.cookie(COOKIE_NAME, id, {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
      maxAge: MAX_AGE_MS,
      path: "/",
    });
    await db
      .insert(visitorsTable)
      .values({ id })
      .onConflictDoUpdate({
        target: visitorsTable.id,
        set: { lastSeen: sql`now()` },
      });
    res.json({ ok: true });
  } catch (err) {
    req.log.error({ err }, "Failed to record visit");
    res.status(500).json({ error: "Failed to record visit" });
  }
});

// Admin-only unique visitor count.
router.get("/visits/stats", requireAdmin, async (req, res): Promise<void> => {
  try {
    const [row] = await db
      .select({ count: sql<number>`count(*)::int` })
      .from(visitorsTable);
    res.json({ uniqueVisitors: row?.count ?? 0 });
  } catch (err) {
    req.log.error({ err }, "Failed to load visitor stats");
    res.status(500).json({ error: "Failed to load visitor stats" });
  }
});

export default router;
