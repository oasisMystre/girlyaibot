import path from "path";
import axios from "axios";
import mime from "mime-types";
import { fal } from "@fal-ai/client";
import { Input, type Context } from "telegraf";

import { db } from "../db";
import { getCharacterByUserAndId } from "../modules/characters/character.controller";

type Args = {
  prompt?: string;
  photo: string;
  cached?: boolean;
};

export const composePhotoMessage = async (context: Context, args: Args) => {
  const url = args.cached
    ? args.photo
    : await (async () => {
        const buffer = await axios
          .get(args.photo, { responseType: "arraybuffer" })
          .then(({ data }) => data);
        const fileName = path.basename(args.photo);
        const mimeType = mime.contentType(fileName);
        const contentType = mimeType ? mimeType : "image/jpg";

        const file = new File([buffer], path.basename(args.photo), {
          type: contentType,
        });

        return await fal.storage.upload(file);
      })();

  const result = await fal.subscribe(
    "fal-ai/flux-pro/v1.1/redux",
    {
      input: {
        image_url: url,
        safety_tolerance: "6",
        image_size: "square",
        prompt: args.prompt ?? "Send me a picture of you undressed",
      },
    },
  );

  const [image] = result.data.images;
  const isBaseURL = image.url.includes(";base64,");

  if (isBaseURL)
    return context.replyWithPhoto(
      Input.fromBuffer(
        Buffer.from(image.url.split(";base64,").pop()!, "base64"),
      ),
    );
  return context.replyWithPhoto(Input.fromURL(image.url));
};

export const onPhoto = async (context: Context) => {
  const message = context.message;
  if (message && "text" in message) {
    const character = await getCharacterByUserAndId(
      db,
      context.user!.id,
      context.user!.currentCharacter,
    );
    const [, text] = message.text.split(/^\/picture/).filter(Boolean)
    if (character)
      return composePhotoMessage(context, {
        cached: true,
        prompt:text,
        photo: character.image,
      });
  }
};
