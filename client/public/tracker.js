var Tracker = (function(exports) {
  "use strict";
  const API_URL = "https://ishvara-api-7097239392.europe-west1.run.app/api/tracker";
  const STORAGE_ID = "guestID";
  function getCookie(name) {
    const match = document.cookie.match(new RegExp("(^| )" + name + "=([^;]+)"));
    return match && match[2] ? match[2] : "";
  }
  const EVENT_CODE = {
    scroll0: { code: 1 },
    scroll1: { code: 2 },
    scroll2: { code: 3 },
    scroll3: { code: 4 },
    scroll4: { code: 5 },
    scroll5: { code: 6 },
    inPage: { code: 8 },
    //Вход на страницу
    outPage: { code: 9 },
    //Выход со страницы
    goalBtnClick: { code: 10 },
    //Клик по кнопке цели
    showPage: { code: 11 },
    //Показ страницы
    goalBtnGaude: { code: 12 }
    //Открыли гайд
  };
  class Guest {
    _id = null;
    isFirstInPage = true;
    startTime = /* @__PURE__ */ new Date();
    events = [];
    scrollLever = 0;
    constructor() {
      if (!EVENT_CODE) {
        console.error("EVENT_CODE is not defined");
        return;
      }
      setInterval(() => this.flush(), 3e3);
      document.addEventListener("visibilitychange", () => {
        if (document.visibilityState === "hidden") {
          this.track(EVENT_CODE.outPage.code);
          this.flush(/* @__PURE__ */ new Date());
        }
        if (document.visibilityState === "visible") {
          this.startTime = /* @__PURE__ */ new Date();
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
        this.onInPage();
      };
      window.addEventListener("popstate", () => {
        this.onInPage();
      });
      this.setBaseEvents();
    }
    onInPage() {
      if (this.isFirstInPage) {
        this.isFirstInPage = false;
      } else {
        this.track(EVENT_CODE.outPage.code);
      }
      this.track(EVENT_CODE.inPage.code);
    }
    setBaseEvents() {
      window.addEventListener("scroll", () => {
        let i = Math.round(
          window.scrollY / (document.documentElement.scrollHeight - window.innerHeight) * 100
        );
        i = Math.ceil(i * 6 / 100);
        if (i !== this.scrollLever) {
          this.scrollLever = i;
          const key = `scroll${i}`;
          if (EVENT_CODE[key]) this.track(EVENT_CODE[key].code);
        }
      });
      let count = 0;
      const checkFbq = setInterval(() => {
        count++;
        const isPixel = typeof window.fbq == "function";
        const fbp = getCookie("_fbp");
        const fbc = getCookie("_fbc");
        if (fbp || fbc) {
          const result = {};
          if (fbp) result.fbp = fbp;
          if (fbc) result.fbc = fbc;
          if (isPixel) result.pixel = "true";
          if (this._id) {
            navigator.sendBeacon(
              API_URL + "/save-cookies",
              new Blob([JSON.stringify({ _id: this._id, result })], {
                type: "application/json"
              })
            );
            clearInterval(checkFbq);
          }
        }
        if (count > 10) {
          clearInterval(checkFbq);
        }
      }, 1e3);
    }
    async init() {
      const urlParams = new URLSearchParams(window.location.search);
      let guestID = urlParams.get("g");
      if (!guestID) guestID = localStorage.getItem(STORAGE_ID);
      this._id = guestID;
      const data = {
        _id: this._id || void 0,
        createdAt: /* @__PURE__ */ new Date(),
        userAgentString: navigator.userAgent,
        urlParamsString: window.location.search.slice(1),
        projectId: window.trackerProjectID
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
          body: JSON.stringify(data)
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
    track(code) {
      const sec = Math.round((Date.now() - this.startTime.getTime()) / 100) / 10;
      if (code === EVENT_CODE.inPage.code) {
        this.events.push(["t" + (/* @__PURE__ */ new Date()).getTime(), window.location.pathname]);
        return;
      }
      this.events.push([sec, code]);
    }
    flushForData(url, data) {
      if (!this._id) return;
      navigator.sendBeacon(
        API_URL + url,
        new Blob([JSON.stringify({ _id: this._id, data })], {
          type: "application/json"
        })
      );
    }
    // отправляем накопленное и чистим
    flush(lastChange = null) {
      if (this.events.length === 0) return;
      if (!this._id) return;
      const payload = [...this.events];
      this.events = [];
      navigator.sendBeacon(
        API_URL + "/push-events",
        new Blob(
          [JSON.stringify({ _id: this._id, events: payload, lastChange })],
          { type: "application/json" }
        )
      );
    }
  }
  const guest = new Guest();
  guest.init();
  window.guest = guest;
  window.guestTrack = (code) => {
    if (typeof code === "string") {
      const i = EVENT_CODE[code];
      if (i) code = i.code;
    }
    guest.track(code);
  };
  exports.EVENT_CODE = EVENT_CODE;
  Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
  return exports;
})({});
