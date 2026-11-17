import { IGuest } from "../../../shared/types/IGuest.js";
import { IPages } from "../../../shared/types/IPages.js";
import { TAGS } from "../../../shared/types/Tags.js";
import {
  CLIENT_EVENTS,
  CLIENT_EVENTS_TOOLS,
} from "../../../shared/types/ClientEvents.js";
import { encode2ByteEvents } from "../../../shared/utils/eventCodec.js";
import Guest from "../models/Guest.js";
import Pages from "../models/Pages.js";

export class PagesStatistics {
  pagesMap = new Map<string, number>();
  maxId = 0;
  newPages: IPages[] = [];
  allPages: IPages[] = [];

  async init() {
    this.allPages = await Pages.find();
    this.allPages.forEach((p) => {
      this.pagesMap.set(p.path || "", (p._id as number) || 1);
      if ((p._id as number) > this.maxId) this.maxId = p._id as number;
    });
  }

  findOrCreatePage(path: string): number {
    if (this.pagesMap.has(path)) return this.pagesMap.get(path)!;
    this.maxId++;
    this.pagesMap.set(path, this.maxId);
    this.newPages.push({ _id: this.maxId, path });
    return this.maxId;
  }

  async saveNewPages() {
    if (this.newPages.length === 0) return;
    await Pages.bulkWrite(
      this.newPages.map((p) => ({
        insertOne: { document: p },
      })),
    );
    this.newPages = [];
  }
}

export interface IHourlyProcessorResult {
  processed: number;
  archivedCount: number;
  packedCount: number;
  newPagesCount: number;
  durationMs: number;
}

