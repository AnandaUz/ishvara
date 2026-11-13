import { IGuest } from "../../../shared/types/IGuest.js";
import Guest from "../models/Guest.js";

import { TAGS } from "../../../shared/types/Tags.js";
import { ServerTools } from "../utils/ServerTools.js";

import { Request, Response } from "express";
import { cleanupUserAgents as runCleanup } from "../services/guestCleanup.service.js";
import { runDailyArchive } from "../services/dailyArchive.service.js";
// import { CLIENT_EVENTS } from "../../../shared/types/ClientEvents.js";

const ToolsForBase = {
  arhivGuest: (guest: IGuest) => {
    const lastChange = guest.lastChange ?? guest.createdAt;
    return {
      _id: guest._id,
      projectId: guest.projectId,
      lastChange,
      tg: guest.tg,
      companyId: guest.companyId,
    } as IGuest;
  },
};

export const ServerController = {
  arhive1: async (req: Request, res: Response) => {
    //- сначала ещё раз проставляю теги
    // ServerController.arhive1(req, res);
    // Allow cross‑origin requests for SSE (development only)
    // 1. Отключаем таймаут для этого запроса
    req.setTimeout(0);
    // Также можно отключить таймаут на уровне сокета (для надежности)
    req.socket.setTimeout(0);

    res.setHeader("Access-Control-Allow-Origin", "*");
    res.writeHead(200, {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache",
      Connection: "keep-alive",
    });
    // Flush headers to ensure SSE starts immediately
    if (res.flushHeaders) {
      res.flushHeaders();
    }
    res.write(`data: Архивинование 1го уровня - загружаю данные ...\n\n`);
    res.flush();

    const totalCount = await Guest.countDocuments({ b: { $exists: false } });

    res.write(`data: Найдено записей для проверки: ${totalCount} ...\n\n`);
    res.flush();

    const cursor = Guest.find({ b: { $exists: false } })
      .select("_id tags level projectId lastChange createdAt tg companyId")
      .sort({ createdAt: -1 })
      .lean()
      .cursor({ batchSize: 500 });

    let delCount = 0;
    let i = 0;
    const bulkOps: any[] = [];

    for await (const guestDoc of cursor) {
      i++;
      const guest = guestDoc as unknown as IGuest;
      if (!guest) continue;
      const tags = guest.tags;

      let isEmpty = true;

      if (Array.isArray(tags)) {
        let f = ServerTools.arrays.hasIntersection(
          [
            TAGS.scroll.was.code,
            TAGS.page.tours.code,
            TAGS.page.emptyTours.code,
          ],
          tags as number[],
        );

        if (f) {
          isEmpty = false;
        }
      }

      if (!!guest.level && guest.level > 0) isEmpty = false;

      if (isEmpty && guest._id) {
        delCount++;
        const g = ToolsForBase.arhivGuest(guest);
        g.b = true;

        bulkOps.push({
          replaceOne: {
            filter: { _id: guest._id },
            replacement: g,
          },
        });
      }

      if (bulkOps.length >= 500) {
        await Guest.bulkWrite(bulkOps, { ordered: false });
        bulkOps.length = 0;
      }

      if (i % 250 === 0) {
        const percent = totalCount > 0 ? Math.round((i / totalCount) * 100) : 0;
        res.write(`data: ${percent}% (обработано ${i}/${totalCount}, заархивировано: ${delCount})\n\n`);
        res.flush();
        await new Promise((resolve) => setTimeout(resolve, 1));
      }
    }

    if (bulkOps.length > 0) {
      await Guest.bulkWrite(bulkOps, { ordered: false });
      bulkOps.length = 0;
    }

    res.write(
      `data: КОНЕЦ ПОТОКА. Успешно заархивировано ${delCount} записей\n\n`,
    );

    res.write(`event: end\n`);
    res.write(`data: stream_finished\n\n`);
    res.end();
  },

  cleanupUserAgents: async (_req: Request, res: Response) => {
    try {
      const stats = await runCleanup();
      res.json({ ok: true, stats });
    } catch (error) {
      console.error("cleanupUserAgents error:", error);
      res.status(500).json({ ok: false, error: "Failed to cleanup user agents" });
    }
  },

  cronDailyArhive: async (req: Request, res: Response) => {
    try {
      const key =
        (req.query.password as string) ||
        (req.query.key as string) ||
        (req.headers["x-cron-key"] as string);
      const expectedKey =
        process.env.PASSWORD || process.env.CRON_SECRET || "ishvara_daily_cron_2026";

      if (!key || key !== expectedKey) {
        res.status(401).json({ ok: false, error: "Unauthorized" });
        return;
      }

      const result = await runDailyArchive();
      res.json({ ok: true, result });
    } catch (error: any) {
      console.error("cronDailyArhive error:", error);
      res.status(500).json({ ok: false, error: error.message || "Failed to run daily archive" });
    }
  },
};
