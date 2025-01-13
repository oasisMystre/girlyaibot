import type { Context } from "telegraf";
import type { userSelectSchema } from "./db/zod";

export declare module "telegraf" {
  interface Context {
    user?: Zod.infer<typeof userSelectSchema>
  }
}