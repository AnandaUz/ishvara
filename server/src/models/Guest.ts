import mongoose, { Schema } from "mongoose";
import { IGuest } from "../../../shared/types/IGuest.js";

interface IGuestDocument extends Omit<IGuest, "_id"> {
  _id: mongoose.Types.ObjectId;
}

const GuestSchema = new Schema<IGuestDocument>({
  createdAt: { type: Date, default: Date.now },
  lastChange: { type: Date },
  ua: { type: String },
  referrer: { type: String },
  name: { type: String },
  userAgentString: { type: String },
  phone: { type: String },
  companyId: { type: String },
  tg: {
    id: { type: String },
    first_name: { type: String },
    last_name: { type: String },
    username: { type: String },
  },
  instagram: {
    fbp: { type: String },
    fbc: { type: String },
    comp_name: { type: String },
    adset_name: { type: String },
    ad_name: { type: String },
  },
  paramsString: { type: String },
  events: { type: [[Schema.Types.Mixed]], default: [] },
  tags: { type: [Number], default: [] },
});

GuestSchema.index({ "instagram.comp_name": 1 });

export default mongoose.model<IGuestDocument>("Guests", GuestSchema);
