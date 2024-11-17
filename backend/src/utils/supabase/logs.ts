import type { Bot } from "./bots.js";
import supabase from "./supabase.js";

export class Logger {
  bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  async log(value: string) {
    return await supabase.from("logs").insert({
      bot: this.bot.id,
      namespace: "logs",
      value,
    });
  }

  async info(value: string) {
    console.info(value);
    return await this.log(`[info] ${value}`);
  }

  async debug(value: string) {
    console.debug(value);
    return await this.log(`[debug] ${value}`);
  }
}
