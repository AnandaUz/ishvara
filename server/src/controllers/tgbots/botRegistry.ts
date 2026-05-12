import { Telegraf } from "telegraf";
import { botConfigs } from "./botConfig.js";
import { applyHandlers } from "./handlers.js";

export const botRegistry = new Map<string, Telegraf>();

for (const config of botConfigs) {
  if (!config.token) {
    console.warn(`⚠️ Нет токена для бота: ${config.mode}`);
    continue;
  }
  const bot = new Telegraf(config.token);
  applyHandlers(bot, config.mode);
  botRegistry.set(config.mode, bot);
}
