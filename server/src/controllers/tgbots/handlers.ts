import { Telegraf } from "telegraf";
import { sendMessageTo_mainAdmin } from "../tgbot_admin.controller.js";

export function applyHandlers(bot: Telegraf) {

  bot.start(async (ctx) => {
    if (!ctx.from) return;

    const firstName = ctx.from.first_name || "";
    const lastName = ctx.from.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim() || "Пользователь";

    const rawPayload = ctx.payload ?? "";
    const params = rawPayload.split("__");
    const payload = params[0];
    const userID = params[1] || "";

    let typeText = "";
    switch (payload) {
      case "meditation": typeText = "на КОЛЛЕКТИВНУЮ МЕДИТАЦИЮ"; break;
      case "mastermind": typeText = "на МАСТЕРМАЙНД"; break;
      case "coaching":   typeText = "на КОУЧ-СЕССИЮ"; break;
      case "meet":       typeText = "на бесплатную встречу"; break;
      case "question":   typeText = "на вопрос"; break;
    }

    const suffix = typeText ? ` ${typeText}` : "";

    let clientMsg = `✅ Я благодарю вас за регистрацию!
Ваша заявка${suffix} отправлена! В самое ближайшее время я (Ананда @ananda_uz) отвечу вам`;

    if (payload === "question") {
      clientMsg = `✅ Я рад вашему сообщению! 
В самое ближайшее время я (Ананда @ananda_uz) напишу вам в личном сообщении, и вы сможете задать свой вопрос`;
    }
    if (payload === "meet") {
      clientMsg = `✅ Я благодарю вас за регистрацию! 
В самое ближайшее время я (Ананда @ananda_uz) напишу вам, и мы подберём удобное для вас время.

И я рад поделиться с вами гайдом "Трансформация без саботажа", вы сможете почитать его пока я вам отвечаю.

Ссылка https://esho.uz/guide`;
    }

    const username = ctx.from.username;
    const adminMsg = `${userID} 📩 Новая заявка${suffix}
От: ${fullName}
ID: <code>${ctx.from.id}</code>
${username ? `Username: @${username}` : "Username: нет"}
Ссылка: <a href="tg://user?id=${ctx.from.id}">${fullName}</a>`;

    await sendMessageTo_mainAdmin(adminMsg);
    await ctx.reply(clientMsg);
  });

  bot.on("message", async (ctx) => {
    if (!ctx.from || !ctx.message) return;

    const msg = ctx.message as any;
    const clientId = ctx.from.id;
    const text = msg.text || "[не текст]";

    await sendMessageTo_mainAdmin(
      `/reply <code>${clientId}</code>\n\n${text}`
    );
  });
}