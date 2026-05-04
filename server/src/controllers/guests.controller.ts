import { IGuest } from "../../../shared/types/IGuest.js";
import Guest from "../models/Guest.js";
import { Request, Response } from "express";
import mongoose from "mongoose";
import { pixels_configs } from "../pixels_configs.js";
// import { IPixelEventData } from "../../../shared/types/Is.js";

export async function getGuests(_req: Request, res: Response) {
  const guests = await Guest.aggregate([
    {
      $addFields: {
        sortField: { $ifNull: ["$lastChange", "$createdAt"] },
      },
    },
    { $sort: { sortField: -1 } },
  ]);
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

    console.log(data, PIXEL_ID, PIXEL_TOKEN);
    res.status(400).json({ error: "data is required" });
    return;

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

async function addTag(_id: string, tag: number) {
  try {
    await Guest.updateOne({ _id }, { $addToSet: { tags: tag } });
  } catch (error) {
    console.log("addTag error:", error);
  }
}
export const guestObj = {
  addTag,
};

export async function post_addTag(_req: Request, res: Response) {
  const { _id, tag } = _req.body;
  try {
    await addTag(_id, tag);
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
  await Guest.updateOne(
    { _id: new mongoose.Types.ObjectId(id) },
    { $set: req.body },
  );
  res.json({ ok: true });
}
