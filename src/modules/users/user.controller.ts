import { users } from "../../db/schema";
import type { Database } from "../../db";
import type { userInsertSchema } from "../../db/zod";

export const createUser = (
  db: Database,
  values: Zod.infer<typeof userInsertSchema>,
) =>
  db
    .insert(users)
    .values(values)
    .onConflictDoUpdate({
      target: [users.id],
      set: values,
    })
    .returning()
    .execute();

export const updateUserById = (
  db: Database,
  id: Zod.infer<typeof userInsertSchema>['id'],
  values: Partial<Zod.infer<typeof userInsertSchema>>,
) => db.update(users).set(values).returning().execute();
