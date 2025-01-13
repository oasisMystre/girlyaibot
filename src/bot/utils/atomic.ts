import { AxiosError } from "axios";
import type { Context, MiddlewareFn } from "telegraf";

export default function atomic<T extends MiddlewareFn<Context>>(callback: T) {
  return async (context: Context, next: () => Promise<void>) =>
    callback(context, next);
}

export function catchRuntimeError<C extends Context, T extends MiddlewareFn<C>>(
  callback: T,
) {
  return async (context: C, next: () => Promise<void>) =>
    Promise.resolve(callback(context, next)).catch((error) => {
      if (error instanceof AxiosError) console.error(error.response?.data);
      else console.error(error);
    });
}
