import mongoose, { Schema } from "mongoose";
import { INotes } from "../../../shared/types/INotes.js";

interface INotesDocument extends Omit<INotes, "_id"> {
  _id: mongoose.Types.ObjectId;
}

const NotesSchema = new Schema<INotesDocument>({
  createdAt: { type: Date, default: Date.now },
  lastChange: { type: Date },
  projectId: { type: Number },
  companyId: { type: String },
  text: { type: String, required: true },
});

export default mongoose.model<INotesDocument>("Notes", NotesSchema);
