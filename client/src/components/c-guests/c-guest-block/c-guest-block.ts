import type { IGuest } from "@shared/types/IGuest";
import "./c-guest-block.scss";
import template from "./c-guest-block.html?raw";
import { bigProjectsGet } from "@shared/projects_config";
import { TAGS_TOOLS } from "@shared/types/Tags";
import { CLIENT_EVENTS, CLIENT_EVENTS_TOOLS } from "@shared/types/ClientEvents";

import { Tools } from "@/services/tools";
import { api } from "@/services/api";
import {
  META_EVENT_LEVEL_BY_CODE,
  // EVENT_CODE,
  // EVENT_BY_CODE,
  META_EVENT_BY_CODE,
} from "@shared/types/GuestConst";
import type { IPixelEventData } from "@shared/types/Is";

import type { CGuestsList } from "@/components/c-guests/c-guests-list/c-guests-list";
import { EVENTS } from "@/features/store";
// import { chat } from "@/components/c-chats/c-chats";

import { core } from "@/features/core";

export class CGuestBlock extends HTMLElement {
  data: IGuest;
  owner: CGuestsList;
  // private _levelBehavior: number = 0;
  private isRendered: boolean = false;
  private body!: HTMLDivElement;
  private timeLineBlock!: HTMLDivElement;
  private projectConfig?: any;
  private companyConfig?: any;
  private adsetConfig?: any;
  private adConfig?: any;
  private isVisible: boolean = false;
  unsubscribers: Array<() => void> = [];
  flags = {
    isScrolled: false,
    isTour: false,
  };

  async sendLevel_and_MetaEvent(level: number) {
    if (this.data.level === level) return true;

    this.data.level = level;

    const activeProject = core.projectsManager.activeProject;
    // if (!activeProject?.config.companyPageURL) return false;
    const config = activeProject?.config;
    const pixel = config?.pixel;
    // const companyPageURL = config?.companyPageURL;

    let res = null;
    if (pixel) {
      const eventName = META_EVENT_LEVEL_BY_CODE[level]!;
      const eventTime = Math.floor(Date.now() / 1000); //this.data.lastChange;
      const eventObj = META_EVENT_BY_CODE[level]!;

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

      const city = this.adsetConfig?.city || this.projectConfig?.city;
      const country = this.adsetConfig?.country || this.projectConfig?.country;
      if (city) {
        data.user_data.ct = await Tools.hashSHA256(city); // хешируется, lowercase
      }
      if (country) {
        data.user_data.country = await Tools.hashSHA256(country); // код страны, тоже хешируется
      }

      if (userData.tg && userData.tg.first_name) {
        data.user_data.fn = await Tools.hashSHA256(
          Tools.cleanName(userData.tg.first_name),
        );
      }
      if (userData.tg && userData.tg.last_name) {
        data.user_data.ln = await Tools.hashSHA256(
          Tools.cleanName(userData.tg.last_name),
        );
      }

      if (eventObj && "value" in eventObj && eventObj.value) {
        data.custom_data = {
          currency: "USD",
          value: eventObj.value,
          content_name: this.companyConfig?.name || "",
        };
      }
      if (userData?.instagram?.fbp) data.user_data.fbp = userData.instagram.fbp;
      if (userData?.instagram?.fbc) data.user_data.fbc = userData.instagram.fbc;

      if (userData?.userAgentString)
        data.user_data.client_user_agent = userData.userAgentString;

      const pixelData = this.companyConfig.pixel || this.projectConfig.pixel;

      res = await api.guest.sendMetaEvent([data], pixelData);
    }

    if ((pixel && res && res.ok) || !pixel) {
      const res2 = await api.guest.patchOne(this.data._id || "dfdf", this.data);
      if (res2.ok) {
        // this._levelBehavior = tag;
        this.render();
        return true;
      }
    }
    return false;
  }

