import type { Scenes } from "telegraf";

import { db } from "../db";
import OpenAI from "../lib/openai";
import type { characterSelectSchema } from "../db/zod";
import { getCharacterByUserAndId } from "../modules/characters/character.controller";
import {
  createContext,
  getContextByUser,
} from "../modules/contexts/context.controller";

import { composePhotoMessage } from "./onPhoto";
import { cleanText, readFileSync } from "./utils/formatText";

export const composeTextMessage = async (
  context: Scenes.WizardContext,
  character: Zod.infer<typeof characterSelectSchema>,
  text: string,
) => {
  const contexts = await getContextByUser(
    db,
    context.user!.currentCharacter,
    undefined,
  );

  const systemMessages = [
    {
      role: "system" as const,
      content: [
        {
          type: "text" as const,
          text: readFileSync("./src/bot/locale/system.md", "utf-8").replace(
            "%name%",
            character!.name,
          ),
        },
        {
          type: "text" as const,
          text: readFileSync("./src/bot/locale/blacklist.md", "utf-8"),
        },
        {
          type: "text" as const,
          text: character.characterPrompt,
        },
      ],
    },
  ];

  const messages = contexts.flatMap(({ prompt, response }) => [
    {
      role: "user" as const,
      content: prompt,
    },
    {
      role: "assistant" as const,
      content: response,
    },
  ]);

  messages.push({ role: "user", content: text });

  console.log(JSON.stringify([...systemMessages, ...messages], undefined, 2));

  const chat = await OpenAI.instance.openai.chat.completions.create({
    messages: [...systemMessages, ...messages],
    model: "gpt-4-turbo",
  });

  const response = chat.choices
    .map((choice) => {
      const content = choice.message.content;
      return content;
    })
    .filter(Boolean)
    .join("\n");

  await createContext(db, {
    response,
    type: "text",
    prompt: text,
    character: context.user!.currentCharacter,
  });

  return context.replyWithMarkdownV2(cleanText(response));
};

export const onMessage = async (context: Scenes.WizardContext) => {
  const message = context.message;

  if (context.user) {
    if (!context.user.currentCharacter) {
      return context.scene.enter("create");
    } else if (message && "text" in message) {
      const text = message.text;
      const whitelists = [
        "image",
        "images",
        "photo",
        "picture",
        "pictures",
        "photos",
      ];

      const requestImage = whitelists.some((whitelist) =>
        text.toLowerCase().includes(whitelist),
      );

      const character = await getCharacterByUserAndId(
        db,
        context.user!.id,
        context.user!.currentCharacter,
      );

      if (character)
        if (requestImage)
          return composePhotoMessage(context, {
            prompt: text,
            photo: character!.image,
          });
        else return composeTextMessage(context, character!, text);
    }
  }
};
