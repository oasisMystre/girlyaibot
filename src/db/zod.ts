import { createInsertSchema, createSelectSchema } from "drizzle-zod";
import { users } from "./schema/users";
import { contexts } from "./schema/contexts";
import { characters } from "./schema/characters";

export const userSelectSchema = createSelectSchema(users);
export const userInsertSchema = createInsertSchema(users).omit({
  createdAt: true
});

export const contextSelectSchema = createSelectSchema(contexts);
export const contextInsertSchema = createInsertSchema(contexts).omit({
  id: true,
  createdAt: true,
});


export const characterSelectSchema = createSelectSchema(characters);
export const characterInsertSchema = createInsertSchema(characters).omit({
  id: true,
  createdAt: true
});