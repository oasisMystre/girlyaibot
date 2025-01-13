import { pgTable, serial, text, timestamp, uuid } from "drizzle-orm/pg-core";
import { characters } from "./characters";

export const contexts = pgTable("contexts", {
  id: uuid().defaultRandom().primaryKey(),
  prompt: text().notNull(),
  response: text().notNull(),
  type: text({ enum: ["text", "audio"] })
    .default("text")
    .notNull(),
  character: serial()
    .references(() => characters.id)
    .notNull(),
  createdAt: timestamp().defaultNow().notNull(),
});
