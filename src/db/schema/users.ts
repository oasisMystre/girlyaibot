import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";

export const users = pgTable("users", {
  id: text().primaryKey(),
  currentCharacter: serial(),
  createdAt: timestamp().defaultNow().notNull(),
});
