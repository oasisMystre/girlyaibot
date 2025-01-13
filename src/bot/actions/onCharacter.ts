import type { Context } from "telegraf";

import { db } from "../../db";
import { updateUserById } from "../../modules/users/user.controller";

export const onCharacter = async (context: Context) => {
  const message = context.callbackQuery;
  if (message && "data" in message) {
    const [id] = Array.from(message.data.match(/\d+/g)!);
    [context.user] = await updateUserById(db, context.user!.id, {
      currentCharacter: Number(id),
    });
    return context.reply("Hi babe ❤️.");
  }
};
