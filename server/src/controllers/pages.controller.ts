import Pages from "../models/Pages.js";
import { Request, Response } from "express";

export const PageController = {
  getAll: async (_req: Request, res: Response) => {
    const pages = await Pages.find();
    res.json(pages);
  },
  create: async (req: Request, res: Response) => {
    const page = new Pages(req.body);
    await page.save();
    res.json(page);
  },
  update: async (_req: Request, res: Response) => {
    const { _id, text } = _req.body;
    await Pages.updateOne({ _id }, { text });
    res.json({ ok: true });
  },
  delete: async (_req: Request, res: Response) => {
    const { _id } = _req.body;
    await Pages.deleteOne({ _id });
    res.json({ ok: true });
  },
};
