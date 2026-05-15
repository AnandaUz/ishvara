import type { IGuest } from "@shared/types/IGuest";
import "./c-guest-block.scss";
import template from "./c-guest-block.html?raw";
import {
  bigProjects,
  getBProjectCompanyAdsetById,
} from "@shared/projects_config";

import { cleanName, getTimeStr, hashSHA256 } from "@/services/tools";
import { api } from "@/services/api";
import {
  META_EVENT_LEVEL_BY_CODE,
  EVENT_CODE,
  EVENT_BY_CODE,
  META_EVENT_BY_CODE,
} from "@shared/types/GuestConst";
import type { IPixelEventData } from "@shared/types/Is";

import type { CGuestsMain } from "@components/c-guests/c-guests-main/c-guests-main";
import { DESC_EVENTS, store } from "@/features/store";
import { chat } from "@/components/c-chats/c-chats";

export class CGuestBlock extends HTMLElement {
  data: IGuest;
  owner: CGuestsMain;
  // private _levelBehavior: number = 0;
  private isRender: boolean = false;
  private body!: HTMLDivElement;
  private timeLineBlock!: HTMLDivElement;
  // private projectConfig?: any;
  private companyConfig?: any;
  private adsetConfig?: any;
  private adConfig?: any;
  async sendMetaEvent(tag: number) {
    if (this.levelBehavior === tag) return true;

    // const activeProject = projectsManager.activeProject;
    // if (!activeProject?.config.companyPageURL) return false;

    const eventName = META_EVENT_LEVEL_BY_CODE[tag]!;
    const eventTime = Math.floor(Date.now() / 1000); //this.data.lastChange;
    const eventObj = META_EVENT_BY_CODE[tag]!;

    const userData = this.data;
    const data: IPixelEventData = {
      event_name: eventName,
      event_time: eventTime,
      event_source_url: this.companyConfig.companyPageURL,
      action_source: "website",
      user_data: {},
      event_id: `eventId_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
    };
    if (userData._id) {
      data.user_data.external_id = userData._id.toString();
    }

    if (userData.ip) {
      data.user_data.client_ip_address = userData.ip;
    }

    const b_adset = getBProjectCompanyAdsetById(
      Number(userData.projectId || 0),
      Number(userData.instagram?.comp_name || 0),
      Number(userData.instagram?.adset_name || 0),
    );

    const city = b_adset?.city;
    const country = b_adset?.country;
    if (city) {
      data.user_data.ct = await hashSHA256(city); // хешируется, lowercase
    }
    if (country) {
      data.user_data.country = await hashSHA256(country); // код страны, тоже хешируется
    }

    if (userData.tg && userData.tg.first_name) {
      data.user_data.fn = await hashSHA256(cleanName(userData.tg.first_name));
    }
    if (userData.tg && userData.tg.last_name) {
      data.user_data.ln = await hashSHA256(cleanName(userData.tg.last_name));
    }

    if (eventObj && "value" in eventObj && eventObj.value) {
      data.custom_data = {
        currency: "USD",
        value: eventObj.value,
        content_name: b_adset?.name || "",
      };
    }
    if (userData?.instagram?.fbp) data.user_data.fbp = userData.instagram.fbp;
    if (userData?.instagram?.fbc) data.user_data.fbc = userData.instagram.fbc;

    if (userData?.userAgentString)
      data.user_data.client_user_agent = userData.userAgentString;

    const pixelData = this.companyConfig.pixel;

    const res = await api.guest.sendMetaEvent([data], pixelData);

    if (res.ok) {
      const res2 = await api.guest.addTag(this.data._id || "dfdf", tag);
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
  set_eventLevel() {
    const bg = this.querySelector(".bg") as HTMLDivElement;
    const data = this.data;

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
  }
  render_eventLevel() {
    const bg = this.querySelector(".bg") as HTMLDivElement;

    for (let i = 0; i < 7; i++) {
      const bgItem = document.createElement("div");
      bgItem.classList.add("bgg", "bg" + i);
      bg.appendChild(bgItem);
    }
  }
  render() {
    const data = this.data;
    const owner = this.owner;
    this.innerHTML = template;
    this.body = this.querySelector(".body")!;
    this.timeLineBlock = this.querySelector(".time-line-block")!;
    this.render_eventLevel();
    this.render_timeLine();
    this.set_eventLevel();

    this.data = data;
    this.owner = owner;

    const body = this.body;

    const setBlock = (name: string, html?: string) => {
      const el = body.querySelector(name) as HTMLDivElement;
      if (!el) throw new Error(`Block ${name} not found`);
      el.innerHTML = html || "";
      return el;
    };

    if (this.data.instagram?.comp_name) {
      if (typeof this.data.projectId === "number") {
        if (this.data.instagram?.comp_name) {
          setBlock(
            ".company-string",
            `<span class='ad-name'>${this.adsetConfig?.name || "🔆"}</span>
            <span class='ad-name'>${this.adConfig?.name || "🔆"}</span>`,
          );
        }
      } else {
        setBlock(
          ".company-string",
          `<span class='adset-name'>${this.data.instagram?.adset_name}</span><span class='ad-name'>${this.data.instagram?.ad_name}</span>`,
        );
      }
    }

    {
      const isFbc = this.data.instagram?.fbc;
      const isFbp = this.data.instagram?.fbp;
      let fbc_fbpString = `
      <span class="${isFbp ? "ok" : ""}"></span>
        <span class="${isFbc ? "ok" : ""}"></span>`;

      const isOldGuest = this.data.oldId
        ? `<span class='old-guest'></span>`
        : "";

      let isBotMark = "";
      if (this.data.userAgentString && isBot(this.data.userAgentString)) {
        isBotMark = `<span class='is-bot'></span>`;
        fbc_fbpString = "";
        this.classList.add("empty");
      }

      setBlock(
        ".cookie-string",
        `
        ${isOldGuest}
        ${fbc_fbpString}
        ${isBotMark}`,
      );
      if (!isFbc && !isFbp && isOldGuest === "") {
        this.classList.add("empty");
      }
    }

    // const d_createdAt = this.data.createdAt
    //   ? new Date(this.data.createdAt)
    //   : null;
    // if (d_createdAt) {
    //   const t = getTimeStr(d_createdAt);
    //   setBlock(".create-time", `${t}`);
    // }

    // const d_lastChange = this.data.lastChange
    //   ? new Date(this.data.lastChange)
    //   : null;
    // if (d_lastChange) {
    //   const t = getTimeStr(d_lastChange);
    //   setBlock(".last-change", `${t}`);
    // }
    // if (d_createdAt && d_lastChange) {
    //   const d = (d_lastChange.getTime() - d_createdAt.getTime()) / 1000;
    //   let duration = "";
    //   if (d > 60) {
    //     duration = (d / 60).toFixed(1) + "m";
    //   } else {
    //     duration = d.toFixed(1) + "s";
    //   }
    //   setBlock(".time-duration", `${duration}`);
    // }

    let name = "";
    if (this.data.name) {
      name = this.data.name;
    } else if (this.data.tg?.first_name) {
      name = this.data.tg.first_name + " " + this.data.tg.last_name;
    }
    setBlock(".name", name).addEventListener("click", async () => {
      this.owner.modalMenu!.open(this);
    });

    if (this.data.tg?.username) {
      const userName = this.data.tg.username.replaceAll("@", "");
      setBlock(
        ".tg-user-name",
        `<a href="https://t.me/${userName}" target="_blank">@${userName}</a>`,
      );
    }

    const btn_delete = body.querySelector(".btn-delete")!;
    btn_delete.addEventListener("click", async () => {
      const res = await api.guest.delete(this.data!._id!);
      if (res.ok) {
        this.remove();
      }
    });

    const btn_info = body.querySelector(".btn-info-circle")!;
    btn_info.addEventListener("click", async () => {
      this.owner.modalMenu!.open(this);
    });

    const btn_gear = body.querySelector(".btn-gear")! as HTMLButtonElement;
    btn_gear.addEventListener("click", async (e: MouseEvent) => {
      e.stopPropagation(); // чтобы не закрылся сразу
      this.owner.menu!.toggle(btn_gear, this);
    });
    const btn_anchor = body.querySelector(".btn-anchor")! as HTMLButtonElement;
    btn_anchor.addEventListener("click", async (e: MouseEvent) => {
      e.stopPropagation(); // чтобы не закрылся сразу
      await navigator.clipboard.writeText(
        `https://esho.uz/location?g=${this.data._id}`,
      );
    });
    // const btn_chat = body.querySelector(".btn-chat")! as HTMLButtonElement;
    // btn_chat.addEventListener("click", async (e: MouseEvent) => {
    //   e.stopPropagation(); // чтобы не закрылся сразу
    //   if (chat) chat.initForGuest(this.data);
    // });

    const notesString = this.querySelector(".notes-string") as HTMLDivElement;
    let oldNotes: string | undefined;
    if (this.data.notes) {
      notesString.innerHTML = this.data.notes;
      oldNotes = this.data.notes;
    }
    const btn_edit = body.querySelector(".btn-edit")! as HTMLButtonElement;
    const activeNotes = () => {
      notesString.contentEditable = "true";
      notesString.classList.add("edit");
      notesString.focus();
    };
    btn_edit.addEventListener("click", async (e: MouseEvent) => {
      e.stopPropagation(); // чтобы не закрылся сразу
      activeNotes();
    });
    notesString.addEventListener("keydown", (e: KeyboardEvent) => {
      if ((e.key === "Enter" && !e.shiftKey) || e.key === "Escape") {
        e.preventDefault();
        notesString.blur(); // сохранение через blur
      }
    });
    notesString.addEventListener("dblclick", async () => {
      activeNotes();
    });
    notesString.addEventListener("blur", async () => {
      notesString.contentEditable = "false";
      notesString.classList.remove("edit");
      const notes = notesString.innerHTML;
      if (!oldNotes || notes !== oldNotes) {
        this.data.notes = notes;
        const res = await api.guest.patchOne(this.data._id!, {
          notes,
        });
        if (!res.ok) {
          alert("Ошибка сохранения заметки!");
        }
      }
    });
  }
  render_timeLine() {
    const timeLineBlock = this.timeLineBlock;

    let t = 0;
    const k = 35; // 20 пикселей на секунду

    let currentDate: string = "";
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
          timeLineBlock.appendChild(blBR);
        }
        eventElement.innerHTML = `<span></span><span class='page-name'>${event![1]}</span>`;
        if (newStarTime) {
          const d = `${newStarTime.getDate().toString().padStart(2, "0")}.${(newStarTime.getMonth() + 1).toString().padStart(2, "0")}`;

          let s = `<span class='time'>`;
          if (d !== currentDate) {
            currentDate = d;
            s += `${d} `;
          }
          s += `${getTimeStr(newStarTime)}</span>`;
          eventElement.innerHTML += s;
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
              timeLineBlock.appendChild(eventElement);
            }
            xx -= n * dT;
          }
        }

        eventElement.style.width = Math.max(xx * k, 7) + "px";

        const event_code = event[1];
        if (typeof event_code === "string") {
          if (event_code === "goalBtnClick") {
            event[1] = EVENT_CODE.goalBtnClick.code;
          }
        }

        switch (event_code) {
          case EVENT_CODE.outPage!.code:
            eventElement.innerHTML = `<span></span><i class='time'>${time.toFixed(1)}</i>`;
            eventElement.className += " " + EVENT_CODE.outPage!.class!;
            break;
          default:
            const eventItem = EVENT_BY_CODE[event_code];
            if (eventItem && eventItem.class) {
              eventElement.className += " " + eventItem.class;
              eventElement.innerHTML = `<span></span>`;
            } else {
              eventElement.innerHTML = `<span class="goal-event"><b>${event_code}</b></span>`;
            }

            break;
        }
      }

      timeLineBlock.appendChild(eventElement);

      t = time;
    }
  }
  constructor(data: IGuest, owner: CGuestsMain) {
    super();
    //

    this.addEventListener("click", async (_e: MouseEvent) => {
      chat.initForGuest(this.data);
    });

    const project = Object.values(bigProjects).find(
      (project) => project.id === data.projectId,
    );
    if (project) {
      // this.projectConfig = project;
      const comp_name = data.instagram?.comp_name! || "";
      const adset_name = data.instagram?.adset_name! || "";
      const ad_name = data.instagram?.ad_name! || "";
      if (comp_name) {
        this.companyConfig = Object.values(project.companys).find(
          (c) => c.id === comp_name || c.name === comp_name,
        );
      }
      if (adset_name && this.companyConfig) {
        this.adsetConfig = Object.values(this.companyConfig.adsets).find(
          (a: any) => a.id === adset_name || a.name === adset_name,
        );
      }
      if (ad_name && this.adsetConfig) {
        this.adConfig = Object.values(this.adsetConfig.ads).find(
          (a: any) => a.id === ad_name || a.name === ad_name,
        );
      }
    }

    this.data = data;
    this.owner = owner;

    store.on(DESC_EVENTS.guests.Filter.LevelChanged, () => {
      if (this.owner.filters.eventLevel > this.levelBehavior) {
        this.removeAttribute("visible");
      } else {
        this.setAttribute("visible", "");
        if (!this.isRender) {
          this.render();
          this.isRender = true;
        }
        this.classList.remove("mode-0");
        this.classList.remove("mode-1");
        if (this.owner.filters.eventLevel === 0) {
          this.classList.add("mode-0");
        } else {
          this.classList.add("mode-1");
        }
      }
    });
  }
  async connectedCallback() {}
}

customElements.define("c-guest-block", CGuestBlock);

function isBot(userAgent: string): boolean {
  return (
    userAgent.includes("meta-externalads") ||
    userAgent.includes("facebookexternalhit") ||
    userAgent.includes("HeadlessChrome") ||
    userAgent.includes("Googlebot") ||
    userAgent.includes("bot") ||
    userAgent.includes("crawler") ||
    userAgent.includes("spider")
  );
}
