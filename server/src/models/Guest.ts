import mongoose, { Schema } from "mongoose";
import { IGuest } from "../../../shared/types/IGuest.js";

interface IGuestDocument extends Omit<IGuest, "_id"> {
  _id: mongoose.Types.ObjectId;
}

const GuestSchema = new Schema<IGuestDocument>({
  createdAt: { type: Date, default: Date.now },
  lastChange: { type: Date },
  referrer: { type: String },
  name: { type: String },
  userAgentString: { type: String },
  phone: { type: String },
  projectId: { type: Number },
  oldId: { type: String, required: false },
  companyId: { type: String },
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
    comp_name: { type: Number || String },
    adset_name: { type: Number || String },
    ad_name: { type: Number || String },
  },
  paramsString: { type: String },
  events: { type: [[Schema.Types.Mixed]] },
  tags: { type: [Number] },
  notes: { type: String },
  chat: {
    id: { type: Number },
  },
});

GuestSchema.index({ "instagram.comp_name": 1 });

export default mongoose.model<IGuestDocument>("Guests", GuestSchema);
