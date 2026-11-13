import { Request, Response } from "express";
import Company from "../models/Company.js";
import Pages from "../models/Pages.js";

export function normalizePath(input: string): string {
  let s = input.trim();
  if (!s) return "";
  try {
    if (s.startsWith("http://") || s.startsWith("https://")) {
      const u = new URL(s);
      s = u.pathname;
    }
  } catch {
    // keep as is
  }
  if (!s.startsWith("/")) s = "/" + s;
  if (s.length > 1 && s.endsWith("/")) s = s.slice(0, -1);
  return s;
}

async function resolvePageIds(urls: string[]): Promise<number[]> {
  const normalized = urls.map(normalizePath).filter(Boolean);
  if (normalized.length === 0) return [];

  const foundPages = await Pages.find({ path: { $in: normalized } });
  const ids: number[] = [];
  foundPages.forEach((p) => {
    if (typeof p._id === "number") ids.push(p._id);
  });
  return ids;
}

export const CompanyController = {
  getByProject: async (req: Request, res: Response) => {
    const { projectId } = req.query;
    if (!projectId) {
      res.status(400).send("projectId is required");
      return;
    }
    const companies = await Company.find({ projectId: Number(projectId) }).sort(
      { createdAt: -1 },
    );
    res.json(companies);
  },

  create: async (req: Request, res: Response) => {
    const { projectId, name, urls } = req.body;
    if (!projectId || !name) {
      res.status(400).send("projectId and name are required");
      return;
    }
    const cleanUrls = Array.isArray(urls) ? urls : [];
    const pageIds = await resolvePageIds(cleanUrls);

    const company = await Company.create({
      projectId: Number(projectId),
      name: String(name).trim(),
      urls: cleanUrls,
      pageIds,
    });
    res.json(company);
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const { name, urls } = req.body;

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (urls !== undefined && Array.isArray(urls)) {
      updateData.urls = urls;
      updateData.pageIds = await resolvePageIds(urls);
    }

    const company = await Company.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );
    if (!company) {
      res.status(404).send("Company not found");
      return;
    }
    res.json(company);
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    await Company.findByIdAndDelete(id);
    res.json({ ok: true });
  },
};
