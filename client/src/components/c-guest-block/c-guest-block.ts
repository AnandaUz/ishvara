import type { IGuest } from "@shared/types/IGuest";
import "./c-guest-block.scss";
// import guest from "@/services/tracker.services";
// import template from "./c-guest-block.html?raw";
import { getTimeStr } from "@/services/tools";
import { api } from "@/services/api";
import {
  META_EVENT_LEVEL_BY_CODE,
  EVENT_CODE,
  EVENT_BY_CODE,
  META_EVENT_BY_CODE,
} from "@shared/types/GuestConst";
import type { TGuestsBlock } from "../c-guests-block/c-guests-block";
import type { IPixelEventData } from "@shared/types/Is";
import { projectsManager } from "@/features/projectsManager";

export class CGuestBlock extends HTMLElement {
  data: IGuest;
  owner: TGuestsBlock;
  // private _levelBehavior: number = 0;
  async sendMetaEvent(tag: number) {
    if (this.levelBehavior === tag) return true;

    const activeProject = projectsManager.activeProject;
    if (!activeProject?.config.companyPageURL) return false;

    const eventName = META_EVENT_LEVEL_BY_CODE[tag]!;
    const eventTime = Math.floor(Date.now() / 1000); //this.data.lastChange;
    const eventObj = META_EVENT_BY_CODE[tag]!;

    const userData = this.data;
    const data: IPixelEventData = {
      event_name: eventName,
      event_time: eventTime,
      event_source_url: activeProject.config.companyPageURL,
      action_source: "website",
      user_data: {},
      event_id: "init_123",
    };

    data.custom_data = {
      content_name: this.data.instagram?.comp_name || "",
    };
    if (eventObj && "value" in eventObj && eventObj.value) {
      data.custom_data = {
        ...data.custom_data,
        currency: "USD",
        value: eventObj.value,
      };
    }
    if (userData?.instagram?.fbp) data.user_data.fbp = userData.instagram.fbp;
    if (userData?.instagram?.fbc) data.user_data.fbc = userData.instagram.fbc;

    if (userData?.userAgentString)
      data.user_data.client_user_agent = userData.userAgentString;

    const res = await api.guest.sendMetaEvent([data]);
    if (res.ok) {
      const res2 = await api.guest.addTag(this.data._id, tag);
      if (res2.ok) {
        if (!this.data.tags) this.data.tags = [];
        this.data.tags.push(tag);
        // this._levelBehavior = tag;
        this.render();
        return true;
      }
    }
    return false;
  }
  get levelBehavior() {
    let t = 0;
    for (let i = 1; i < 8; i++) {
      if (this.data.tags?.includes(i)) {
        t = i;
      }
    }
    return t;
  }
  render() {
    const data = this.data;
    const owner = this.owner;
    this.innerHTML = "";
    const bg = document.createElement("div");
    bg.classList.add("bg");
    this.appendChild(bg);
    for (let i = 0; i < 7; i++) {
      const bgItem = document.createElement("div");
      bgItem.classList.add("bgg", "bg" + i);
      bg.appendChild(bgItem);
    }
    if (data.tags?.includes(1)) {
      bg.classList.add("l1");
    }
    if (data.tags?.includes(2)) {
      bg.classList.add("l2");
    }
    if (data.tags?.includes(3)) {
      bg.classList.add("l3");
    }
    if (data.tags?.includes(4)) {
      bg.classList.add("l4");
    }
    if (data.tags?.includes(5)) {
      bg.classList.add("l5");
    }
    if (data.tags?.includes(6)) {
      bg.classList.add("l6");
    }
    if (data.tags?.includes(7)) {
      bg.classList.add("l7");
    }

    const body = document.createElement("div");
    body.classList.add("body");
    this.appendChild(body);

    this.data = data;
    this.owner = owner;

    let companyString = "";
    if (this.data.instagram?.comp_name) {
      companyString = `<span class='comp-name'>${this.data.instagram?.comp_name}</span><span class='adset-name'>${this.data.instagram?.adset_name}</span><span class='ad-name'>${this.data.instagram?.ad_name}</span>`;
    }
    let cookieString = "";
    {
      const isFbc = this.data.instagram?.fbc;
      const isFbp = this.data.instagram?.fbp;
      cookieString += `<span class="${isFbc ? "ok" : ""}"></span>`;
      cookieString += `<span class="${isFbp ? "ok" : ""}"></span>`;
    }
    const paramsString = this.data.paramsString || "";
    const createdAt = new Date(this.data.createdAt);
    const lastChange = new Date(this.data.lastChange);
    let duration = "";
    if (this.data.createdAt && this.data.lastChange) {
      const d = (lastChange.getTime() - createdAt.getTime()) / 1000;
      if (d > 60) {
        duration = (d / 60).toFixed(1) + "m";
      } else {
        duration = d.toFixed(1) + "s";
      }
    }
    let id = this.data._id;
    if (this.data.name) id = `<div class='withName'>${this.data.name}</div>`;

    body.innerHTML = `            
    <div class='id'>${id}</div>
    <div class='create-time'>${getTimeStr(this.data.createdAt)}</div>
    <div class='last-change'>${getTimeStr(this.data.lastChange)}</div>
    <div class='duration'>${duration}</div>
    <div class='company-string'>${companyString}</div>
    <div class='cookie-string'>${cookieString}</div>
    <div class='params-string'>${paramsString}</div>

    <div class='events-bl'></div>`;

    const btn_delete = document.createElement("button");
    btn_delete.className = "btn sml-btn btn-delete";
    btn_delete.addEventListener("click", async () => {
      const res = await api.guest.delete(this.data._id);
      if (res.ok) {
        this.remove();
      }
    });
    body.appendChild(btn_delete);

    const btn_gear = document.createElement("button");
    btn_gear.className = "btn sml-btn btn-gear";
    btn_gear.addEventListener("click", async (e: MouseEvent) => {
      e.stopPropagation(); // чтобы не закрылся сразу
      this.owner.menu!.toggle(btn_gear, this);
    });
    body.appendChild(btn_gear);

    const eventsBl = body.querySelector(".events-bl");

    let t = 0;
    const k = 40; // 20 пикселей на секунду
    for (let i = 0; i < this.data.events!.length; i++) {
      const event = this.data.events![i];
      if (!event) continue;
      const eventElement = document.createElement("div");
      eventElement.classList.add("event");

      let newStarTime = null;
      let time = 0;
      let kod = "";
      if (typeof event[0] === "string") {
        kod = event[0][0] || "";
        switch (kod) {
          case "t":
            newStarTime = new Date(Number(event[0].slice(1)));

            break;

          default:
            break;
        }
      } else {
        time = Number(event[0]);
      }

      if (kod === "t") {
        if (i > 0) {
          const blBR = document.createElement("br");
          eventsBl?.appendChild(blBR);
        }
        eventElement.innerHTML = `<span></span><span class='page-name'>${event![1]}</span>`;
        if (newStarTime) {
          eventElement.innerHTML += `<span class='time'>${getTimeStr(newStarTime)}</span>`;
        }
        eventElement.className += " " + "page-in";
      } else {
        let xx = time - t;

        if (xx > 20) {
          eventElement.classList.add("ex-scale");
          xx = 1;
        } else {
          const dT = 1;
          if (xx > dT) {
            let ii = 0;
            const n = Math.floor(xx / dT);
            for (; ii < n; ii++) {
              const eventElement = document.createElement("div");
              eventElement.classList.add("event");
              // eventElement.classList.add('scale');
              eventElement.style.width = k + "px";
              eventsBl?.appendChild(eventElement);
            }
            xx -= n * dT;
          }
        }

        eventElement.style.width = Math.max(xx * k, 7) + "px";

        if (event[1] === "goalBtnClick") {
          event[1] = EVENT_CODE.goalBtnClick.code;
        }

        switch (event[1]) {
          case EVENT_CODE.outPage!.code:
            eventElement.innerHTML = `<span></span><i class='time'>${time.toFixed(1)}</i>`;
            eventElement.className += " " + EVENT_CODE.outPage!.class!;
            break;
          default:
            const eventItem = EVENT_BY_CODE[event[1]];
            if (eventItem && eventItem.class) {
              eventElement.className += " " + eventItem.class;
            } else {
            }
            eventElement.innerHTML = `<span></span>`;
            break;
        }
      }

      eventsBl?.appendChild(eventElement);

      t = time;
    }
  }
  constructor(data: IGuest, owner: TGuestsBlock) {
    super();

    this.classList.add("guest-bl");
    this.data = data;
    this.owner = owner;
    this.render();
  }
  async connectedCallback() {
    // const guest = this.getAttribute('data-guest') || '';
    // this.innerHTML = template.replace('{{guest}}', guest);
  }
}

customElements.define("c-guest-block", CGuestBlock);
