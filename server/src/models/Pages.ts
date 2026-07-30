import mongoose, { Schema } from "mongoose";
import { IPages } from "../../../shared/types/IPages.js";

const PageSchema = new Schema<IPages>({
  _id: { type: Number },
  path: { type: String, unique: true },
});

export default mongoose.model("Page", PageSchema);
