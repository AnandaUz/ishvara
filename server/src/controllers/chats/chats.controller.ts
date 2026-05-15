import { Request, Response } from "express";
import Guest from "../../models/Guest.js";
import Message from "../../models/Message.js";
import { MessageDirection } from "../../../../shared/types/IMessage.js";
import { botRegistry } from "../tgbots/botRegistry.js";
import { sendToAdmin } from "./sse.js";
import { Context } from "telegraf";
import { IGuest } from "../../../../shared/types/IGuest.js";

const chats = {
  getMessages: async function (req: Request, res: Response) {
    const chatId = Number(req.params.chatId);

    const messages = await Message.find({ chatId }).sort({ createdAt: 1 });
    res.json(messages);
  },

  sendMessage: async function (req: Request, res: Response) {
    const chatId = Number(req.params.chatId);
    const { text } = req.body;

    const guest = await Guest.findOne({ "chat.id": chatId }).select("tg");
    if (!guest?.tg?.id) {
      res.status(404).json({ error: "Guest not found" });
      return;
    }
    //#######
    const bot = botRegistry.get("mastermind")!;
    const sent = await bot.telegram.sendMessage(guest.tg.id, text);

    try {
      const message = await Message.create({
        chatId,
        text,
        direction: MessageDirection.OUT,
        tgMessageId: sent.message_id,
        createdAt: new Date(),
        read: true,
      });
      sendToAdmin({ type: "new_message", message });
      res.json({ message });
    } catch (error) {
      res.status(500).json({ error: "Failed to send message" });
    }
  },

  createNewChatFor: async function (
    guestId: string | undefined,
    tgbotName: string,
  ) {
    if (!guestId) return undefined;

    let guest = (await Guest.findOne({ _id: guestId })) as IGuest | null;

    if (guest) {
      // Находим максимальный chat.id и +1
      console.log(guest);
      if (!guest.chat?.id) {
        const last = await Guest.findOne({ "chat.id": { $exists: true } })
          .sort({ "chat.id": -1 })
          .select("chat.id");

        const newChat = {
          id: last?.chat?.id ? last.chat.id + 1 : 1,
          tgbotName: tgbotName,
        };
        guest.chat = newChat;
        await Guest.updateOne(
          { _id: guestId },
          { $set: { "chat.id": newChat.id, "chat.tgbotName": tgbotName } },
        );
        return newChat;
      }
      return guest.chat;
    }
    return null;
  },

  onNewMessage: async function (ctx: Context, tgbotName: string) {
    if (!ctx.from || !ctx.message || !("text" in ctx.message)) return;

    const tgId = String(ctx.from.id);

    const guest = await Guest.findOne({
      "tg.id": tgId,
      "chat.tgbotName": tgbotName,
    });

    if (!guest?.chat?.id) return;

    console.log(ctx.message.text, "  ", guest?.chat?.id);

    await Message.create({
      chatId: guest.chat.id,
      text: ctx.message.text,
      direction: MessageDirection.IN,
      tgMessageId: ctx.message.message_id,
      createdAt: new Date(),
      read: false,
    });
  },
};
export default chats;
