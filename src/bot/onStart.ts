import { Context, Markup } from "telegraf";

import { readFileSync } from "./utils/formatText";

export const onStart = async (context: Context) => {
  return context.replyWithMarkdownV2(
    readFileSync("./src/bot/locale/start.md", "utf-8"),
    Markup.inlineKeyboard([
      [Markup.button.callback("🥵 Create girlfriend", "create")],
      [Markup.button.callback("𝌡 Show my girlfriend", "characters")],
    ]),
  );
};
