import "../../../_base/server/config.js";
import { connectDB } from "../../../_base/server/db.js";
import Guest from "../models/Guest.js";
import { PagesStatistics } from "../services/hourlyProcessor.service.js";
import { encode2ByteEvents } from "../../../shared/utils/eventCodec.js";
import mongoose from "mongoose";

export async function runMigration() {
  console.log("=== Старт миграции: 2-байтовая упаковка событий и сжатие полей ===");
  const startTime = Date.now();

  await connectDB();
  const collection = Guest.collection;

  // 1. Переименование ключевых полей и удаление __v
  console.log("\n[1/4] Переименование полей: lastChange -> lc, createdAt -> ca, projectId -> pid, удаление __v...");
  const renameResult = await collection.updateMany(
    {},
    {
      $rename: {
        lastChange: "lc",
        createdAt: "ca",
        projectId: "pid",
      },
      $unset: { __v: "" },
    },
  );
  console.log(`[1/4] Переименовано документов: ${renameResult.modifiedCount}`);

  // 2. Упаковка events в 2-байтовый Buffer
  console.log("\n[2/4] Проход по записям с events в виде массива и упаковка в Buffer...");
  const pagesStatistics = new PagesStatistics();
  await pagesStatistics.init();

  const cursor = collection
    .find({ events: { $type: "array" } }, { projection: { _id: 1, events: 1, pages: 1 } })
    .batchSize(500);

  let packedCount = 0;
  let bulkOps: any[] = [];
  const BATCH_SIZE = 500;

  for await (const doc of cursor) {
    const rawEvents = doc.events;
    const pageIds: number[] = [];

    if (Array.isArray(rawEvents) && rawEvents.length > 0) {
      for (const val of rawEvents) {
        if (!val || val.length < 2) continue;
        const v0 = val[0];
        const v1 = val[1];

        if (v0 && typeof v0 === "string" && v0.startsWith("t")) {
          let ind: number | null = null;
          if (typeof v1 === "string") {
            ind = pagesStatistics.findOrCreatePage(v1);
            val[1] = ind;
          } else if (typeof v1 === "number") {
            ind = v1;
          }
          if (ind !== null && typeof ind === "number" && !pageIds.includes(ind)) {
            pageIds.push(ind);
          }
        }
      }

      const packedUint8 = encode2ByteEvents(rawEvents as any);
      const packedBuf = Buffer.from(
        packedUint8.buffer,
        packedUint8.byteOffset,
        packedUint8.byteLength,
      );

      const mergedPages = Array.from(
        new Set([...(doc.pages || []), ...pageIds]),
      );

      bulkOps.push({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $set: {
              events: packedBuf,
              ...(mergedPages.length > 0 ? { pages: mergedPages } : {}),
            },
          },
        },
      });
    } else {
      // Пустой массив events
      bulkOps.push({
        updateOne: {
          filter: { _id: doc._id },
          update: {
            $unset: { events: "" },
          },
        },
      });
    }

    packedCount++;

    if (bulkOps.length >= BATCH_SIZE) {
      await collection.bulkWrite(bulkOps, { ordered: false });
      bulkOps = [];
      if (packedCount % 5000 === 0) {
        console.log(`[2/4] Обработано событий: ${packedCount}...`);
      }
    }
  }

  if (bulkOps.length > 0) {
    await collection.bulkWrite(bulkOps, { ordered: false });
    bulkOps = [];
  }

  if (pagesStatistics.newPages.length > 0) {
    await pagesStatistics.saveNewPages();
    console.log(`[2/4] Сохранено новых страниц: ${pagesStatistics.newPages.length}`);
  }
  console.log(`[2/4] Всего упаковано записей: ${packedCount}`);

  // 3. Вычистить поле ca (createdAt) и events у пустых ботов (b: true)
  console.log("\n[3/4] Очистка поля ca, createdAt и events у пустых ботов (b: true)...");
  const cleanBotsResult = await collection.updateMany(
    { b: true },
    {
      $unset: {
        ca: "",
        createdAt: "",
        events: "",
        userAgentString: "",
        paramsString: "",
        ip: "",
        name: "",
        referrer: "",
        instagram: "",
      },
    },
  );
  console.log(`[3/4] Очищено документов пустых ботов: ${cleanBotsResult.modifiedCount}`);

  // 4. Удалить пустых ботов старше 14 дней
  console.log("\n[4/4] Удаление пустых ботов (b: true) старше 14 дней...");
  const fourteenDaysAgo = new Date(Date.now() - 14 * 24 * 60 * 60 * 1000);
  const maxObjectId = mongoose.Types.ObjectId.createFromTime(
    Math.floor(fourteenDaysAgo.getTime() / 1000),
  );

  const deleteFilter = {
    b: true,
    _id: { $lt: maxObjectId },
    $or: [
      { lc: { $lt: fourteenDaysAgo } },
      { lastChange: { $lt: fourteenDaysAgo } },
      { lc: { $exists: false }, lastChange: { $exists: false } },
    ],
  };

  const deleteResult = await collection.deleteMany(deleteFilter);
  console.log(`[4/4] Удалено устаревших ботов: ${deleteResult.deletedCount}`);

  const totalDuration = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n=== Миграция успешно завершена за ${totalDuration} сек ===`);
}

// Запуск напрямую
if (process.argv[1]?.includes("migrate_pack_events")) {
  runMigration()
    .then(async () => {
      await mongoose.disconnect();
      process.exit(0);
    })
    .catch(async (err) => {
      console.error("Ошибка при миграции:", err);
      await mongoose.disconnect();
      process.exit(1);
    });
}
