const API_URL =
  "https://ishvara-api-7097239392.europe-west1.run.app" + "/api/tracker";

const STORAGE_ID = "guestID";

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
  return match && match[2] ? match[2] : "";
}
interface IEventCodeItem {
  name?: string;
  code: number;
  title?: string;
  color?: string;
  class?: string;
}
export const EVENT_CODE = {
  scroll0: { code: 1 },
  scroll1: { code: 2 },
  scroll2: { code: 3 },
  scroll3: { code: 4 },
  scroll4: { code: 5 },
  scroll5: { code: 6 },
  inPage: { code: 8 }, //Вход на страницу
  outPage: { code: 9 }, //Выход со страницы
  goalBtnClick: { code: 10 }, //Клик по кнопке цели
  showPage: { code: 11 }, //Показ страницы
  goalBtnGaude: { code: 12 }, //Открыли гайд
} as const satisfies Record<string, IEventCodeItem>;

type TEventItem = [number | string, number | string];
interface IInitData {
  _id?: string | undefined;
  createdAt?: Date;
  userAgentString?: string;
  urlParamsString?: string;
  referrer?: string;
  projectId?: string;
  name?: string;
}

class Guest {
  private _id: string | null = null;
  private isFirstInPage = true;
  private isInit = false;

  startTime: Date = new Date();
  events: TEventItem[] = [];
  scrollLever: number = 0;

  constructor() {
    if (!EVENT_CODE) {
      console.error("EVENT_CODE is not defined");
      return;
    }
    setInterval(() => this.flush(), 3_000);

    if (document.visibilityState === "visible") {
      this.isInit = true;
      this.startTime = new Date();
      this.track(EVENT_CODE.showPage.code);
    }

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.track(EVENT_CODE.outPage.code);
        this.flush(new Date());
        this.isInit = false;
      }
      if (document.visibilityState === "visible") {
        if (!this.isInit) {
          this.isInit = true;
          this.startTime = new Date();
          this.track(EVENT_CODE.showPage.code);
        }
      }
    });
    this.setBaseEvents();

    window.addEventListener("pagerendered", () => {
      if (this.isFirstInPage) {
        this.isFirstInPage = false;
      } else {
        this.track(EVENT_CODE.outPage.code);
      }
      this.track(EVENT_CODE.inPage.code);
    });
  }
  setBaseEvents() {
    window.addEventListener("scroll", () => {
      let i = Math.round(
        (window.scrollY /
          (document.documentElement.scrollHeight - window.innerHeight)) *
          100,
      );
      i = Math.ceil((i * 6) / 100);

      if (i !== this.scrollLever) {
        this.scrollLever = i;
        const key = `scroll${i}` as keyof typeof EVENT_CODE;
        if (EVENT_CODE[key]) this.track(EVENT_CODE[key]!.code);
      }
    });
    let count = 0;
    const checkFbq = setInterval(() => {
      count++;

      const isPixel = typeof (window as any).fbq == "function";
      const fbp = getCookie("_fbp");
      const fbc = getCookie("_fbc");

      if (fbp || fbc) {
        const result: Record<string, string> = {};
        if (fbp) result.fbp = fbp;
        if (fbc) result.fbc = fbc;
        if (isPixel) result.pixel = "true";

        if (this._id) {
          navigator.sendBeacon(
            API_URL + "/save-cookies",
            new Blob([JSON.stringify({ _id: this._id, result })], {
              type: "application/json",
            }),
          );
          clearInterval(checkFbq);
        }
      }
      if (count > 10) {
        clearInterval(checkFbq);
      }
    }, 1000);
  }

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    let guestID = urlParams.get("g");
    if (!guestID) guestID = localStorage.getItem(STORAGE_ID);

    this._id = guestID;

    const data: IInitData = {
      _id: this._id || undefined,
      createdAt: new Date(),
      userAgentString: navigator.userAgent,
      urlParamsString: window.location.search.slice(1),
      projectId: (window as any).trackerProjectID,
    };
    const name = urlParams.get("name");
    if (name) {
      data.name = name;
    }
    if (document.referrer) {
      const url = new URL(document.referrer);
      data.referrer = url.pathname;
    }
    try {
      const response = await fetch(API_URL + "/start", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) throw new Error("Failed to init session");

      const newData = await response.json();

      if (newData._id) {
        localStorage.setItem(STORAGE_ID, newData._id);
        this._id = newData._id;

        this.flush();
        return newData._id;
      }
    } catch (err) {
      console.error("Session init error:", err);
      return null;
    }
  }
  track(code: number | string) {
    const sec = Math.round((Date.now() - this.startTime.getTime()) / 100) / 10;
    if (code === EVENT_CODE.inPage.code) {
      this.events.push(["t" + new Date().getTime(), window.location.pathname]);
      return;
    }
    this.events.push([sec, code]);
  }
  flushForData(url: string, data: any) {
    if (!this._id) return;

    navigator.sendBeacon(
      API_URL + url,
      new Blob([JSON.stringify({ _id: this._id, data })], {
        type: "application/json",
      }),
    );
  }
  // отправляем накопленное и чистим
  flush(lastChange: Date | null = null) {
    if (this.events.length === 0) return;
    if (!this._id) return;

    const payload = [...this.events]; // копия
    this.events = []; // очищаем сразу

    navigator.sendBeacon(
      API_URL + "/push-events",
      new Blob(
        [JSON.stringify({ _id: this._id, events: payload, lastChange })],
        { type: "application/json" },
      ),
    );
  }
}
const guest = new Guest();
guest.init();
(window as any).guest = guest;

(window as any).guestTrack = (code: number | string) => {
  if (typeof code === "string") {
    const i = EVENT_CODE[code as keyof typeof EVENT_CODE];
    if (i) code = i.code;
  }
  guest.track(code);
};
