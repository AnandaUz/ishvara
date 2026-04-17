import '../../../_base/server/config.js';
// import { bot as clientBot } from '../api.js';

import { Telegraf } from "telegraf";

const ADMIN_TGBOT_TOKEN = process.env.ADMIN_TGBOT_TOKEN || '';
const ADMIN_TGBOT_ADMIN_ID = process.env.ADMIN_TGBOT_ADMIN_ID || '';

export const admin_bot = new Telegraf(ADMIN_TGBOT_TOKEN);

// Сразу вешаем обработчики
admin_bot.start(async (ctx) => {
    if (!ctx.from) return;
    if (ctx.from.id !== Number(ADMIN_TGBOT_ADMIN_ID)) return;
    await ctx.reply("Привет! Ананда");

    await ctx.reply(String(ctx.chat.id));


});
admin_bot.command("reply", async (ctx) => {
    if (ctx.from.id !== Number(ADMIN_TGBOT_ADMIN_ID)) return;

    // /reply 123456789 Привет, записал тебя на среду
    const parts = ctx.message.text.split(" ");
    const clientId = parts[1];
    const text = parts.slice(2).join(" ");

    if (!clientId || !text) {
        await ctx.reply("Формат: /reply [ID] [текст]");
        return;
    }

    try {
        // await clientBot.telegram.sendMessage(clientId, text);
        // await ctx.reply("✅ Отправлено");
    } catch (e) {
        await ctx.reply("❌ Ошибка отправки");
        console.error(e);
    }
});

// Функция для отправки сообщений тебе (админу)
export async function sendMessageTo_mainAdmin(message: string) {
    try {
        await admin_bot.telegram.sendMessage(ADMIN_TGBOT_ADMIN_ID, message, {
            parse_mode: 'HTML',
            link_preview_options: { is_disabled: true }
        });
    } catch (error) {
        console.error("Error sending to admin:", error);
    }
}
