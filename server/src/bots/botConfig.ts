export interface BotConfig {
  mode: string;
  token: string;
}

export const botConfigs: BotConfig[] = [
  {
    mode: "mastermind",
    token: process.env.BOT_TOKEN || "",
  },
  {
    mode: "meditation",
    token: process.env.MEDITATION_BOT_TOKEN || "",
  },
  // добавляешь новый бот — просто новая строка здесь
];