import { type Context, Input, Markup, type Scenes } from "telegraf";

import { db } from "../../db";
import { format } from "../../lib/utils";
import { characterSelectSchema } from "../../db/zod";
import { getCharactersByUser } from "../../modules/characters/character.controller";

export const composeCharacterMessage = (
  context: Context,
  character: Zod.infer<typeof characterSelectSchema>,
) => {
  return context.replyWithPhoto(Input.fromURL(character.image), {
    caption: format(
      "*%*\n%\\.",
      character.name,
      character.characterPrompt,
    ),
    parse_mode: "MarkdownV2",
    reply_markup: Markup.inlineKeyboard([
     [
       Markup.button.callback(
         "📨 Message girlfriend",
         format("character%", character.id),
       ),
     ],
     // [
     //   Markup.button.callback(
     //     "✏️ Edit girlfriend (Coming Soon)",
     //     format("edit-character%", character.id),
     //   ),
     // ]
    ]).reply_markup,
  });
};

export const onCharacters = async (context: Scenes.WizardContext) => {
  const characters = await getCharactersByUser(db, context.user!.id);
  for (const character of characters) {
    await composeCharacterMessage(context, character);
  }
};
