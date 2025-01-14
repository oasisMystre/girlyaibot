import { message } from "telegraf/filters";
import {
  Scenes,
  session,
  type Context,
  type Telegraf,
  type MiddlewareFn,
} from "telegraf";

import { db } from "../db";
import { createUser } from "../modules/users/user.controller";

import { scenes } from "./scenes";
import { onStart } from "./onStart";
import { onAudio } from "./onAudio";
import { onPhoto } from "./onPhoto";
import { onMessage } from "./onMessage";
import { registerActions } from "./actions";
import { catchRuntimeError } from "./utils/atomic";

export const registerBot = (bot: Telegraf) => {
  const authenticate = async (context: Context, next: () => Promise<void>) => {
    if (context.from) {
      const [user] = await createUser(db, { id: String(context.from.id) });
      context.user = user;
      next();
    }
  };

  const onCancel = async (context: any) => {
    await context.scene.leave();
    return onStart(context);
  };

  scenes.map((scene) => scene.command("cancel", onCancel));

  const stage = new Scenes.Stage<any>(scenes);

  bot.use(session());
  bot.use(authenticate);
  bot.use(stage.middleware());

  bot.start(catchRuntimeError(onStart));
  bot.command("cancel", onCancel);
  bot.command("picture", catchRuntimeError(onPhoto));
  bot.on(message("audio"), catchRuntimeError(onAudio));
  bot.on(message("text"), (context, next) => {
    if ("message" in context && context.message && "text" in context.message) {
      const text = context.message.text;
      if (/^\//.test(text) || context.message.reply_to_message?.from?.is_bot)
        return next();
      return catchRuntimeError<
        Scenes.WizardContext,
        MiddlewareFn<Scenes.WizardContext>
      >(onMessage)(context as Scenes.WizardContext, next);
    }
  });

  registerActions(bot as unknown as Telegraf<Scenes.WizardContext>);
};
