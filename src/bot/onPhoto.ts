import path from "path";
import axios from "axios";
import mime from "mime-types";
import { fal } from "@fal-ai/client";
import { Input, type Context } from "telegraf";

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
  console.log(args.prompt);

  const result = await fal.subscribe(
    "fal-ai/fast-turbo-diffusion/image-to-image",
    {
      input: {
        image_url: url,
        enable_safety_checker: false,
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
  if (message && "photo" in message) {
    const [photo] = await Promise.all(
      message.photo
        .slice(message.photo.length - 1)
        .map((photo) => context.telegram.getFileLink(photo.file_id)),
    );
    return composePhotoMessage(context, {
      prompt: message.caption,
      photo: photo.toString(),
    });
  }
};
