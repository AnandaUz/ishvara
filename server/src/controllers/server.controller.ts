import { IGuest } from "../../../shared/types/IGuest.js";
import Guest from "../models/Guest.js";

import { TAGS } from "../../../shared/types/Tags.js";
import { ServerTools } from "../utils/ServerTools.js";

import { Request, Response } from "express";

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

    const guests = await Guest.find({ b: { $exists: false } })
      .sort({ createdAt: -1 })
      // .limit(100)
      .lean();

    res.write(`data: ${guests.length} ...\n\n`);
    res.flush();

    let delCount = 0;

    // let t = 0;
    for (let i = 0; i < guests.length; i++) {
      const guest = guests[i] as unknown as IGuest;

      if (!guest) continue;
      const tags = guest.tags;

      let isEmpty = true;

      if (Array.isArray(tags)) {
        isEmpty = !ServerTools.arrays.hasIntersection(
          [TAGS.scroll.was.code, TAGS.page.tours.code],
          tags as number[],
        );
      }
      if (!!guest.level && guest.level > 0) isEmpty = false;

      if (isEmpty) {
        delCount++;
        const g = ToolsForBase.arhivGuest(guest);
        g.b = true;

        if (guest._id) {
          await Guest.replaceOne({ _id: guest._id }, g);
        }

        // res.write(`data: ${JSON.stringify(guest.events)} \n\n`);
        if (guest.tags) res.write(`data: ${JSON.stringify(guest.tags)} \n\n`);
        if (guest.level) res.write(`data: ${JSON.stringify(guest.level)} \n\n`);
        res.write(`data: ${Math.round((i / guests.length) * 100)}% \n\n`);
        res.write(`data: Удалено ${delCount} записей \n\n`);
        res.flush();
      }

      // if (t++ > 200) {
      //   t = 0;

      //   res.flush();
      // }

      // 🔥 КРИТИЧЕСКИЙ МОМЕНТ ДЛЯ БОЛЬШИХ ОБЪЕМОВ:
      // Каждые 100 итераций даем Node.js паузу в 1 миллисекунду.
      // Это освобождает Event Loop и позволяет серверу физически отправить буфер в сеть.
      // if (i % 100 === 0) {
      //   await new Promise((resolve) => setTimeout(resolve, 1));
      // }
    }

    // clearInterval(heartbeat);

    res.write(
      `data: КОНЕЦ ПОТОКА. Успешно заархивировано ${delCount} записей\n\n`,
    );

    res.write(`event: end\n`);
    res.write(`data: stream_finished\n\n`);
    res.end();
  },
};
