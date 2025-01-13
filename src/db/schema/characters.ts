import { pgTable, serial, text, timestamp } from "drizzle-orm/pg-core";
import { users } from "./users";

export const characters = pgTable("characters", {
  id: serial().primaryKey(),
  name: text().notNull(),
  image: text().notNull(),
  characterPrompt: text().notNull(),
  
  user: text()
    .references(() => users.id)
    .notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
