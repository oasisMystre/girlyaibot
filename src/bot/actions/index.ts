import type { Scenes, Telegraf } from "telegraf";

import { onCreate } from "./onCreate";
import { onCharacter } from "./onCharacter";
import { onCharacters } from "./onCharacters";

export const registerActions = (bot: Telegraf<Scenes.WizardContext>) => {
  bot.action("create", onCreate);
  bot.action("characters", onCharacters);
  bot.action(/^character\d+/, onCharacter);

  bot.command("create", onCreate);
  bot.command("characters", onCharacters);
}