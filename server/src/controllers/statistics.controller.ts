import { IGuest } from "../../../shared/types/IGuest.js";
import Guest from "../models/Guest.js";
import { ServerTools } from "../utils/ServerTools.js";

import {
  CLIENT_EVENTS,
  CLIENT_EVENTS_TOOLS,
} from "../../../shared/types/ClientEvents.js";
import { TAGS } from "../../../shared/types/Tags.js";

import { Request, Response } from "express";
import { guestObj } from "./guests.controller.js";

// const ToolsForBase = {
//   arhivGuest: async (guest: IGuest) => {
//     if (!guest.lastChange && guest.createdAt)
//       guest.lastChange = guest.createdAt;
//     Object.keys(guest).forEach((key) => {
//       if (
//         key !== "_id" &&
//         key !== "projectId" &&
//         key !== "lastChange" &&
//         key !== "tg" &&
//         key !== "companyId" &&
//         key !== "adsetId"
//         // key !== "adId"
//       ) {
//         (guest as any)[key] = null;
//       }
//     });
//     // await Guest.updateOne({ _id: guest._id }, guest);
//     return guest;
//   },
// };

export const StatisticsController = {
  findUnregistredEvents: async (req: Request, res: Response) => {
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
    res.write(`data: Загружаю данные ...\n\n`);
    res.flush();

    const guests = await Guest.find().sort({ createdAt: -1 }); //.limit(100);

    res.write(`data: ${guests.length} ...\n\n`);
    res.flush();

    // Optional heartbeat to keep connection alive (every 15 seconds)
    // const heartbeat = setInterval(() => {
    //   res.write(`:heartbeat\n\n`);
    // }, 15000);

    // let t = 50;
    for (let i = 0; i < guests.length; i++) {
      // if (t-- < 0) break;
      const guest = guests[i] as unknown as IGuest;
      if (!guest) continue;
      const e = guest.events;
      let newEventsStr = "";
      let events: Array<number | string> = [];
      if (e && e.length > 0) {
        //{"events":[["t1782360861713","/tours"],[8.9,2],[49,3],[86.9,4],[113.8,5],[158.3,"c"],[160.2,"open-tour-details"],[160.2,"c"],[160.4,"open-tour-details"],[160.4,"c"],[160.6,9],

        e.forEach((val) => {
          // const v0 = val[0];
          const v1 = val[1];

          const ex = events.find((el) => {
            return el === v1;
          });
          if (!ex) {
            if (!v1) {
              console.log("###");
            } else if (!/\//.test(v1.toString())) {
              events.push(v1);
            }
          }
        });

        events.forEach((ev) => {
          const name = CLIENT_EVENTS_TOOLS.oldCodeToName.get(ev);
          if (name) {
            // newEventsStr += `<span class="ev_name"> ${name} </span>`;
          } else {
            newEventsStr += `<span class="ev_code"> ${ev} </span>`;
          }
        });
        // newEventsStr += "<br/>";
        if (newEventsStr.length) {
          // res.write(`data: ${events.join(",")}\n\n`);
          // res.write(`data: --- ${JSON.stringify({ events: e })}\n\n`);
          res.write(`data: ${newEventsStr} \n\n`);
          res.flush();
        }
        // res.write(`data: ${i} \n\n`);
        // res.flush();

        // 🔥 КРИТИЧЕСКИЙ МОМЕНТ ДЛЯ БОЛЬШИХ ОБЪЕМОВ:
        // Каждые 100 итераций даем Node.js паузу в 1 миллисекунду.
        // Это освобождает Event Loop и позволяет серверу физически отправить буфер в сеть.
        if (i % 100 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1));
        }
      }
    }

    // clearInterval(heartbeat);

    res.write(`data: "КОНЕЦ ПОТОКА" \n\n`);

    res.write(`event: end\n`);
    res.write(`data: stream_finished\n\n`);
    res.end();
  },
  setTags: async (req: Request, res: Response) => {
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
    res.write(`data: Установить теги, загружаю данные...\n\n`);
    res.flush();

    const guests = await Guest.find({ b: { $exists: false } })
      .sort({ createdAt: -1 })
      // .limit(100)
      .lean();

    res.write(`data: ${guests.length} ...\n\n`);
    res.flush();

    // Optional heartbeat to keep connection alive (every 15 seconds)
    // const heartbeat = setInterval(() => {
    //   res.write(`:heartbeat\n\n`);
    // }, 15000);

    let tt = 0;
    let ttt = 0;
    for (let i = 0; i < guests.length; i++) {
      tt++;
      const guest = guests[i] as unknown as IGuest;
      if (!guest) continue;
      const e = guest.events;

      let events: Array<number | string> = [];
      if (e && e.length > 0) {
        //{"events":[["t1782360861713","/tours"],[8.9,2],[49,3],[86.9,4],[113.8,5],[158.3,"c"],[160.2,"open-tour-details"],[160.2,"c"],[160.4,"open-tour-details"],[160.4,"c"],[160.6,9],

        e.forEach((val) => {
          // const v0 = val[0];
          const v1 = val[1];

          const ex = events.find((el) => {
            return el === v1;
          });
          if (!ex) {
            if (!v1) {
              console.log("Не нашёл объект");
            } else if (!/\//.test(v1.toString())) {
              events.push(v1);
            }
          }
        });
        // назначение всех тегов
        const tags: Set<number> = new Set();

        events.forEach((ev) => {
          const code = CLIENT_EVENTS_TOOLS.oldCodeToCode.get(ev);

          // групповые теги
          switch (code) {
            // если есть событие скрола то сраду добавляем тег скролл
            case CLIENT_EVENTS.scroll.scroll1.code:
            case CLIENT_EVENTS.scroll.scroll2.code:
            case CLIENT_EVENTS.scroll.scroll3.code:
            case CLIENT_EVENTS.scroll.scroll4.code:
            case CLIENT_EVENTS.scroll.scroll5.code:
            case CLIENT_EVENTS.scroll.scroll6.code:
            case CLIENT_EVENTS.scroll.scroll7.code:
            case CLIENT_EVENTS.scroll.up.code:
            case CLIENT_EVENTS.scroll.down.code:
              tags.add(TAGS.scroll.was.code);
              break;

            case CLIENT_EVENTS.page.showTours.code:
              tags.add(TAGS.page.tours.code);
              break;
            case CLIENT_EVENTS.click.bookingForm.code:
              tags.add(TAGS.goals.middle.code);
              break;
            case CLIENT_EVENTS.click.topBaner.code:
            case CLIENT_EVENTS.click.copyBookingPhone.code:
              tags.add(TAGS.goals.top.code);
              break;
          }
          //events tags
          switch (code) {
            case CLIENT_EVENTS.click.topBaner.code:
              tags.add(TAGS.events.click_topBaner.code);
              break;
            case CLIENT_EVENTS.click.bookingForm.code:
              tags.add(TAGS.events.click_bronirivat.code);
              break;
            case CLIENT_EVENTS.click.copyBookingPhone.code:
              tags.add(TAGS.events.click_copyPhone.code);
              break;
            case CLIENT_EVENTS.click.tourFilter.code:
              tags.add(TAGS.events.tourFilter.code);
              break;
          }
        });

        const t = Array.from(tags);
        if (t.length > 0) {
          const isHasSameTags = ServerTools.arrays.isSubset(
            t,
            guest.tags || [],
          );

          if (!isHasSameTags) {
            await guestObj.addTags(guest._id || "", t);

            ttt++;
            res.write(`data: tags ${JSON.stringify(t)} \n\n`);
            res.write(
              `data: ${i} : ${((i / guests.length) * 100).toFixed(2)} % : Изменений ${ttt}\n\n`,
            );
            res.flush();
          }
        }
        // if (tt > 100) {
        //   res.write(
        //     `data: ${i} : ${((i / guests.length) * 100).toFixed(2)} % : Изменений ${ttt}\n\n`,
        //   );
        //   res.flush();
        //   tt = 0;
        // }

        // 🔥 КРИТИЧЕСКИЙ МОМЕНТ ДЛЯ БОЛЬШИХ ОБЪЕМОВ:
        // Каждые 100 итераций даем Node.js паузу в 1 миллисекунду.
        // Это освобождает Event Loop и позволяет серверу физически отправить буфер в сеть.
        if (i % 100 === 0) {
          await new Promise((resolve) => setTimeout(resolve, 1));
        }
      }
    }

    // clearInterval(heartbeat);

    res.write(`data: КОНЕЦ ПОТОКА. Изменений ${ttt} \n\n`);

    res.write(`event: end\n`);
    res.write(`data: stream_finished\n\n`);
    console.log("event: end");
    res.end();
  },
  stat_countTags: async (req: Request, res: Response) => {
    const { tags, projectId, companyId } = req.query;

    if (!tags) {
      res.status(400).send("Не переданы теги");
      return;
    }
    if (!projectId || !companyId) {
      res.status(400).send("Не переданы projectId или companyId");
      return;
    }

    console.log(projectId, companyId);

    const tagsData = (tags as string).split(",").map((tag) => parseInt(tag));

    const stats = await Guest.aggregate([
      {
        $match: {
          projectId: Number(projectId),
        },
      },
      { $match: { tags: { $exists: true, $ne: [] } } },
      { $unwind: "$tags" },
      { $match: { tags: { $in: tagsData } } },
      {
        $group: {
          _id: {
            date: {
              $dateToString: {
                format: "%Y-%m-%d",
                date: "$createdAt",
                timezone: "+05:00", // Ташкент
              },
            },
            tag: "$tags",
          },
          count: { $sum: 1 },
        },
      },
      {
        $group: {
          _id: "$_id.date",
          data: { $push: { tagId: "$_id.tag", count: "$count" } },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(stats);
  },
  stat_countBots: async (req: Request, res: Response) => {
    const { projectId, companyId } = req.query;

    if (!projectId || !companyId) {
      res.status(400).send("Не переданы projectId или companyId");
      return;
    }

    const bStats = await Guest.aggregate([
      { $match: { projectId: Number(projectId), b: true } },
      {
        $group: {
          _id: {
            $dateToString: {
              format: "%Y-%m-%d",
              date: "$lastChange",
              timezone: "+05:00",
            },
          },
          count: { $sum: 1 },
        },
      },
      { $sort: { _id: 1 } },
    ]);

    res.json(bStats);
  },
};
