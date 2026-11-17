const API_URL =
  "https://ishvara-api-7097239392.europe-west1.run.app" + "/api/tracker";

// const API_URL = "http://localhost:1020" + "/api/tracker";

const STORAGE_ID = "guestID";

function getCookie(name: string): string {
  const match = document.cookie.match(new RegExp("(?:^|; )" + name + "=([^;]+)"));
  return match && match[1] ? decodeURIComponent(match[1]) : "";
}
interface IEventCodeItem {
  name?: string;
  code: number;
  title?: string;
  color?: string;
  class?: string;
}
const EVENT_CODE = {
  scroll0: { code: 1 },
  scroll1: { code: 2 },
  scroll2: { code: 3 },
  scroll3: { code: 4 },
  scroll4: { code: 5 },
  scroll5: { code: 6 },
  scroll6: { code: 7 },
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

  startTime: Date = new Date();
  events: TEventItem[] = [];
  scrollLever: number = 0;
  private hasFirstScroll = false;
  private lastScrollY = 0;

  constructor() {
    setInterval(() => this.flush(), 2_000);
    //---------------------

    document.addEventListener("visibilitychange", () => {
      if (document.visibilityState === "hidden") {
        this.track(EVENT_CODE.outPage.code);
        this.flush(new Date());
      }
      if (document.visibilityState === "visible") {
        this.startTime = new Date();
        this.track(EVENT_CODE.showPage.code);
      }
    });
    if (document.readyState === "loading") {
      document.addEventListener("DOMContentLoaded", () => {
        this.onInPage();
      });
    } else {
      this.onInPage();
    }
    const originalPushState = history.pushState.bind(history);
    history.pushState = (...args) => {
      originalPushState(...args);
      this.onInPage(); // новая страница
    };

    window.addEventListener("popstate", () => {
      this.onInPage(); // кнопки назад/вперёд
    });
    //---------------------
    this.setBaseEvents();
  }
  onInPage() {
    this.hasFirstScroll = false;
    this.lastScrollY = 0;
    this.scrollLever = 0;
    if (this.isFirstInPage) {
      this.isFirstInPage = false;
    } else {
      this.track(EVENT_CODE.outPage.code);
    }
    this.track(EVENT_CODE.inPage.code);
  }

  setBaseEvents() {
    const yShag = 600;
    window.addEventListener(
      "scroll",
      () => {
        const maxScroll =
          document.documentElement.scrollHeight - window.innerHeight;
        if (maxScroll <= 0) return;

        let i = Math.round((window.scrollY / maxScroll) * 100);
        i = Math.ceil((i * 6) / 100);

        if (i !== this.scrollLever) {
          this.scrollLever = i;
          const key = `scroll${i}` as keyof typeof EVENT_CODE;
          if (EVENT_CODE[key]) this.track(EVENT_CODE[key]!.code);
        }

        const currentY = window.scrollY;
        if (!this.hasFirstScroll && currentY >= 5) {
          this.track("D");
          this.hasFirstScroll = true;
          this.lastScrollY = currentY;
        } else if (
          this.hasFirstScroll &&
          Math.abs(currentY - this.lastScrollY) >= yShag
        ) {
          this.track(currentY > this.lastScrollY ? "D" : "U");
          this.lastScrollY = currentY;
        }
      },
      { passive: true },
    );

    let count = 0;
    const checkFbq = setInterval(() => {
      count++;
      if (this.sendCookies() || count > 15) {
        clearInterval(checkFbq);
      }
    }, 1000);

    document.addEventListener("click", () => {
      this.track("c");
    });
  }

  sendCookies(): boolean {
    if (!this._id) return false;
    const isPixel = typeof (window as any).fbq == "function";
    const fbp = getCookie("_fbp");
    const fbc = getCookie("_fbc");

    if (fbp || fbc) {
      const result: Record<string, string> = {};
      if (fbp) result.fbp = fbp;
      if (fbc) result.fbc = fbc;
      if (isPixel) result.pixel = "true";

      navigator.sendBeacon(
        API_URL + "/save-cookies",
        new Blob([JSON.stringify({ _id: this._id, result })], {
          type: "application/json",
        }),
      );
      return true;
    }
    return false;
  }

  async init() {
    const urlParams = new URLSearchParams(window.location.search);
    /* если в строке есть параметры
    g={ObjectId} - устанавливает этот айди для пользователя на этом устройстве
    это нужно, когда пользователь заходит с разных устройств. Если он на одном зарегался,
    то можно послыть ссылку на др. страницы, не волнуясь что на неё он пройдёт с др. устройства.
    k=3-2-1 - так можно указать к какой компании (реализованно на сервере)
    первое число, это id компании
    второе - adsets - тут указывает название разных эддсетов. Добавив эдсет "из инстаграмма"
    можно видеть кто прошёл именно отуда
    n={string} - задать имя гостю в базе по этому id (реализованно на сервере)
    */
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
    const name = urlParams.get("n") || urlParams.get("name");
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
        this.sendCookies();
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

    const sent = navigator.sendBeacon(
      API_URL + "/push-events",
      new Blob(
        [JSON.stringify({ _id: this._id, events: payload, lastChange })],
        { type: "application/json" },
      ),
    );
    if (sent) {
      this.events = this.events.slice(payload.length);
    }
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
