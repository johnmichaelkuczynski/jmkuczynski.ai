import { pgTable, text, timestamp } from "drizzle-orm/pg-core";

// One row per unique visitor, identified by an anonymous long-lived cookie id.
export const visitorsTable = pgTable("visitors", {
  id: text("id").primaryKey(),
  firstSeen: timestamp("first_seen").notNull().defaultNow(),
  lastSeen: timestamp("last_seen").notNull().defaultNow(),
});
