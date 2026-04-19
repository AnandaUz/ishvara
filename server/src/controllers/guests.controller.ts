import Guest from '../models/Guest.js'
import { Request, Response } from 'express'

export async function getGuests(_req: Request, res: Response) {
  const guests = await Guest.find().sort({ createdAt: -1 })
  res.json(guests)
}