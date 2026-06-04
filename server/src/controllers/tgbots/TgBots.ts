import { Telegraf } from "telegraf";

export interface BotConfig {
  mode: string;
  token: string;
}
export const TG_MODES = {
  mastermind: "mastermind",
  meditation: "meditation",
  admin: "admin",
};
export const botConfigs: BotConfig[] = [
  {
    mode: TG_MODES.mastermind,
    token: process.env.TGBOT_MM_TOKEN || "",
  },
  {
    mode: TG_MODES.meditation,
    token: process.env.TGBOT_MEDITATION_TOKEN || "",
  },
  {
    mode: TG_MODES.admin,
    token: process.env.TGBOT_ADMIN_TOKEN || "",
  },
];
interface IUserInfo {
  firstName: string;
  lastName: string;
  fullName: string;
  username: string;
  id: string;
}
class TgBots {
  botRegistry: Map<string, Telegraf> = new Map();
  constructor() {
    for (const config of botConfigs) {
      if (!config.token) {
        console.warn(`⚠️ Нет токена для бота: ${config.mode}`);
        continue;
      }
      const bot = new Telegraf(config.token);
      this.applyHandlers(bot, config.mode);
      this.botRegistry.set(config.mode, bot);
    }
  }
  sendMesToAdmin(message: string) {
    const adminBot = this.botRegistry.get(TG_MODES.admin);
    if (!adminBot) return;
    adminBot.telegram.sendMessage(process.env.TGBOT_ADMIN_ADMIN_ID!, message);
  }
  getStartMessages(payload: string, userID: string) {
    let typeText = "";
    switch (payload) {
      case "meditation":
        typeText = "на КОЛЛЕКТИВНУЮ МЕДИТАЦИЮ";
        break;
      case "mastermind":
        typeText = "на МАСТЕРМАЙНД";
        break;
      case "coaching":
        typeText = "на КОУЧ-СЕССИЮ";
        break;
      case "meet":
        typeText = "на бесплатную встречу";
        break;
      case "question":
        typeText = "на вопрос";
        break;
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

https://esho.uz/guide?g=${userID}`;
    }
    if (payload === "meditation") {
      clientMsg = `✅ Я благодарю вас за регистрацию на коллективную медитацию! 
В самое ближайшее время я (Ананда @ananda_uz) напишу вам, и мы завершим регистрацию.

Детали нашей встречи можно найти по ссылке:
https://m.esho.uz/location?g=${userID}`;
    }

    return {
      forGuest: clientMsg,
      forAdmin: suffix,
    };
  }
  getUserData(ctx: any) {
    const firstName = ctx.from.first_name || "";
    const lastName = ctx.from.last_name || "";
    const fullName = `${firstName} ${lastName}`.trim() || "";
    return {
      firstName,
      lastName,
      fullName,
      username: ctx.from.username,
      id: ctx.from.id,
    } as IUserInfo;
  }
  applyHandlers(bot: Telegraf, tgbotName: string) {
    bot.start(async (ctx) => {
      if (!ctx.from) return;

      const userInfo = this.getUserData(ctx);

      const rawPayload = ctx.payload ?? "";

      const params = rawPayload.split("__");
      const payload = params[0] || "";
      const userID = params[1] || "";

      const { forGuest, forAdmin } = this.getStartMessages(payload, userID);

      const adminMsg = `📩 Новая заявка${forAdmin}
От: ${userInfo.fullName}
ID: ${userInfo.id}
Mode: ${tgbotName}
${userInfo.username ? `Username: @${userInfo.username}` : "Username: нет"}
BaseID: ${userID || "---"} `;

      this.sendMesToAdmin(adminMsg);
      await ctx.reply(forGuest);

      //  if (userID) {
      //    await chats.createNewChatFor(userID, tgbotName);
      //    try {
      //      const guestData: IGuest = {
      //        tg: {
      //          first_name: firstName,
      //          last_name: lastName || "",
      //          id: ctx.from.id.toString(),
      //          username: username || "",
      //        },
      //      };
      //      await updateGuest(userID, guestData);
      //    } catch (error) {
      //      console.log(error);
      //    }
      //  }
    });
    bot.on("message", async (ctx) => {
      if (tgbotName === TG_MODES.admin) {
        const msg = ctx.message as any;

        const replyTo = msg.reply_to_message;

        let mode = "";
        let tgUserId = "";
        let match;

        if (replyTo?.text) {
          match = replyTo.text.match(/--(.+?)-(\d+)--/);
          if (match) {
            mode = match[1];
            tgUserId = match[2];
          } else {
            match = replyTo.text.match(/ID: (\d+)/);
            if (match) {
              tgUserId = match[1];

              console.log("tgUserId", tgUserId);

              const matchMode = replyTo.text.match(/Mode: (.+)/);
              if (matchMode) {
                mode = matchMode[1];
              }
              console.log("mode", mode);
            } else {
              await ctx.reply("❌ Ошибка: Не найден ID");
              return;
            }
          }

          const text = msg.text;
          const bot = this.botRegistry.get(mode || TG_MODES.meditation);
          if (!bot) return;
          try {
            await bot.telegram.sendMessage(tgUserId, text);
            //   await ctx.reply("✅ Отправлено");
          } catch (e) {
            await ctx.reply("❌ Ошибка отправки");
          }
        } else {
          await ctx.reply("❌ Не сделан реплай");
        }
      } else {
        const userInfo = this.getUserData(ctx);

        //  await chats.onNewMessage(ctx, tgbotName);
        // // возможно следует удалить позже
        if (!ctx.from || !ctx.message) return;
        const msg = ctx.message as any;

        const replyTo = msg.reply_to_message;
        let msgStr = "";
        if (replyTo) {
          msgStr = `> ${replyTo.text} \n`;
        }

        msgStr += msg.text;
        this
          .sendMesToAdmin(`${userInfo.fullName} --${tgbotName}-${userInfo.id}--
${msgStr}`);
      }
    });
  }
}

export const tgbots = new TgBots();
