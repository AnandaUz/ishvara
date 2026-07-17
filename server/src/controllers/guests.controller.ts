import { IGuest } from "../../../shared/types/IGuest.js";
import Guest from "../models/Guest.js";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { pixels_configs } from "../pixels_configs.js";
// import { IPixelEventData } from "../../../shared/types/Is.js";

export async function getGuests(req: Request, res: Response) {
  const { projectId, limit, skip, tags } = req.query;

  const match: Record<string, any> = {};

  match.b = { $in: [false, null] };

  if (projectId) {
    match.projectId = Number(projectId);
  }
  if (tags && typeof tags === "string") {
    const filtersTags = tags.split(",").map(Number);
    match.tags = { $in: filtersTags };
  }

  const guests = await Guest.aggregate([
    { $match: match },
    {
      $addFields: {
        sortField: { $ifNull: ["$lastChange", "$createdAt"] },
      },
    },
    { $sort: { sortField: -1 } },
  ])
    .skip(Number(skip))
    .limit(Number(limit));
  res.json(guests);
}
export async function updateGuest(_id: string, data: Partial<IGuest>) {
  await Guest.updateOne({ _id }, { $set: data });
}
export async function deleteGuest(_req: Request, res: Response) {
  const { _id } = _req.body;
  await Guest.deleteOne({ _id });
  res.json({ ok: true });
}
export async function clearEvents(_req: Request, res: Response) {
  const { _id } = _req.body;
  await Guest.updateOne({ _id }, { $set: { events: [] } });
  res.json({ ok: true });
}

export async function sendMetaEvent(req: Request, res: Response) {
  const { data, pixelData } = req.body;

  const pixel_config =
    pixels_configs[pixelData! as keyof typeof pixels_configs];
  const PIXEL_ID = pixel_config?.id;
  const PIXEL_TOKEN = pixel_config?.token;

  if (!PIXEL_ID || !PIXEL_TOKEN) {
    return res.status(400).json({ error: "pixel_config is not found" });
  }

  try {
    if (!data) {
      res.status(400).json({ error: "data is required" });
      return;
    }
    // console.log(data, PIXEL_ID, PIXEL_TOKEN);
    // res.status(400).json({ error: "data is required" });
    // return;

    const result = await fetch(
      `https://graph.facebook.com/v19.0/${PIXEL_ID}/events?access_token=${PIXEL_TOKEN}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ data }),
      },
    );

    const json = await result.json();
    console.log("Meta response:", JSON.stringify(json));

    if (!result.ok) {
      const error = await result.json();
      throw new Error(`Meta CAPI error: ${JSON.stringify(error)}`);
    }
    res.json({ ok: true });
  } catch (error) {
    console.log("error", error);

    res.status(500).json({ error: "error" });
  }
}

async function addTags(_id: string, tags: number[]) {
  try {
    await Guest.updateOne({ _id }, { $addToSet: { tags: { $each: tags } } });
  } catch (error) {
    console.log("addTags error:", error);
  }
}
export const guestObj = {
  addTags,
};

export async function post_addTag(_req: Request, res: Response) {
  const { _id, tag } = _req.body;
  try {
    await addTags(_id, [tag]);
    res.json({ ok: true });
  } catch (error) {
    res.status(500).json({ error: "error" });
  }
}

// получить одного гостя
export async function getOneGuest(_req: Request, res: Response) {
  const guest = await Guest.findById(_req.params.id);
  if (!guest) return res.status(404).json({ error: "not found" });
  res.json(guest);
}

// обновить гостя
export async function patchOneGuest(req: Request, res: Response) {
  const id = req.params!.id as string;

  try {
    const updateQuery: any = {};
    const toSet: any = {};
    const toUnset: any = {};

    // Пробегаемся по телу запроса
    for (const key in req.body) {
      if (req.body[key] === null) {
        // Если значение undefined (или null), отправляем его в $unset для удаления
        // В MongoDB для $unset значением может быть пустая строка "" или 1
        toUnset[key] = "";
      } else if (key !== "_id") {
        // Все заполненные поля (кроме _id) отправляем в $set
        toSet[key] = req.body[key];
      }
    }

    // Формируем финальный запрос, только если в них есть ключи
    if (Object.keys(toSet).length > 0) updateQuery.$set = toSet;
    if (Object.keys(toUnset).length > 0) updateQuery.$unset = toUnset;

    // Если объект запроса пустой, сразу отвечаем
    if (Object.keys(updateQuery).length === 0) {
      return res.json({ ok: true, message: "No changes made" });
    }

    await Guest.updateOne(
      { _id: new mongoose.Types.ObjectId(id) },
      updateQuery,
    );

    res.json({ ok: true });
  } catch (error) {
    console.log("patchOneGuest error:", error);
    res.status(500).json({ error: "error" });
  }
}
