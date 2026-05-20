import { INotes } from "../../../shared/types/INotes.js";
import Notes from "../models/Notes.js";
import { Request, Response } from "express";

export const NoteController = {
  getAll: async (_req: Request, res: Response) => {
    const notes = await Notes.find().sort({ createdAt: -1 });
    res.json(notes);
  },
  create: async (req: Request, res: Response) => {
    const note = new Notes(req.body);
    await note.save();
    res.json(note);
  },
  update: async (_req: Request, res: Response) => {
    const { _id, text } = _req.body;
    await Notes.updateOne({ _id }, { text });
    res.json({ ok: true });
  },
  delete: async (_req: Request, res: Response) => {
    const { _id } = _req.body;
    await Notes.deleteOne({ _id });
    res.json({ ok: true });
  },
};
