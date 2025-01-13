import type { Scenes } from "telegraf";

export const onCreate = (context: Scenes.WizardContext) => context.scene.enter("create");