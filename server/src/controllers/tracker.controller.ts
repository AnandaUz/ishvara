import { Request, Response } from "express";
import rateLimit from "express-rate-limit";
import Guest from "../models/Guest.js";
import mongoose from "mongoose";
// import { guestObj } from "./guests.controller.js";
// import { GUEST_TAGS } from "../../../shared/types/GuestConst.js";
import { bigProjects } from "../../../shared/projects_config.js";
import { IBigProjectConfig } from "../../../shared/projects_config.js";
import { IGuest } from "../../../shared/types/IGuest.js";

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
interface IInstagram {
  comp_name?: number;
  adset_name?: number;
  ad_name?: number;
}
export const start = async (req: Request, res: Response) => {
  const origin = req.headers.origin;

  // 2. Проверка Origin
  if (!checkOrigin(origin)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  try {
    const {
      _id,
      referrer,
      createdAt,
      urlParamsString,
      projectId,
      userAgentString,
    } = req.body;

    let _idGuest;
    let isNew = false;
    let oldGuest: IGuest | null = null;
    if (_id) {
      _idGuest = new mongoose.Types.ObjectId(_id);
      oldGuest = await Guest.findById(_idGuest);
    } else {
      _idGuest = new mongoose.Types.ObjectId();
      isNew = true;
    }

    let instagram: IInstagram | undefined = undefined;
    let paramsString: string | undefined = undefined;

    let f = false;

    if (urlParamsString) {
      const urlParams = new URLSearchParams(urlParamsString);

      const comp_name = urlParams.get("comp_name");
      const adset_name = urlParams.get("adset_name");
      const ad_name = urlParams.get("ad_name");

      const project: IBigProjectConfig | undefined = Object.values(
        bigProjects,
      ).find((p) => p.id === projectId);

      if (comp_name) {
        const company = project?.companys[comp_name];

        if (!company) {
          f = true;
        } else {
          instagram = { comp_name: company!.id };
          if (adset_name) {
            const adset = company?.adsets[adset_name];

            if (!adset) {
              f = true;
            } else {
              instagram.adset_name = adset!.id;
              if (ad_name) {
                const ad = adset?.ads[ad_name];
                if (!ad) {
                  f = true;
                } else {
                  instagram.ad_name = ad!.id;
                }
              }
            }
          }
        }
      }
    }

    if (f) {
      paramsString = urlParamsString;
    }

    if (oldGuest) {
      if (
        instagram?.adset_name &&
        oldGuest?.instagram?.adset_name !== instagram.adset_name
      ) {
        isNew = true;
      }
    }

    if (isNew) {
      const ip = getClientIp(req);
      const guestData = {
        createdAt,
        projectId,
        referrer,
        userAgentString,
        ...(oldGuest?._id && { oldId: oldGuest._id.toString() }),
        ...(ip && { ip }),
        ...(instagram && { instagram }),
        ...(paramsString && { paramsString }),
      };
      const guest = await Guest.create(guestData);
      res.status(200).json({ _id: guest._id });
    } else {
      res.status(200).json({ _id: _idGuest.toString() });
    }
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

  await Guest.updateOne(
    { _id },
    {
      $set: {
        "instagram.fbp": fbp,
        "instagram.fbc": fbc,
      },
    },
  );
  res.status(200).json({ ok: true });
}

function getClientIp(req: Request): string | undefined {
  const forwarded = req.headers["x-forwarded-for"];
  if (!forwarded) return undefined;

  const ip = Array.isArray(forwarded) ? forwarded[0] : forwarded.split(",")[0];

  return ip?.trim();
}
