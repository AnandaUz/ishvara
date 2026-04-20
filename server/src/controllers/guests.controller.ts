import Guest from '../models/Guest.js'
import { Request, Response } from 'express'

export async function getGuests(_req: Request, res: Response) {
  const guests = await Guest.aggregate([
    {
      $addFields: {
        sortField: { $ifNull: ['$lastChange', '$createdAt'] }
      }
    },
    { $sort: { sortField: -1 } }
  ])
  res.json(guests)
}
export async function deleteGuest(_req: Request, res: Response) {
  const { _id } = _req.body;
  await Guest.deleteOne({ _id })
  res.json({ ok: true })
}