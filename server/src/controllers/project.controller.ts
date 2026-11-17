import { Request, Response } from "express";
import Project from "../models/Project.js";
import { bigProjects } from "../../../shared/projects_config.js";

export function normalizeOrigin(input: string): string {
  let s = input.trim();
  if (!s) return "";
  try {
    const u = new URL(
      s.startsWith("http://") || s.startsWith("https://") ? s : `https://${s}`,
    );
    return u.origin;
  } catch {
    return s.replace(/\/+$/, "");
  }
}

export const ProjectController = {
  getAll: async (_req: Request, res: Response) => {
    let projects = await Project.find().sort({ projectId: 1 });
    if (projects.length === 0 && bigProjects.length > 0) {
      const initial = bigProjects.map((bp) => {
        const origins: string[] = [];
        if (bp.url) origins.push(normalizeOrigin(bp.url));
        bp.companys?.forEach((c) => {
          if (c.companyPageURL) origins.push(normalizeOrigin(c.companyPageURL));
        });
        return {
          projectId: bp.id,
          name: bp.name,
          allowedOrigins: Array.from(new Set(origins.filter(Boolean))),
          tgbotName: bp.tgbotName || "",
          pixelId: bp.pixel || "",
          city: bp.city || "",
          country: bp.country || "",
          url: bp.url || "",
          summary: bp.summary || "",
          companys: bp.companys || [],
          isOff: bp.isOff || false,
        };
      });
      await Project.insertMany(initial);
      projects = await Project.find().sort({ projectId: 1 });
    }
    res.json(projects);
  },

  create: async (req: Request, res: Response) => {
    const {
      name,
      allowedOrigins,
      pixelId,
      pixelToken,
      tgbotName,
      tgbotToken,
      city,
      country,
      url,
      summary,
      companys,
      isOff,
    } = req.body;

    if (!name) {
      res.status(400).send("Project name is required");
      return;
    }

    let { projectId } = req.body;
    if (!projectId) {
      const last = await Project.findOne().sort({ projectId: -1 });
      projectId = last ? last.projectId + 1 : 1;
    }

    const cleanOrigins = Array.isArray(allowedOrigins)
      ? Array.from(new Set(allowedOrigins.map(normalizeOrigin).filter(Boolean)))
      : [];

    const project = await Project.create({
      projectId: Number(projectId),
      name: String(name).trim(),
      allowedOrigins: cleanOrigins,
      pixelId: pixelId ? String(pixelId).trim() : "",
      pixelToken: pixelToken ? String(pixelToken).trim() : "",
      tgbotName: tgbotName ? String(tgbotName).trim() : "",
      tgbotToken: tgbotToken ? String(tgbotToken).trim() : "",
      city: city ? String(city).trim() : "",
      country: country ? String(country).trim() : "",
      url: url ? String(url).trim() : "",
      summary: summary ? String(summary).trim() : "",
      companys: Array.isArray(companys) ? companys : [],
      isOff: Boolean(isOff),
    });

    res.json(project);
  },

  update: async (req: Request, res: Response) => {
    const { id } = req.params;
    const {
      name,
      allowedOrigins,
      pixelId,
      pixelToken,
      tgbotName,
      tgbotToken,
      city,
      country,
      url,
      summary,
      companys,
      isOff,
    } = req.body;

    const updateData: Record<string, any> = {};
    if (name !== undefined) updateData.name = String(name).trim();
    if (allowedOrigins !== undefined && Array.isArray(allowedOrigins)) {
      updateData.allowedOrigins = Array.from(
        new Set(allowedOrigins.map(normalizeOrigin).filter(Boolean)),
      );
    }
    if (pixelId !== undefined) updateData.pixelId = String(pixelId).trim();
    if (pixelToken !== undefined) updateData.pixelToken = String(pixelToken).trim();
    if (tgbotName !== undefined) updateData.tgbotName = String(tgbotName).trim();
    if (tgbotToken !== undefined) updateData.tgbotToken = String(tgbotToken).trim();
    if (city !== undefined) updateData.city = String(city).trim();
    if (country !== undefined) updateData.country = String(country).trim();
    if (url !== undefined) updateData.url = String(url).trim();
    if (summary !== undefined) updateData.summary = String(summary).trim();
    if (companys !== undefined && Array.isArray(companys)) updateData.companys = companys;
    if (isOff !== undefined) updateData.isOff = Boolean(isOff);

    const project = await Project.findByIdAndUpdate(
      id,
      { $set: updateData },
      { new: true },
    );

    if (!project) {
      res.status(404).send("Project not found");
      return;
    }

    res.json(project);
  },

  delete: async (req: Request, res: Response) => {
    const { id } = req.params;
    await Project.findByIdAndDelete(id);
    res.json({ ok: true });
  },
};
