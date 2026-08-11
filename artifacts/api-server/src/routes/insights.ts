import { Router, type IRouter } from "express";
import { desc, eq } from "drizzle-orm";
import { db, accomplishmentsTable } from "@workspace/db";
import {
  GetSummaryResponse,
  GetTimelineResponse,
  GetFeaturedResponse,
} from "@workspace/api-zod";
import { serializeAccomplishment } from "../lib/serialize";

const router: IRouter = Router();

router.get("/summary", async (_req, res): Promise<void> => {
  const rows = await db.select().from(accomplishmentsTable);

  const byCategoryMap = new Map<string, number>();
  let firstYear: number | null = null;
  let latestYear: number | null = null;
  const currentYear = new Date().getFullYear();
  let addedThisYear = 0;

  for (const row of rows) {
    byCategoryMap.set(row.category, (byCategoryMap.get(row.category) ?? 0) + 1);
    if (firstYear === null || row.year < firstYear) firstYear = row.year;
    if (latestYear === null || row.year > latestYear) latestYear = row.year;
    if (row.year === currentYear) addedThisYear += 1;
  }

  const summary = {
    total: rows.length,
    featuredCount: rows.filter((r) => r.featured).length,
    byCategory: Array.from(byCategoryMap.entries())
      .map(([category, count]) => ({ category, count }))
      .sort((a, b) => b.count - a.count),
    firstYear,
    latestYear,
    addedThisYear,
  };

  res.json(GetSummaryResponse.parse(summary));
});

router.get("/timeline", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(accomplishmentsTable)
    .orderBy(
      desc(accomplishmentsTable.year),
      desc(accomplishmentsTable.createdAt),
    );

  const groups = new Map<number, typeof rows>();
  for (const row of rows) {
    const group = groups.get(row.year);
    if (group) {
      group.push(row);
    } else {
      groups.set(row.year, [row]);
    }
  }

  const timeline = Array.from(groups.entries())
    .sort((a, b) => b[0] - a[0])
    .map(([year, items]) => ({ year, items: items.map(serializeAccomplishment) }));

  res.json(GetTimelineResponse.parse(timeline));
});

router.get("/featured", async (_req, res): Promise<void> => {
  const rows = await db
    .select()
    .from(accomplishmentsTable)
    .where(eq(accomplishmentsTable.featured, true))
    .orderBy(
      desc(accomplishmentsTable.year),
      desc(accomplishmentsTable.createdAt),
    );

  res.json(GetFeaturedResponse.parse(rows.map(serializeAccomplishment)));
});

export default router;
