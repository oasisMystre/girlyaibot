import { Markup, Scenes } from "telegraf";
import { fal } from "@fal-ai/client";

import { db } from "../../db";
import { cleanText, readFileSync } from "../utils/formatText";
import { composeCharacterMessage } from "../actions/onCharacters";
import {
  getCharacterByUserAndId,
  updateCharacterByUserAndId,
} from "../../modules/characters/character.controller";

type SessionState = {
  name: string;
  personality: string;
};

export const editCharacterScene = () => {
  return new Scenes.WizardScene(
    "edit",
    async (context) => {
      const message = readFileSync("./src/bot/locale/setName.md");
      await context.replyWithMarkdownV2(message, Markup.forceReply());
      return context.wizard.next();
    },
    async (context) => {
      if (context.message && "text" in context.message) {
        const name = context.message.text;
        context.scene.session.state = { name, ...context.scene.session.state };

        const message = readFileSync(
          "./src/bot/locale/setPersonality.md",
          "utf-8",
        );
        await context.replyWithMarkdownV2(message, Markup.forceReply());
        return context.wizard.next();
      }
    },
    async (context) => {
      if (context.message && "text" in context.message) {
        const personality = context.message.text;
        context.scene.session.state = {
          personality,
          ...context.scene.session.state,
        };
        const { name, ...state } = context.scene.session.state as SessionState;

        let character = await getCharacterByUserAndId(
          db,
          context.user!.id,
          context.user!.currentCharacter,
        );
        const characterPrompt = state.personality;

        if (character) {
          const result = await fal.subscribe("fal-ai/flux-pro/v1.1/redux", {
            input: {
              image_url: character.image,
              prompt: readFileSync(
                "./src/bot/locale/character.md",
                "utf-8",
              ).replace("%personality%", cleanText(state.personality)),
              num_images: 1,
              safety_tolerance: "6",
              image_size: "square",
            },
          });

          [character] = await updateCharacterByUserAndId(
            db,
            context.user!.id,
            context.user!.currentCharacter,
            {
              name,
              characterPrompt,
              image: result.data.images[0].url,
            },
          );

          await composeCharacterMessage(context, character);

          return context.scene.leave();
        }
      }
    },
  );
};
