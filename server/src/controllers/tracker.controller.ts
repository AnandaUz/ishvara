import { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import Guest from "../models/Guest.js";
import mongoose from "mongoose";
import { guestObj } from "./guests.controller.js";
import { GUEST_TAGS } from "../../../shared/types/GuestConst.js";

// 1. Ограничиваем создание сессий: 10 штук в час с одного IP
export const idCreateLimiter = rateLimit({
  windowMs: 60 * 60 * 1000,
  max: 10000,
  message: "Too many sessions created from this IP",
  standardHeaders: true,
  legacyHeaders: false,
});

function checkOrigin(origin: string | undefined) {
  if (!origin) return false;
  const allowedOrigin = process.env.CLIENT_URL?.split(",") || [];
  return allowedOrigin.includes(origin);
}

export const start = async (req: Request, res: Response) => {
  const origin = req.headers.origin;

  // 2. Проверка Origin
  if (!checkOrigin(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const { _id, referrer, instagram, name, paramsString, userAgentString } =
      req.body;

    const objectId = _id
      ? new mongoose.Types.ObjectId(_id)
      : new mongoose.Types.ObjectId();

    const guest = await Guest.findOneAndUpdate(
      { _id: objectId },
      {
        $setOnInsert: {
          referrer,
          instagram,
          name,
          paramsString,
          userAgentString,
        },
      },
      { upsert: true, returnDocument: "after" },
    );

    if (_id !== guest._id) {
      await guestObj.addTag(guest._id.toString(), GUEST_TAGS.returned.code);
    }

    res.status(200).json({ _id: guest._id });
  } catch (error) {
    res.status(500).json({ error: "Server error" });
  }
};
export async function pushEvents(req: Request, res: Response) {
  const origin = req.headers.origin;

  // 2. Проверка Origin
  if (!checkOrigin(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { _id, events } = req.body;

  if (!_id) {
    return res.status(400).json({ error: "Bad request" });
  }

  const lastChange = req.body.lastChange || undefined;
  await Guest.updateOne(
    { _id },
    { $push: { events: { $each: events } }, $set: { lastChange } },
  );
  res.status(200).json({ ok: true });
}
export async function saveCookies(req: Request, res: Response) {
  const origin = req.headers.origin;

  // 2. Проверка Origin
  if (!checkOrigin(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { _id, result } = req.body;

  if (!_id) {
    return res.status(400).json({ error: "Bad request" });
  }

  const fbp = result.fbp || undefined;
  const fbc = result.fbc || undefined;
  const pixel = result.pixel || undefined;
  await Guest.updateOne(
    { _id },
    {
      $set: {
        "instagram.fbp": fbp,
        "instagram.fbc": fbc,
        "instagram.pixel": pixel,
      },
    },
  );
  res.status(200).json({ ok: true });
}
