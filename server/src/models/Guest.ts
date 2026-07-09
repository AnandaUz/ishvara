import mongoose, { Schema } from "mongoose";
import { IGuest } from "../../../shared/types/IGuest.js";

interface IGuestDocument extends Omit<IGuest, "_id"> {
  _id: mongoose.Types.ObjectId;
}

const GuestSchema = new Schema<IGuestDocument>(
  {
    createdAt: { type: Date, default: Date.now },
    lastChange: { type: Date },
    referrer: { type: String },

    name: { type: String },
    userAgentString: { type: String },
    phone: { type: String },
    projectId: { type: Number },
    companyId: { type: Schema.Types.Number },
    adsetId: { type: Number },
    adId: { type: Number },
    level: { type: Number },
    oldId: { type: String, required: false },
    ip: { type: String, required: false },
    tg: {
      id: { type: String },
      first_name: { type: String },
      last_name: { type: String },
      username: { type: String },
    },
    instagram: {
      fbp: { type: String },
      fbc: { type: String },
    },
    paramsString: { type: String },

    events: { type: [[Schema.Types.Mixed]], default: undefined },
    tags: { type: [Schema.Types.Int32], default: undefined },
    notes: { type: String },
    b: { type: Schema.Types.Boolean },

    chat: {
      id: { type: Number },
      tgbotName: { type: String },
    },
  },
  // {
  //   // Важно включить, чтобы алиасы корректно преобразовывались в .toJSON() и .toObject()
  //   toObject: { aliases: true, virtuals: true },
  //   toJSON: { aliases: true, virtuals: true },
  // },
);

// В индексах нужно использовать КОРОТКОЕ имя, которое идет в базу!
GuestSchema.index({ pid: 1 });

export default mongoose.model<IGuestDocument>("Guests", GuestSchema);