  set_eventLevel() {
    const bg = this.querySelector(".bg") as HTMLDivElement;
    const data = this.data;

    for (let i = 1; i <= (data.level || 0); i++) {
      bg.classList.add(`l${i}`);
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
    this.isRendered = true;

    // tags block
    const tagsEl = this.body.querySelector(".tags") as HTMLDivElement;
    tagsEl.innerHTML =
      data.tags
        ?.map((tag) => {
          const bgColor = TAGS_TOOLS.codeToBgColor.get(tag);
          const name = TAGS_TOOLS.codeToName.get(tag);
          if (name === undefined) {
            console.log("tag", tag);
          }
          return `<span class="tag" style="--bg-color: ${bgColor}">${name}</span>`;
        })
        .join("") || "";

    this.data = data;
    this.owner = owner;

    const body = this.body;

    const setBlock = (name: string, html?: string) => {
      const el = body.querySelector(name) as HTMLDivElement;
      if (!el) throw new Error(`Block ${name} not found`);
      el.innerHTML = html || "";
      return el;
    };

    if (typeof this.data.companyId === "number") {
      setBlock(
        ".company-string",
        `<span class='company-name'>${this.companyConfig?.viewText || ""}</span>
        <span class='adset-name'>${this.adsetConfig?.viewText || ""}</span>
        <span class='ad-name'>${this.adConfig?.viewText || ""}</span>`,
      );
    }

    // if (this.data.instagram?.comp_name) {
    //   if (typeof this.data.projectId === "number") {
    //     if (this.data.instagram?.comp_name) {
    //       setBlock(
    //         ".company-string",
    //         `<span class='ad-name'>${this.adsetConfig?.name || "🔆"}</span>
    //         <span class='ad-name'>${this.adConfig?.name || "🔆"}</span>`,
    //       );
    //     }
    //   } else {

    //   }
    // }

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
    }

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
        `https://m.esho.uz/location?g=${this.data._id}`,
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
    const d = core.options.isShowTimeLine;
    if (!d) return;

    const timeLineBlock = this.timeLineBlock;

    let t = 0;

    let currentDate: string = "";
    for (let i = 0; i < (this.data.events?.length ?? 0); i++) {
      const event = this.data.events?.[i];
      if (!event) continue;
      const eventElement = document.createElement("div");

      // eventElement.classList.add("event");

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

      // #region событие входа настраницу
      if (kod === "t") {
        if (i > 0) {
          const blBR = document.createElement("br");
          timeLineBlock.appendChild(blBR);
        }

        let segments = event![1].toString().split("/").filter(Boolean);
        if (segments.length == 0) segments = ["🏠"];
        let eventName = segments
          .map((segment, i) => {
            let cls = `s${i + 1}`;

            // if (i === segments.length - 1) cls = "ss";

            return `<b class="${cls}">${segment}</b>`;
          })
          .join("");

        if (segments.length === 1) {
          if (segments[0] == "tours") this.flags.isTour = true;
        }

        eventElement.innerHTML = eventName;
        eventElement.classList.add("url");
        if (newStarTime) {
          const d = `${newStarTime.getDate().toString().padStart(2, "0")}.${(newStarTime.getMonth() + 1).toString().padStart(2, "0")}`;

          let s = `<span class='time'>`;
          if (d !== currentDate) {
            currentDate = d;
            s += `${d} `;
          }
          s += `${Tools.getTimeStr(newStarTime)}</span>`;
          eventElement.innerHTML += s;
        }
        eventElement.className += " " + "page-in";

        timeLineBlock.appendChild(eventElement);
        continue;
      }
      timeLineBlock.appendChild(eventElement);
      // #endregion

      let xx = time - t;

      // #region добавляем линии-секунды
      if (xx > 20) {
        const el = document.createElement("div");
        el.classList.add("line");
        el.classList.add("ex-scale");
        timeLineBlock.appendChild(el);
        xx = 1;
      } else {
        const dT = 1;
        if (xx > dT) {
          let ii = 0;
          const n = Math.floor(xx / dT);
          for (; ii < n; ii++) {
            const el = document.createElement("div");
            el.classList.add("line");
            timeLineBlock.appendChild(el);
          }
          xx -= n * dT;
        }
      }
      // #endregion

      // eventElement.style.width = Math.max(xx * k, 7) + "px";

      const event_code = event[1];
      // if (typeof event_code === "string") {
      //   if (event_code === "goalBtnClick") {
      //     event[1] = EVENT_CODE.goalBtnClick.code;
      //   }
      // }

      // if (Number(event_code) > 0 && Number(event_code) < 8)
      //   this.flags.isScrolled = true;

      switch (event_code) {
        case CLIENT_EVENTS.scroll.scroll1.oldCode:
          eventElement.classList.add("scroll", "s1");
          break;
        case CLIENT_EVENTS.scroll.scroll2.oldCode:
          eventElement.classList.add("scroll", "s2");
          break;
        case CLIENT_EVENTS.scroll.scroll3.oldCode:
          eventElement.classList.add("scroll", "s3");
          break;
        case CLIENT_EVENTS.scroll.scroll4.oldCode:
          eventElement.classList.add("scroll", "s4");
          break;
        case CLIENT_EVENTS.scroll.scroll5.oldCode:
          eventElement.classList.add("scroll", "s5");
          break;
        case CLIENT_EVENTS.scroll.scroll6.oldCode:
          eventElement.classList.add("scroll", "s6");
          break;
        case CLIENT_EVENTS.scroll.scroll7.oldCode:
          eventElement.classList.add("scroll", "s7");
          break;
        case CLIENT_EVENTS.page.innerRouting.oldCode:
        case CLIENT_EVENTS.page.showTours.oldCode:
          // eventElement.classList.add("page-in");
          break;

        case CLIENT_EVENTS.page.pageShow.oldCode:
          eventElement.classList.add("show-page", "circle");
          break;
        case CLIENT_EVENTS.page.out.oldCode:
          eventElement.classList.add("page-out", "circle");
          break;
        // case CLIENT_EVENTS.page.in.oldCode:
        //   eventElement.classList.add("page-in");
        //   break;
        case CLIENT_EVENTS.click.common.oldCode: //простой клик
          eventElement.classList.add("click");
          break;

        default:
          eventElement.classList.add("with-text");
          let str =
            CLIENT_EVENTS_TOOLS.oldCodeToName.get(event_code) || event_code;
          eventElement.innerHTML = str;
          const color = CLIENT_EVENTS_TOOLS.oldCodeToColors.get(event_code);
          if (color) {
            eventElement.style.backgroundColor = color.bgColor;
            eventElement.style.color = color.txColor;
          }
      }

      t = time;
    }
  }
  constructor(data: IGuest, owner: CGuestsList) {
    super();
    //
    this.unsubscribers.push(
      core.store.on(EVENTS.guests.Filter.LevelChanged, () => {
        if (this.owner.filters.eventLevel > (this.data.level || 0)) {
          this.removeAttribute("visible");
          this.isVisible = false;
        } else {
          this.setAttribute("visible", "");
          this.isVisible = true;
          if (!this.isRendered) {
            this.render();
          }
          this.classList.remove("mode-0");
          this.classList.remove("mode-1");
          if (this.owner.filters.eventLevel === 0) {
            this.classList.add("mode-0");
          } else {
            this.classList.add("mode-1");
          }
        }
      }),
      core.store.on(EVENTS.options.Changed, () => {
        if (!this.isVisible) return;
        this.render();
      }),
    );

    // this.addEventListener("click", async (_e: MouseEvent) => {
    //   // chat.initForGuest(this.data);
    // });

    this.projectConfig = bigProjectsGet.projectById(data.projectId!);
    this.companyConfig = bigProjectsGet.companyById(
      data.projectId!,
      data.companyId!,
    );
    this.adsetConfig = bigProjectsGet.adsetById(
      data.projectId!,
      data.companyId!,
      data.adsetId!,
    );
    this.adConfig = bigProjectsGet.adById(
      data.projectId!,
      data.companyId!,
      data.adsetId!,
      data.adId!,
    );
    this.data = data;
    this.owner = owner;
  }
  async connectedCallback() {}
  remove() {
    this.unsubscribers.forEach((unsubscribe) => unsubscribe());
    super.remove();
  }
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
