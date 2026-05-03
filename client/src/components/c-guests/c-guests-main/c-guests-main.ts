import "./c-guests-main.scss";
import template from "./c-guests-main.html?raw";
import type { IGuest } from "@shared/types/IGuest";
import { DESC_EVENTS, store } from "@/features/store";
import { projectsManager } from "@/features/projectsManager";
import { CGuestBlock } from "../../c-guest-block/c-guest-block";
import { CPopup } from "../../c-popup/c-popup";
import { CGuestCard } from "../c-guest-card/c-guest-card";
import "../c-guests-filters-bl/c-guests-filters-bl";
// import { api } from "@/services/api";
import {
  META_EVENTS_LEVEL,
  type IMetaEventLevel,
} from "@shared/types/GuestConst";
import { api } from "@/services/api";
import { CModal } from "../../c-modal/c-modal";

export class CGuestsMain extends HTMLElement {
  guests_list_block: HTMLElement | null = null;
  menu: CPopup | null = null;
  modalMenu: CModal | null = null;
  guestForm: CGuestCard | null = null;
  filters = {
    eventLevel: 0,
    timeLine_visible: true,
  };

  modalOpen_func(guestBlock: CGuestBlock) {
    const modal = this.modalMenu;
    if (!modal) return;

    this.guestForm?.init(guestBlock, this.modalMenu!);
  }
  constructor() {
    super();
    store.on(DESC_EVENTS.project.Changed, (_id: string) => {
      h1!.textContent = projectsManager.activeProject!.config.name;
    });
    store.on(DESC_EVENTS.guests.Filter.LevelChanged, (level: number) => {
      this.filters.eventLevel = level;
      if (level === 0) this.filters.timeLine_visible = true;
      else this.filters.timeLine_visible = false;
    });

    this.innerHTML = template;

    const h1 = this.querySelector("h1");

    this.guests_list_block = this.querySelector(".guests-list");

    store.on(DESC_EVENTS.project.Changed, () => {
      this.render();
    });

    this.menu = new CPopup();

    this.appendChild(this.menu);

    this.modalMenu = new CModal();
    this.modalMenu.onOpen = (guestBlock: CGuestBlock) => {
      this.modalOpen_func(guestBlock);
    };

    this.guestForm = new CGuestCard();
    this.modalMenu.querySelector(".c-modal__box")!.appendChild(this.guestForm);

    this.appendChild(this.modalMenu);

    const m: [IMetaEventLevel, string][] = [];
    m.push([META_EVENTS_LEVEL.ViewContent, "ViewContent"]);
    m.push([META_EVENTS_LEVEL.Contact, "Contact"]);
    m.push([META_EVENTS_LEVEL.InitiateCheckout, "InitiateCheckout"]);

    m.push([META_EVENTS_LEVEL.Lead, "Lead"]);
    m.push([META_EVENTS_LEVEL.QualifiedLead, "QualifiedLead"]);
    m.push([META_EVENTS_LEVEL.Schedule, "Schedule"]);
    m.push([META_EVENTS_LEVEL.Purchase, "Purchase"]);

    const div = document.createElement("div");
    div.className = "menu-group";
    this.menu.appendChild(div);

    const btns: HTMLButtonElement[] = [];
    function resetBtnStatus(level: number) {
      btns.forEach((element: HTMLButtonElement) => {
        element.disabled = true;
      });
      const btn = btns[level - 1];
      if (btn) {
        btn.disabled = false;
      }
    }
    for (const element of m) {
      const btn = document.createElement("button");
      btns.push(btn);
      btn.className = "btn md-btn level-" + element[0].code;
      btn.innerHTML = `<span class="title">${element[0].title || ""}</span><span class="desc">${element[1]}</span>`;
      div.appendChild(btn);
      btn.addEventListener("click", async () => {
        const guest = this.menu!.targetElement as CGuestBlock;
        if (guest.levelBehavior === element[0].code) return;
        if (await guest.sendMetaEvent(element[0].code)) {
          resetBtnStatus(element[0].code + 1);
        }
      });
    }
    this.menu.onOpen = (owner: CGuestBlock) => {
      const level = owner.levelBehavior;

      resetBtnStatus(level + 1);
    };

    const btn_clear = document.createElement("button");
    btn_clear.className = "btn sml-btn btn-clear";
    this.menu.appendChild(btn_clear);

    btn_clear.addEventListener("click", async () => {
      const guest = this.menu!.targetElement as CGuestBlock;
      if (!guest) return;
      const res = await api.guest.clearEvents(guest.data._id!);
      if (res.ok) {
        guest.data.events = [];
        guest.querySelector(".events-bl")!.innerHTML = "";
      }
    });
  }

  render() {
    this.guests_list_block!.innerHTML = "";
    let month = 0;
    let day = 0;
    projectsManager.activeProject!.guests.forEach((guest: IGuest) => {
      const d = new Date(guest.lastChange || guest.createdAt!);
      const gMonth = d.getMonth();
      const gDay = d.getDate();
      const gWeekDay = d.getDay();
      const daysName = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
      const dayName = daysName[gWeekDay];
      if (gMonth !== month || gDay !== day) {
        month = gMonth;
        day = gDay;
        const dayLineEl = document.createElement("div");
        dayLineEl.classList.add("day-line");
        dayLineEl.innerHTML = `<span>${gDay}.${gMonth + 1}</span><span class="day-name">${dayName}</span>`;
        this.guests_list_block!.appendChild(dayLineEl);
      }
      const guestBlock = new CGuestBlock(guest, this);
      this.guests_list_block!.appendChild(guestBlock);
    });
    store.emit(DESC_EVENTS.guests.Filter.LevelChanged, this.filters.eventLevel);
  }
}

customElements.define("c-guests-main", CGuestsMain);
