import mongoose, { Schema } from "mongoose";
import { IGuest } from "../../../shared/types/IGuest.js";

interface IGuestDocument extends Omit<IGuest, "_id"> {
  _id: mongoose.Types.ObjectId;
  ca?: Date;
  lc?: Date;
  pid?: number;
}

const GuestSchema = new Schema<IGuestDocument>(
  {
    ca: { type: Date, default: Date.now, alias: "createdAt" },
    lc: { type: Date, alias: "lastChange" },
    referrer: { type: String },

    name: { type: String },
    userAgentString: { type: String },
    iM: { type: Boolean },
    phone: { type: String },
    pid: { type: Number, alias: "projectId" },
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

    events: { type: Schema.Types.Mixed, default: undefined },
    tags: { type: [Schema.Types.Int32], default: undefined },
    notes: { type: String },
    b: { type: Schema.Types.Boolean },

    chat: {
      id: { type: Number },
      tgbotName: { type: String },
    },
    pages: { type: [Number], default: undefined },
  },
  {
    versionKey: false,
    toJSON: { aliases: true, virtuals: true },
    toObject: { aliases: true, virtuals: true },
  },
);

// В индексах нужно использовать КОРОТКОЕ имя, которое идет в базу!
GuestSchema.index({ pid: 1 });

export default mongoose.model<IGuestDocument>("Guests", GuestSchema);
