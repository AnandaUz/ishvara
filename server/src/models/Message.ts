import mongoose, { Schema } from "mongoose";
import { IMessage, MessageDirection } from "../../../shared/types/IMessage.js";

interface IMessageDocument extends Omit<IMessage, "_id"> {
  _id: mongoose.Types.ObjectId;
}

const MessageSchema = new Schema<IMessageDocument>({
  chatId: { type: Number, required: true },
  text: { type: String, required: true },
  direction: {
    type: Number,
    enum: Object.values(MessageDirection),
    required: true,
  },
  tgMessageId: { type: Number },
  createdAt: { type: Date, default: Date.now },
  read: { type: Boolean, default: false },
});

MessageSchema.index({ chatId: 1, createdAt: 1 });

export default mongoose.model<IMessageDocument>("Messages", MessageSchema);
