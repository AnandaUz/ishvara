/**
 * Кодек 2-байтовой побитовой упаковки событийIshvara
 * Каждое внутристраничное событие пакуется ровно в 2 байта (16 бит):
 * [ Биты 15..10: Код события (6 бит, 0..63) ] [ Биты 9..0: Дельта времени Δt (10 бит, 0..1023) ]
 */

export const EVENT_DICTIONARY: Array<string | number> = [
  "", // 0: Маркер смены страницы (["t...", pageId])
  "D", // 1
  "U", // 2
  2, // 3
  9, // 4
  "c", // 5
  3, // 6
  4, // 7
  1, // 8
  5, // 9
  11, // 10
  6, // 11
  "inner-routing", // 12
  "tours-show", // 13
  "open-tour-details", // 14
  "small-search-tours", // 15
  "tour-filter", // 16
  "show-booking-form", // 17
  7, // 18
  "adv-tour-click", // 19
  "c-tBaner", // 20
  "tour-go-to-firm", // 21
  "tours-search", // 22
  "copy-firm-phone", // 23
  10, // 24
  "copy-firm-email", // 25
  "tour-filter-mobile", // 26
  "show-tour-firm-contacts", // 27
  "copy-booking-phone", // 28
  "tours-ordering", // 29
  "tour-set-like", // 30
  "v:start", // 31
  "v:half", // 32
  "v:complete", // 33
  "btnMaps", // 34
  12, // 35
  "/meditation", // 36
  "goalBtnClick", // 37
];

const CODE_TO_ID = new Map<string | number, number>();
const ID_TO_CODE = new Map<number, string | number>();

EVENT_DICTIONARY.forEach((code, id) => {
  if (id > 0) {
    CODE_TO_ID.set(code, id);
    if (typeof code === "number") {
      CODE_TO_ID.set(String(code), id);
    } else if (!isNaN(Number(code)) && String(code).trim() !== "") {
      CODE_TO_ID.set(Number(code), id);
    }
    ID_TO_CODE.set(id, code);
  }
});

export type TEventItem = [number | string, number | string];

/**
 * Упаковка массива событий в бинарный Uint8Array
 */
export function encode2ByteEvents(events: Array<TEventItem>): Uint8Array {
  if (!events || events.length === 0) {
    return new Uint8Array(0);
  }

  let lastSec = 0;
  const bytes: number[] = [];

  for (let i = 0; i < events.length; i++) {
    const ev = events[i];
    if (!ev || ev.length < 2) continue;

    const rawTime = ev[0];
    const rawCode = ev[1];

    // Событие смены страницы
    if (typeof rawTime === "string" && rawTime.startsWith("t")) {
      const ts = Number(rawTime.slice(1)) || Date.now();
      let pageId = typeof rawCode === "number" ? rawCode : parseInt(String(rawCode), 10);
      if (isNaN(pageId) || pageId < 0) pageId = 0;
      if (pageId > 65535) pageId = 65535;

      // 10-байтный заголовок:
      // 0x0000 (маркер смены страницы)
      bytes.push(0, 0);

      // 6 байт timestamp BE (48 бит)
      const bigTs = BigInt(ts);
      bytes.push(
        Number((bigTs >> 40n) & 0xffn),
        Number((bigTs >> 32n) & 0xffn),
        Number((bigTs >> 24n) & 0xffn),
        Number((bigTs >> 16n) & 0xffn),
        Number((bigTs >> 8n) & 0xffn),
        Number(bigTs & 0xffn),
      );

      // 2 байта pageId BE (16 бит)
      bytes.push((pageId >> 8) & 0xff, pageId & 0xff);

      lastSec = 0;
      continue;
    }

    // Внутристраничное событие
    const currentSec = typeof rawTime === "number" ? rawTime : Number(rawTime) || 0;
    let deltaSec = currentSec - lastSec;
    if (deltaSec < 0) deltaSec = 0;

    let deltaTenths = Math.round(deltaSec * 10);

    // Пауза больше 102.3 сек (deltaTenths > 1023)
    while (deltaTenths > 1023) {
      const pauseWord = (63 << 10) | 1023;
      bytes.push((pauseWord >> 8) & 0xff, pauseWord & 0xff);
      deltaTenths -= 1023;
    }

    let codeId = CODE_TO_ID.get(rawCode);
    if (codeId === undefined) {
      if (typeof rawCode === "string" && !isNaN(Number(rawCode))) {
        codeId = CODE_TO_ID.get(Number(rawCode));
      } else if (typeof rawCode === "number") {
        codeId = CODE_TO_ID.get(String(rawCode));
      }
    }

    if (codeId === undefined || codeId <= 0 || codeId > 61) {
      codeId = 62; // fallback
    }

    const word = ((codeId & 0x3f) << 10) | (deltaTenths & 0x3ff);
    bytes.push((word >> 8) & 0xff, word & 0xff);

    lastSec = currentSec;
  }

  return new Uint8Array(bytes);
}