export async function runHourlyProcessor(): Promise<IHourlyProcessorResult> {
  const startTime = Date.now();

  const pagesStatistics = new PagesStatistics();
  await pagesStatistics.init();

  const threshold = new Date(Date.now() - 30 * 60 * 1000);
  const query = {
    b: { $exists: false },
    events: { $type: "array" },
    $or: [
      { lc: { $lt: threshold } },
      { lastChange: { $lt: threshold } },
      {
        lc: { $exists: false },
        lastChange: { $exists: false },
        ca: { $lt: threshold },
      },
      {
        lc: { $exists: false },
        lastChange: { $exists: false },
        createdAt: { $lt: threshold },
      },
    ],
  };

  const cursor = Guest.find(query)
    .sort({ _id: -1 })
    .lean()
    .cursor({ batchSize: 500 });

  let processed = 0;
  let archivedCount = 0;
  let packedCount = 0;
  let bulkOps: any[] = [];

  for await (const guestDoc of cursor) {
    processed++;
    const guest = guestDoc as unknown as IGuest & { pid?: number; ca?: Date; lc?: Date };
    if (!guest || !guest._id) continue;

    const rawEvents = guest.events;
    const pageIds: number[] = [];
    const eventsList: Array<number | string> = [];

    if (Array.isArray(rawEvents)) {
      for (const val of rawEvents) {
        if (!val || val.length < 2) continue;
        const v0 = val[0];
        const v1 = val[1];

        if (v0 && typeof v0 === "string" && v0.startsWith("t")) {
          let ind: number | null = null;
          if (v1 && typeof v1 === "string") {
            ind = pagesStatistics.findOrCreatePage(v1);
            val[1] = ind;
          } else if (typeof v1 === "number") {
            ind = v1;
          }
          if (ind !== null && typeof ind === "number" && !pageIds.includes(ind)) {
            pageIds.push(ind);
          }
        } else if (v1 && !eventsList.includes(v1) && !/\//.test(v1.toString())) {
          eventsList.push(v1);
        }
      }
    }

    const calculatedTags: Set<number> = new Set();
    eventsList.forEach((ev) => {
      const code = CLIENT_EVENTS_TOOLS.oldCodeToCode.get(ev);
      switch (code) {
        case CLIENT_EVENTS.scroll.scroll1.code:
        case CLIENT_EVENTS.scroll.scroll2.code:
        case CLIENT_EVENTS.scroll.scroll3.code:
        case CLIENT_EVENTS.scroll.scroll4.code:
        case CLIENT_EVENTS.scroll.scroll5.code:
        case CLIENT_EVENTS.scroll.scroll6.code:
        case CLIENT_EVENTS.scroll.scroll7.code:
        case CLIENT_EVENTS.scroll.up.code:
        case CLIENT_EVENTS.scroll.down.code:
          calculatedTags.add(TAGS.scroll.was.code);
          break;
        case CLIENT_EVENTS.page.showTours.code:
          calculatedTags.add(TAGS.page.tours.code);
          break;
        case CLIENT_EVENTS.click.topBaner.code:
          calculatedTags.add(TAGS.events.click_topBaner.code);
          calculatedTags.add(TAGS.goals.top.code);
          break;
        case CLIENT_EVENTS.click.copyBookingPhone.code:
          calculatedTags.add(TAGS.events.click_copyPhone.code);
          calculatedTags.add(TAGS.goals.top.code);
          break;
        case CLIENT_EVENTS.click.bookingForm.code:
          calculatedTags.add(TAGS.events.click_bronirivat.code);
          calculatedTags.add(TAGS.goals.middle.code);
          break;
        case CLIENT_EVENTS.click.tourFilter.code:
          calculatedTags.add(TAGS.events.tourFilter.code);
          break;
        case CLIENT_EVENTS.click.smallSearchTours.code:
          calculatedTags.add(TAGS.events.smallSearchTours.code);
          break;
        case CLIENT_EVENTS.page.openTourDetails.code:
          calculatedTags.add(TAGS.page.openTourDetails.code);
          break;
        case CLIENT_EVENTS.click.advTourClick.code:
          calculatedTags.add(TAGS.events.advTourClick.code);
          break;
      }
    });

    let t = Array.from(calculatedTags);
    if (t.length > 0) {
      if (t.includes(TAGS.page.tours.code) && t.length === 1) {
        t = [TAGS.page.emptyTours.code];
      }
    }

    const existingTags = Array.isArray(guest.tags) ? guest.tags : [];
    const mergedTags = Array.from(new Set([...existingTags, ...t]));

    const hasContacts = Boolean(guest.tg?.id || guest.phone || guest.name);
    const hasLevel = Boolean(guest.level && guest.level > 0);
    const hasTags =
      mergedTags.length > 0 &&
      !(mergedTags.length === 1 && mergedTags[0] === TAGS.page.emptyTours.code);

    const isEmpty = !hasContacts && !hasLevel && !hasTags;

    if (isEmpty) {
      archivedCount++;
      const lastChange = guest.lc ?? guest.lastChange ?? guest.ca ?? guest.createdAt ?? new Date();
      const pid = guest.pid ?? guest.projectId;

      bulkOps.push({
        updateOne: {
          filter: { _id: guest._id },
          update: {
            $set: {
              b: true,
              lc: lastChange,
              ...(pid !== undefined && { pid }),
              ...(guest.companyId !== undefined && { companyId: guest.companyId }),
              ...(guest.tg && { tg: guest.tg }),
            },
            $unset: {
              events: "",
              ca: "",
              createdAt: "",
              userAgentString: "",
              paramsString: "",
              ip: "",
              name: "",
              referrer: "",
              instagram: "",
            },
          },
        },
      });
    } else {
      packedCount++;
      const packedUint8 = encode2ByteEvents((rawEvents as any) || []);
      const packedBuffer = Buffer.from(
        packedUint8.buffer,
        packedUint8.byteOffset,
        packedUint8.byteLength,
      );

      const mergedPages = Array.from(
        new Set([...(guest.pages || []), ...pageIds]),
      );

      const updateDoc: Record<string, any> = {
        $set: {
          events: packedBuffer,
          ...(mergedPages.length > 0 && { pages: mergedPages }),
          ...(mergedTags.length > 0 && { tags: mergedTags }),
        },
      };

      bulkOps.push({
        updateOne: {
          filter: { _id: guest._id },
          update: updateDoc,
        },
      });
    }

    if (bulkOps.length >= 500) {
      await Guest.bulkWrite(bulkOps, { ordered: false });
      bulkOps = [];
    }
  }

  if (bulkOps.length > 0) {
    await Guest.bulkWrite(bulkOps, { ordered: false });
    bulkOps = [];
  }

  const newPagesCount = pagesStatistics.newPages.length;
  if (newPagesCount > 0) {
    await pagesStatistics.saveNewPages();
  }

  const durationMs = Date.now() - startTime;
  return {
    processed,
    archivedCount,
    packedCount,
    newPagesCount,
    durationMs,
  };
}

let cronInterval: NodeJS.Timeout | null = null;
let isRunning = false;

export function initHourlyProcessorCron(): void {
  if (cronInterval) return;

  // Первый запуск через 10 секунд после старта сервера
  setTimeout(async () => {
    if (isRunning) return;
    isRunning = true;
    console.log("[CRON] Starting initial hourly processor run...");
    try {
      const result = await runHourlyProcessor();
      console.log("[CRON] Initial hourly processor finished:", result);
    } catch (err) {
      console.error("[CRON] Initial hourly processor failed:", err);
    } finally {
      isRunning = false;
    }
  }, 10_000);

  // Периодический запуск каждый час (3600000 мс)
  cronInterval = setInterval(async () => {
    if (isRunning) {
      console.log("[CRON] Hourly processor already running, skipping interval");
      return;
    }
    isRunning = true;
    console.log("[CRON] Starting hourly processor run...");
    try {
      const result = await runHourlyProcessor();
      console.log("[CRON] Hourly processor finished:", result);
    } catch (err) {
      console.error("[CRON] Hourly processor failed:", err);
    } finally {
      isRunning = false;
    }
  }, 3_600_000);
}
