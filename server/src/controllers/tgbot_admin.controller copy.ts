import "../../../_base/server/config.js";

import { Telegraf } from "telegraf";

const TGBOT_ADMIN_TOKEN = process.env.TGBOT_ADMIN_TOKEN || "";
const TGBOT_ADMIN_ADMIN_ID = process.env.TGBOT_ADMIN_ADMIN_ID || "";
const TGBOT_MM_TOKEN = process.env.TGBOT_MM_TOKEN || "";

export const tgbot_admin = new Telegraf(TGBOT_ADMIN_TOKEN);

export const tgbot_mm_users = new Telegraf(TGBOT_MM_TOKEN);

// Сразу вешаем обработчики
tgbot_admin.start(async (ctx) => {
  if (!ctx.from) return;
  if (ctx.from.id !== Number(TGBOT_ADMIN_ADMIN_ID)) return;
  await ctx.reply("Привет! Ананда");
  await ctx.reply(String(ctx.chat.id));
});
tgbot_admin.command("reply", async (ctx) => {
  if (ctx.from.id !== Number(TGBOT_ADMIN_ADMIN_ID)) return;

  // /reply 123456789 Привет, записал тебя на среду
  const parts = ctx.message.text.split(" ");
  const clientId = parts[1];
  const text = parts.slice(2).join(" ");

  if (!clientId || !text) {
    await ctx.reply("Формат: /reply [ID] [текст]");
    return;
  }

  try {
    await tgbot_mm_users.telegram.sendMessage(clientId, text);
    // await ctx.reply("✅ Отправлено");
  } catch (e) {
    await ctx.reply("❌ Ошибка отправки");
    console.error(e);
  }
});

// Функция для отправки сообщений тебе (админу)
export async function sendMessageTo_tgbotAdmin(message: string) {
  try {
    await tgbot_admin.telegram.sendMessage(TGBOT_ADMIN_ADMIN_ID, message, {
      parse_mode: "HTML",
      link_preview_options: { is_disabled: true },
    });
  } catch (error) {
    console.error("Error sending to admin:", error);
  }
}
