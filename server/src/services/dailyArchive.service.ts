import { IGuest } from "../../../shared/types/IGuest.js";
import { normalizeEvents } from "../../../shared/utils/eventCodec.js";
import { IPages } from "../../../shared/types/IPages.js";
import { TAGS } from "../../../shared/types/Tags.js";
import {
  CLIENT_EVENTS,
  CLIENT_EVENTS_TOOLS,
} from "../../../shared/types/ClientEvents.js";
import Guest from "../models/Guest.js";
import Pages from "../models/Pages.js";
import { ServerTools } from "../utils/ServerTools.js";

class PagesStatistics {
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

  findOrCreatePage(path: string) {
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
  }
}

export interface IDailyArchiveResult {
  tagsProcessed: number;
  tagsChanged: number;
  newPagesCount: number;
  archiveChecked: number;
  archivedCount: number;
  durationMs: number;
}

let isArchiveRunning = false;

export async function runDailyArchive(): Promise<IDailyArchiveResult> {
  if (isArchiveRunning) {
    throw new Error("Архивация уже выполняется");
  }
  isArchiveRunning = true;
  try {
    const startTime = Date.now();

  // 1. Установка тегов
  const pagesStatistics = new PagesStatistics();
  await pagesStatistics.init();

  const tagsCursor = Guest.find({ b: { $exists: false } })
    .select("_id events tags pages")
    .sort({ createdAt: -1 })
    .lean()
    .cursor({ batchSize: 500 });

  let tagsProcessed = 0;
  let tagsChanged = 0;
  let tagOps: any[] = [];

  for await (const guestDoc of tagsCursor) {
    tagsProcessed++;
    const guest = guestDoc as unknown as IGuest;
    const guestEvents = normalizeEvents(guest?.events);
    if (!guest || guestEvents.length === 0) continue;

    let fRefEventString = false;
    const pageIds: number[] = [];
    const events: Array<number | string> = [];

    guestEvents.forEach((val) => {
      const v0 = val[0];
      const v1 = val[1];

      if (v0 && typeof v0 === "string" && v0.startsWith("t")) {
        let ind: number | null = null;
        if (v1 && typeof v1 === "string") {
          fRefEventString = true;
          ind = pagesStatistics.findOrCreatePage(v1 as string);
          val[1] = ind;
        } else {
          ind = v1 as number;
        }
        if (ind !== null && typeof ind === "number" && !pageIds.includes(ind)) {
          pageIds.push(ind);
        }
      } else if (v1 && !events.includes(v1) && !/\//.test(v1.toString())) {
        events.push(v1);
      }
    });

    const tags: Set<number> = new Set();
    events.forEach((ev) => {
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
          tags.add(TAGS.scroll.was.code);
          break;
        case CLIENT_EVENTS.page.showTours.code:
          tags.add(TAGS.page.tours.code);
          break;
        case CLIENT_EVENTS.click.topBaner.code:
          tags.add(TAGS.events.click_topBaner.code);
          tags.add(TAGS.goals.top.code);
          break;
        case CLIENT_EVENTS.click.copyBookingPhone.code:
          tags.add(TAGS.events.click_copyPhone.code);
          tags.add(TAGS.goals.top.code);
          break;
        case CLIENT_EVENTS.click.bookingForm.code:
          tags.add(TAGS.events.click_bronirivat.code);
          tags.add(TAGS.goals.middle.code);
          break;
        case CLIENT_EVENTS.click.tourFilter.code:
          tags.add(TAGS.events.tourFilter.code);
          break;
        case CLIENT_EVENTS.click.smallSearchTours.code:
          tags.add(TAGS.events.smallSearchTours.code);
          break;
        case CLIENT_EVENTS.page.openTourDetails.code:
          tags.add(TAGS.page.openTourDetails.code);
          break;
        case CLIENT_EVENTS.click.advTourClick.code:
          tags.add(TAGS.events.advTourClick.code);
          break;
      }
    });

    let t = Array.from(tags);
    let isHasSameTags = true;
    if (t.length > 0) {
      if (t.includes(TAGS.page.tours.code) && t.length === 1) {
        t = [TAGS.page.emptyTours.code];
      }
      isHasSameTags = ServerTools.arrays.isSubset(t, guest.tags || []);
    }

    const isHasSameEvents = ServerTools.arrays.isSubset(pageIds, guest.pages || []);
    const toSet: Record<string, any> = {};

    if (t.length > 0 && !isHasSameTags) {
      toSet.tags = t;
    }
    if (fRefEventString || !isHasSameEvents) {
      if (!isHasSameEvents) {
        toSet.pages = pageIds;
      }
      toSet.events = guestEvents;
    }

    if (Object.keys(toSet).length > 0 && guest._id) {
      tagOps.push({
        updateOne: {
          filter: { _id: guest._id },
          update: { $set: toSet },
        },
      });
      tagsChanged++;
    }

    if (tagOps.length >= 500) {
      await Guest.bulkWrite(tagOps, { ordered: false });
      tagOps = [];
    }
  }

  if (tagOps.length > 0) {
    await Guest.bulkWrite(tagOps, { ordered: false });
    tagOps = [];
  }

  const newPagesCount = pagesStatistics.newPages.length;
  if (newPagesCount > 0) {
    await pagesStatistics.saveNewPages();
  }

  // 2. Архивирование 1 уровня
  const archiveCursor = Guest.find({ b: { $exists: false } })
    .select("_id tags level pid projectId lc lastChange ca createdAt tg companyId")
    .sort({ _id: -1 })
    .lean()
    .cursor({ batchSize: 500 });

  let archiveChecked = 0;
  let archivedCount = 0;
  let archiveOps: any[] = [];

  for await (const guestDoc of archiveCursor) {
    archiveChecked++;
    const guest = guestDoc as unknown as IGuest & { pid?: number; ca?: Date; lc?: Date };
    if (!guest) continue;

    let isEmpty = true;
    if (Array.isArray(guest.tags)) {
      const f = ServerTools.arrays.hasIntersection(
        [
          TAGS.scroll.was.code,
          TAGS.page.tours.code,
          TAGS.page.emptyTours.code,
        ],
        guest.tags as number[],
      );
      if (f) isEmpty = false;
    }

    if (!!guest.level && guest.level > 0) isEmpty = false;

    if (isEmpty && guest._id) {
      archivedCount++;
      const lastChange =
        guest.lc ?? guest.lastChange ?? guest.ca ?? guest.createdAt ?? new Date();
      const pid = guest.pid ?? guest.projectId;

      archiveOps.push({
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
              lastChange: "",
              projectId: "",
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
    }

    if (archiveOps.length >= 500) {
      await Guest.bulkWrite(archiveOps, { ordered: false });
      archiveOps = [];
    }
  }

  if (archiveOps.length > 0) {
    await Guest.bulkWrite(archiveOps, { ordered: false });
    archiveOps = [];
  }

  const durationMs = Date.now() - startTime;
  return {
    tagsProcessed,
    tagsChanged,
    newPagesCount,
    archiveChecked,
    archivedCount,
    durationMs,
  };
  } finally {
    isArchiveRunning = false;
  }
}
