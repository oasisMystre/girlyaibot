import { type Context, Input, Markup, type Scenes } from "telegraf";

import { db } from "../../db";
import { format } from "../../lib/utils";
import { characterSelectSchema } from "../../db/zod";
import {
  getCharactersByUser,
  getCharactersCountByUser,
} from "../../modules/characters/character.controller";

export const composeCharacterMessage = (
  context: Context,
  character: Zod.infer<typeof characterSelectSchema>,
  edit: boolean = false,
  ...buttons: ReturnType<(typeof Markup)["button"]["callback"]>[][][]
) => {
  const photo = Input.fromURL(character.image);
  const caption = format(
    "*%*\n%\\.",
    character.name,
    character.characterPrompt,
  );
  const reply_markup = Markup.inlineKeyboard([
    [
      Markup.button.callback(
        "📨 Message girlfriend",
        format("character%", character.id),
      ),
    ],
    [
      Markup.button.callback(
        "✏️ Edit girlfriend",
        format("edit-character%", character.id),
      ),
    ],
    ...buttons.flat(),
  ]).reply_markup;

  if (edit)
    return context.editMessageMedia(
      {
        type: "photo",
        media: photo,
        caption,
        parse_mode: "MarkdownV2",
      },
      {
        reply_markup,
      },
    );
  else
    return context.replyWithPhoto(photo, {
      caption,
      parse_mode: "MarkdownV2",
      reply_markup,
    });
};

export const onCharacters = async (context: Scenes.WizardContext) => {
  const text = context.callbackQuery
    ? (() => {
        if (context.callbackQuery && "data" in context.callbackQuery)
          return context.callbackQuery.data;
      })()
    : (() => {
        if (context.message && "text" in context.message)
          return context.message.text;
      })();

  let limit = 1;
  let offset = 0;
  const buttons = [];
  const [{ count }] = await getCharactersCountByUser(db, context.user!.id);

  if (text) {
    const query = text.match(/\?.*/);
    if (query) {
      const search = new URLSearchParams(query[0]);
      offset = Number(search.get("offset"));
    }
  }

  if (offset < count - 1)
    buttons.push(
      Markup.button.callback(
        "⏩ Next",
        format("characters?offset=%", offset + 1),
      ),
    );

  if (offset > 0)
    buttons.push(
      Markup.button.callback(
        "⏪ Previous",
        format("characters?offset=%", offset - 1),
      ),
    );

  const characters = await getCharactersByUser(
    db,
    context.user!.id,
    limit,
    offset,
  );
  for (const character of characters)
    await composeCharacterMessage(context, character, Boolean(text), [buttons]);
};
