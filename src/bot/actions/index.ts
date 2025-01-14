import type { Scenes, Telegraf } from "telegraf";

import { catchRuntimeError } from "../utils/atomic";

import { onCreate } from "./onCreate";
import { onCharacter } from "./onCharacter";
import { onCharacters } from "./onCharacters";
import { onEditCharacter } from "./onEditCharacter";

export const registerActions = (bot: Telegraf<Scenes.WizardContext>) => {
  bot.action("create", catchRuntimeError(onCreate));
  bot.action(/characters(\?offset=\d+)?/, catchRuntimeError(onCharacters));
  bot.action(/^character\d+/, catchRuntimeError(onCharacter));
  bot.action(/^edit-character\d+/, catchRuntimeError(onEditCharacter));

  bot.command("create", catchRuntimeError(onCreate));
  bot.command(/characters(\?offset=\d+)?/, catchRuntimeError(onCharacters));
};
