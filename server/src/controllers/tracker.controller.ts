import { Request, Response } from 'express';
import rateLimit from 'express-rate-limit';
import Guest from '../models/Guest.js';

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
  const allowedOrigin = process.env.CLIENT_URL?.split(',') || [];
  return allowedOrigin.includes(origin);
}

export const start = async (req:Request, res:Response) => {
  const origin = req.headers.origin;

  // 2. Проверка Origin
  if (!checkOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  try {
    const { ua, referrer, instagram, name, paramsString } = req.body;
    const newGuest = new Guest({
      ua,
      referrer,      
      instagram,
      name,
      paramsString,
    });

    const savedGuest = await newGuest.save();
    res.status(201).json({ _id: savedGuest._id });
  } catch (error) {
    res.status(500).json({ error: 'Server error' });
  }
};
export async function pushEvents (req:Request, res:Response) {
  const origin = req.headers.origin;

  // 2. Проверка Origin
  if (!checkOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { _id, events } = req.body;

  console.log(_id, events);

  if (!_id) {
    return res.status(400).json({ error: 'Bad request' });
  }


  const lastChange = req.body.lastChange || undefined;
  await Guest.updateOne(
    { _id },
    { $push: { events: { $each: events } }, $set: { lastChange } }
  )
  res.status(200).json({ ok: true });
}
export async function saveCookies (req:Request, res:Response) {
  const origin = req.headers.origin;

  // 2. Проверка Origin
  if (!checkOrigin(origin)) {
    return res.status(403).json({ error: 'Forbidden' });
  }

  const { _id, result } = req.body;

  if (!_id) {
    return res.status(400).json({ error: 'Bad request' });
  }

  const fbp = result.fbp || undefined;
  const fbc = result.fbc || undefined;
  const pixel = result.pixel || undefined;
  await Guest.updateOne(
    { _id },
    { $set: { 'instagram.fbp': fbp, 'instagram.fbc': fbc, 'instagram.pixel': pixel } }
  )
  res.status(200).json({ ok: true });
}

