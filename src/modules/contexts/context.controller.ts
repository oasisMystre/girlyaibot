import { and, desc, eq, SQL } from "drizzle-orm";

import type { Database } from "../../db";
import { contexts } from "../../db/schema";
import type { characterSelectSchema, contextInsertSchema } from "../../db/zod";

export const createContext = (
  db: Database,
  values: Zod.infer<typeof contextInsertSchema>,
) => db.insert(contexts).values(values).returning().execute();

export const getContextByUser = (
  db: Database,
  character: Zod.infer<typeof characterSelectSchema>["id"],
  filter?: SQL,
  limit?: number,
  offset?: number,
) =>
  db.query.contexts
    .findMany({
      where: and(eq(contexts.character, character), filter),
      limit,
      offset,
      orderBy: desc(contexts.createdAt),
    })
    .execute();
