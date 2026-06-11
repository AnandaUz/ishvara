import mongoose, { Schema } from "mongoose";
import { IGuest } from "../../../shared/types/IGuest.js";

interface IGuestDocument extends Omit<IGuest, "_id"> {
  _id: mongoose.Types.ObjectId;
}

const GuestSchema = new Schema<IGuestDocument>(
  {
    // ca = createdAt
    createdAt: { type: Date, default: Date.now, alias: "ca" },

    // lc = lastChange
    lastChange: { type: Date, alias: "lc" },

    // rf = referrer
    referrer: { type: String, alias: "rf" },

    name: { type: String, alias: "n" }, // Если поле короткое, можно оставить как есть

    // ua = userAgentString
    userAgentString: { type: String, alias: "ua" },

    phone: { type: String, alias: "p" },

    // pid = projectId
    projectId: { type: Number, alias: "pi" },

    // Исправили ошибку типизации: для Mongoose указываем массив разрешенных типов
    // cid = companyId
    companyId: { type: Schema.Types.Mixed, alias: "ci" },

    // asid = adsetId
    adsetId: { type: Number, alias: "asi" },

    // aid = adId
    adId: { type: Number, alias: "ai" },

    level: { type: Number, alias: "l" },
    oldId: { type: String, required: false, alias: "oi" },
    ip: { type: String, required: false },

    tg: {
      id: { type: String, alias: "tg.i" },
      first_name: { type: String, alias: "tg.f" },
      last_name: { type: String, alias: "tg.l" },
      username: { type: String, alias: "tg.u" },
    },

    instagram: {
      fbp: { type: String, alias: "ig.p" },
      fbc: { type: String, alias: "ig.c" },
      // Для вложенных объектов алиасы тоже работают!
      // comp_name: { type: Schema.Types.Mixed, alias: "instagram.cn" },
      // adset_name: { type: Schema.Types.Mixed, alias: "instagram.asn" },
      // ad_name: { type: Schema.Types.Mixed, alias: "instagram.an" },
    },

    // ps = paramsString
    paramsString: { type: String, alias: "ps" },

    events: { type: [[Schema.Types.Mixed]], alias: "e" },
    tags: { type: [Number], default: undefined, alias: "t" },
    notes: { type: String, alias: "nt" },

    chat: {
      id: { type: Number, alias: "ch.i" },
      tgbotName: { type: String, alias: "ch.t" },
    },
  },
  {
    // Важно включить, чтобы алиасы корректно преобразовывались в .toJSON() и .toObject()
    toObject: { aliases: true, virtuals: true },
    toJSON: { aliases: true, virtuals: true },
  },
);

// В индексах нужно использовать КОРОТКОЕ имя, которое идет в базу!
GuestSchema.index({ pid: 1 });

export default mongoose.model<IGuestDocument>("Guests", GuestSchema);
