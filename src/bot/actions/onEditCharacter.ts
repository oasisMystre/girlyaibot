import type {  Scenes } from "telegraf";

import { db } from "../../db";
import { updateUserById } from "../../modules/users/user.controller";


export const onEditCharacter = async (context: Scenes.WizardContext) => {
  const message = context.callbackQuery;
  if (message && "data" in message) {
    const [id] = Array.from(message.data.match(/\d+/g)!);
    [context.user] = await updateUserById(db, context.user!.id, {
      currentCharacter: Number(id),
    });
    return context.scene.enter('edit');
  }
};
