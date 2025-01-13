import { OpenAI as OI } from "openai";

export default class OpenAI {
  readonly openai: OI;

  constructor(apiKey: string = process.env.OPENAI_API_KEY!) {
    this.openai = new OI({
      apiKey,
    });
  }

  private static _instance: OpenAI;

  static get instance() {
    if (this._instance) return this._instance;
    this._instance = new OpenAI();
    return this._instance;
  }
}
