import "../_base/server/config";
import { setWebhook2, Links } from "../_base/_tools/setWebhook.js";

const ngrokUrl = "b02c-92-253-194-231";

const apiUrl = "/tgbots_user_webhook";

const ppServerBase = "https://liner-api-7097239392.asia-south2.run.app";
const serverBase = "https://ishvara-api-7097239392.europe-west1.run.app";

const fullNgrokUrl = `https://${ngrokUrl}.ngrok-free.app`;
// есть два вида бота
//- клиентский бот
//-- дев
//-- прод
//- админский бот
//-- пока один

//+'?mode=meditation',
const links: Links = {
  "подключить клиент MEET DEV к NGROK": {
    BOT_TOKEN: process.env.TGBOT_MM_TOKEN || "",
    SERVER_URL: fullNgrokUrl,
    apiURL: apiUrl + "?mode=mastermind",
  },
  "подключить клиент MEET PROD к API": {
    BOT_TOKEN: process.env.TGBOT_MM_TOKEN_PROD || "",
    SERVER_URL: serverBase,
    apiURL: apiUrl + "?mode=mastermind",
  },
  "подключить клиент MEDITATION PROD к API": {
    BOT_TOKEN: process.env.TGBOT_MEDITATION_TOKEN_PROD || "",
    SERVER_URL: serverBase,
    apiURL: apiUrl + "?mode=meditation",
  },
  //   "подключить Админ PROD к API": {
  //     BOT_TOKEN: process.env.TGBOT_ADMIN_TOKEN || "",
  //     SERVER_URL: serverBase,
  //     apiURL: apiUrl ,
  //   },
  //////////////////////
  //   "подключить клиент бот (дев) к ппАпи": {
  //     BOT_TOKEN: process.env.BOT_TOKEN || "",
  //     SERVER_URL: ppServerBase,
  //     apiURL: apiUrl,
  //   },
  //   "подключить клиент бот (дев) к ngrok": {
  //     BOT_TOKEN: process.env.BOT_TOKEN || "",
  //     SERVER_URL: fullNgrokUrl,
  //     apiURL: apiUrl,
  //   },
};
setWebhook2("подключить клиент MEET DEV к NGROK", links);
// setWebhook2("подключить клиент MEET PROD к API", links);
// setWebhook2("подключить клиент MEDITATION PROD к API", links);
