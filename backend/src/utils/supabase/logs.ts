import type { Bot } from "./bots.js";
import supabase from "./supabase.js";

export class Logger {
  bot: Bot;

  constructor(bot: Bot) {
    this.bot = bot;
  }

  async logs(entries: { namespace: string; value: string | number }[]) {
    return await supabase.from("logs").insert(
      entries.map((entry) => ({
        bot: this.bot.id,
        namespace: entry.namespace,
        value: String(entry.value),
      })),
    );
  }

  async log(namespace: string, value: string | number) {
    return this.logs([{ namespace, value }]);
  }

  async info(value: string) {
    console.info(value);
    return await this.log("logs", `[info] ${value}`);
  }

  async debug(value: string) {
    console.debug(value);
    return await this.log("logs", `[debug] ${value}`);
  }
}
