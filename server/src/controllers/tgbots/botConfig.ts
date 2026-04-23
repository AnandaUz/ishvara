export interface BotConfig {
  mode: string;
  token: string;
}

export const botConfigs: BotConfig[] = [
  {
    mode: "mastermind",
    token: process.env.TGBOT_MM_TOKEN || "",
  },
  {
    mode: "meditation",
    token: process.env.TGBOT_MEDITATION_TOKEN || "",
  },
  // добавляешь новый бот — просто новая строка здесь
];
