import "../../_base/server/config.js";
import express from "express";
import cors from "cors";
import { connectDB } from "../../_base/server/db.js";
// import userRoutes from './routes/user.routes.js';
// import authRoutes from './routes/auth.routes.js';

// import telegramRoutes from './routes/telegram.routes.js';
// import { bot } from './bot.js';

import trackerRouter from "./routers/tracker.routers.js";
import guestsRouter from "./routers/guests.routers.js";
import { botRegistry } from "./controllers/tgbots/botRegistry.js";
import chatsRouter from "./routers/chats.routers.js";

const app = express();

const port = process.env.PORT || 8080;

const allowedOrigins = process.env.CLIENT_URL?.split(",") || [];
app.use(
  cors({
    origin: (origin, callback) => {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
  }),
);

app.get("/", (_req, res) => {
  res.send("работаю");
});
app.use(express.json());

app.use("/api/tracker", trackerRouter);
app.use("/api/guests", guestsRouter);
app.use("/api/chats", chatsRouter);

// app.use('/api/users', userRoutes);
// app.use('/api/auth', authRoutes);

// app.post('/api/telegram/webhook', async (req, res) => {
//   try {
//     await bot.handleUpdate(req.body, res);
//   } catch (err) {
//     console.error('Webhook error:', err);
//     res.status(200).send('ok');
//   }
// });
// app.use('/api/telegram', telegramRoutes);

// маршрут для Telegram webhook
app.post("/tgbots_user_webhook", (req, res) => {
  const mode = req.query.mode as string;
  const bot = botRegistry.get(mode);

  if (!bot) {
    res.status(400).send(`Unknown bot mode: ${mode}`);
    return;
  }

  bot.handleUpdate(req.body, res);
});

app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
  connectDB();
});
