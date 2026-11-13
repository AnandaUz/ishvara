import Guest from "../models/Guest.js";

const MOBILE_REGEX = /Mobi|Android|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i;

export interface ICleanupResult {
  processed: number;
  mobileCount: number;
  desktopCount: number;
  keptLvl3Count: number;
}

export async function cleanupUserAgents(): Promise<ICleanupResult> {
  const keptLvl3Count = await Guest.countDocuments({
    level: { $gte: 3 },
    userAgentString: { $exists: true, $nin: [null, ""] },
  });

  const cursor = Guest.find({
    userAgentString: { $exists: true, $nin: [null, ""] },
    $or: [{ level: { $lt: 3 } }, { level: { $exists: false } }, { level: null }],
  })
    .select({ _id: 1, userAgentString: 1 })
    .lean()
    .cursor();

  const BATCH_SIZE = 1000;
  let operations: Array<any> = [];
  let processed = 0;
  let mobileCount = 0;
  let desktopCount = 0;

  for await (const doc of cursor) {
    const isMobile = doc.userAgentString ? MOBILE_REGEX.test(doc.userAgentString) : false;
    const updateDoc: Record<string, any> = {
      $unset: { userAgentString: "" },
    };

    if (isMobile) {
      updateDoc.$set = { iM: true };
      mobileCount++;
    } else {
      desktopCount++;
    }

    operations.push({
      updateOne: {
        filter: { _id: doc._id },
        update: updateDoc,
      },
    });

    if (operations.length >= BATCH_SIZE) {
      await Guest.bulkWrite(operations);
      processed += operations.length;
      operations = [];
    }
  }

  if (operations.length > 0) {
    await Guest.bulkWrite(operations);
    processed += operations.length;
    operations = [];
  }

  return {
    processed,
    mobileCount,
    desktopCount,
    keptLvl3Count,
  };
}

let cronInterval: NodeJS.Timeout | null = null;
let lastRunWeek = -1;

export function initGuestCleanupCron(): void {
  if (cronInterval) return;

  // Проверка каждый час: запуск в воскресенье (day === 0) в 03:00 ночи
  cronInterval = setInterval(async () => {
    const now = new Date();
    const currentWeek = Math.floor(now.getTime() / (7 * 24 * 60 * 60 * 1000));

    if (now.getDay() === 0 && now.getHours() === 3 && lastRunWeek !== currentWeek) {
      lastRunWeek = currentWeek;
      console.log("[CRON] Starting weekly userAgent cleanup...");
      try {
        const result = await cleanupUserAgents();
        console.log("[CRON] Weekly userAgent cleanup finished:", result);
      } catch (err) {
        console.error("[CRON] Weekly userAgent cleanup failed:", err);
      }
    }
  }, 60 * 60 * 1000);
}
