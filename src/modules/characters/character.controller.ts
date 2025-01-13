import { and, eq } from "drizzle-orm";

import type { Database } from "../../db";
import { characters } from "../../db/schema/characters";
import type {
  characterInsertSchema,
  characterSelectSchema,
  userSelectSchema,
} from "../../db/zod";

export const createCharacter = (
  db: Database,
  values: Zod.infer<typeof characterInsertSchema>,
) => db.insert(characters).values(values).returning().execute();

export const getCharactersByUser = (
  db: Database,
  user: Zod.infer<typeof userSelectSchema>["id"],
) =>
  db.query.characters.findMany({
    where: eq(characters.user, user),
  });

export const getCharacterByUserAndId = (
  db: Database,
  user: Zod.infer<typeof userSelectSchema>["id"],
    id: Zod.infer<typeof characterSelectSchema>["id"],
) =>
  db.query.characters.findFirst({
    where: and(eq(characters.user, user), eq(characters.id, id)),
  });

export const updateCharacterByUserAndId = (
  db: Database,
  user: Zod.infer<typeof userSelectSchema>["id"],
  id: Zod.infer<typeof characterSelectSchema>["id"],
  values: Omit<Partial<Zod.infer<typeof characterInsertSchema>>, "user">,
) =>
  db
    .update(characters)
    .set(values)
    .where(and(eq(characters.user, user), eq(characters.id, id)))
    .returning()
    .execute();

export const deleteCharacterByUserAndId = (
  db: Database,
  user: Zod.infer<typeof userSelectSchema>["id"],
  id: Zod.infer<typeof characterSelectSchema>["id"],
) =>
  db
    .delete(characters)
    .where(and(eq(characters.user, user), eq(characters.id, id)))
    .returning()
    .execute();
