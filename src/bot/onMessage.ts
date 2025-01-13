import type { Scenes } from "telegraf";

import { db } from "../db";
import OpenAI from "../lib/openai";
import { getCharacterByUserAndId } from "../modules/characters/character.controller";
import {
  createContext,
  getContextByUser,
} from "../modules/contexts/context.controller";

import { cleanText, readFileSync } from "./utils/formatText";

export const onMessage = async (context: Scenes.WizardContext) => {
  const message = context.message;

  if (context.user) {
    if (!context.user.currentCharacter) {
      return context.scene.enter("create");
    } else if (message && "text" in message) {
      const character = await getCharacterByUserAndId(
        db,
        context.user!.id,
        context.user.currentCharacter,
      );
      const contexts = await getContextByUser(
        db,
        context.user!.currentCharacter,
        undefined,
        10,
        0,
      );

      const systemMessages = [
        {
          role: "system" as const,
          content: [
            {
              type: "text" as const,
              text: readFileSync("./src/bot/locale/system.md").replace(
                "%name%",
                character!.name,
              ),
            },
            {
              type: "text" as const,
              text: readFileSync("./src/bot/locale/blacklist.md"),
            },
            {
              type: "text" as const,
              text: character!.characterPrompt,
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

      messages.push({ role: "user", content: message.text });

      const chat = await OpenAI.instance.openai.chat.completions.create({
        messages: [...systemMessages, ...messages],
        model: "gpt-3.5-turbo",
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
        prompt: message.text,
        character: context.user.currentCharacter,
      });

      return context.replyWithMarkdownV2(cleanText(response));
    }
  }
};