/**
 * Распаковка бинарного буфера в массив событий
 */
export function decode2ByteEvents(buf: Uint8Array | any): Array<TEventItem> {
  if (!buf || buf.length === 0) {
    return [];
  }

  const events: Array<TEventItem> = [];
  const len = buf.length;
  let offset = 0;
  let currentSec = 0;

  while (offset + 1 < len) {
    const b0 = buf[offset];
    const b1 = buf[offset + 1];
    const word = (b0 << 8) | b1;
    const code = (word >> 10) & 0x3f;
    const delta = word & 0x3ff;

    if (code === 0) {
      // Заголовок страницы: 10 байт
      if (offset + 10 <= len) {
        let tsBig = 0n;
        for (let i = 2; i < 8; i++) {
          tsBig = (tsBig << 8n) | BigInt(buf[offset + i]);
        }
        const pageId = (buf[offset + 8] << 8) | buf[offset + 9];
        events.push(["t" + tsBig.toString(), pageId]);
        offset += 10;
        currentSec = 0;
        continue;
      } else {
        break;
      }
    }

    if (code === 63) {
      // Маркер паузы: увеличиваем время без генерации события
      currentSec += delta / 10;
      offset += 2;
      continue;
    }

    currentSec += delta / 10;
    const time = Math.round(currentSec * 10) / 10;
    const decodedCode = ID_TO_CODE.get(code) ?? (code === 62 ? "unknown" : code);
    events.push([time, decodedCode]);
    offset += 2;
  }

  return events;
}

/**
 * Приведение любых форматов событий к стандартному массиву [ [время, код], ... ]
 */
export function normalizeEvents(rawEvents: any): Array<TEventItem> {
  if (!rawEvents) return [];

  if (Array.isArray(rawEvents)) {
    if (
      rawEvents.length > 0 &&
      typeof rawEvents[0] === "number" &&
      !Array.isArray(rawEvents[0])
    ) {
      return decode2ByteEvents(new Uint8Array(rawEvents));
    }
    return rawEvents;
  }

  if (
    rawEvents instanceof Uint8Array ||
    (typeof Buffer !== "undefined" && Buffer.isBuffer(rawEvents))
  ) {
    return decode2ByteEvents(rawEvents);
  }

  if (rawEvents._bsontype === "Binary" || rawEvents.sub_type !== undefined) {
    if (rawEvents.buffer) {
      return decode2ByteEvents(rawEvents.buffer);
    }
    if (typeof rawEvents.value === "function") {
      return decode2ByteEvents(rawEvents.value(true));
    }
  }

  if (
    typeof rawEvents === "object" &&
    rawEvents.type === "Buffer" &&
    Array.isArray(rawEvents.data)
  ) {
    return decode2ByteEvents(new Uint8Array(rawEvents.data));
  }

  if (rawEvents.buffer && rawEvents.buffer instanceof ArrayBuffer) {
    return decode2ByteEvents(
      new Uint8Array(
        rawEvents.buffer,
        rawEvents.byteOffset || 0,
        rawEvents.byteLength !== undefined
          ? rawEvents.byteLength
          : rawEvents.buffer.byteLength,
      ),
    );
  }

  if (typeof rawEvents === "string") {
    const trimmed = rawEvents.trim();
    if (!trimmed) return [];
    if (trimmed.startsWith("[") || trimmed.startsWith("{")) {
      try {
        const parsed = JSON.parse(trimmed);
        return normalizeEvents(parsed);
      } catch {
        return [];
      }
    }
    try {
      if (typeof Buffer !== "undefined") {
        return decode2ByteEvents(Buffer.from(trimmed, "base64"));
      } else if (typeof atob === "function") {
        const binStr = atob(trimmed);
        const bytes = new Uint8Array(binStr.length);
        for (let i = 0; i < binStr.length; i++) {
          bytes[i] = binStr.charCodeAt(i);
        }
        return decode2ByteEvents(bytes);
      }
    } catch {
      return [];
    }
  }

  return [];
}
