import mongoose, { Schema, Document } from "mongoose";
import { IProjectEntity } from "../../../shared/types/IProjectEntity.js";

export interface IProjectDocument extends Omit<IProjectEntity, "_id">, Document {}

const AdSchema = new Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    viewText: { type: String, default: "" },
  },
  { _id: false },
);

const AdSetSchema = new Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    nameInInst: { type: String, default: "" },
    createdAt: { type: String, default: "" },
    summary: { type: String, default: "" },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    ads: { type: [AdSchema], default: [] },
    isOff: { type: Boolean, default: false },
    viewText: { type: String, default: "" },
  },
  { _id: false },
);

const CompanySchema = new Schema(
  {
    id: { type: Number, required: true },
    name: { type: String, required: true },
    summary: { type: String, default: "" },
    companyPageURL: { type: String, default: "" },
    pixel: { type: String, default: "" },
    tgbotName: { type: String, default: "" },
    adsets: { type: [AdSetSchema], default: [] },
    isOff: { type: Boolean, default: false },
    city: { type: String, default: "" },
    country: { type: String, default: "" },
    viewText: { type: String, default: "" },
  },
  { _id: false },
);

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
    summary: { type: String, default: "" },
    companys: { type: [CompanySchema], default: [] },
    isOff: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<IProjectDocument>("Project", ProjectSchema);
