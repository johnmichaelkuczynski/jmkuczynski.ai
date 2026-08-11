import {
  pgTable,
  text,
  serial,
  integer,
  boolean,
  timestamp,
  jsonb,
} from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const CATEGORIES = [
  "publication",
  "treatise",
  "software",
  "patent",
  "music",
  "other",
] as const;

export const accomplishmentsTable = pgTable("accomplishments", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  category: text("category", { enum: CATEGORIES }).notNull(),
  year: integer("year").notNull(),
  description: text("description"),
  venue: text("venue"),
  role: text("role"),
  metric: text("metric"),
  link: text("link"),
  links: jsonb("links")
    .$type<{ label: string; url: string }[]>()
    .notNull()
    .default([]),
  filePath: text("file_path"),
  fileName: text("file_name"),
  featured: boolean("featured").notNull().default(false),
  createdAt: timestamp("created_at").notNull().defaultNow(),
});

export const insertAccomplishmentSchema = createInsertSchema(
  accomplishmentsTable,
).omit({ id: true, createdAt: true });
export type InsertAccomplishment = z.infer<typeof insertAccomplishmentSchema>;
export type Accomplishment = typeof accomplishmentsTable.$inferSelect;
