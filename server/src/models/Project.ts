import mongoose, { Schema, Document } from "mongoose";
import { IProjectEntity } from "../../../shared/types/IProjectEntity.js";

export interface IProjectDocument extends Omit<IProjectEntity, "_id">, Document {}

const ProjectSchema = new Schema<IProjectDocument>(
  {
    projectId: { type: Number, required: true, unique: true, index: true },
    name: { type: String, required: true },
    allowedOrigins: { type: [String], default: [] },
    pixelId: { type: String, default: "" },
    pixelToken: { type: String, default: "" },
    tgbotName: { type: String, default: "" },
    tgbotToken: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    url: { type: String, default: "" },
    isOff: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IProjectDocument>("Project", ProjectSchema);
