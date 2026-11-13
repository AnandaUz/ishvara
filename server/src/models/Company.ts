import mongoose, { Schema, Document } from "mongoose";
import { ICompanyEntity } from "../../../shared/types/ICompanyEntity.js";

export interface ICompanyDocument extends Omit<ICompanyEntity, "_id">, Document {}

const CompanySchema = new Schema<ICompanyDocument>(
  {
    projectId: { type: Number, required: true, index: true },
    name: { type: String, required: true },
    urls: { type: [String], default: [] },
    pageIds: { type: [Number], default: [] },
    createdAt: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  },
);

export default mongoose.model<ICompanyDocument>("Company", CompanySchema);

