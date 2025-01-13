import { relations } from "drizzle-orm";
import { contexts } from "./contexts";
import { users } from "./users";
import { characters } from "./characters";

export const userRelations = relations(users, ({ many }) => ({
  contexts: many(contexts),
}));

export const contextRelations = relations(contexts, ({ one }) => ({
  character: one(characters),
}));

export const characterRelations = relations(characters, ({ one, many }) => ({
  user: one(users),
  contexts: many(contexts),
}));
