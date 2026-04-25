import "./c-guests-block.scss";
import template from "./c-guests-block.html?raw";
import type { IGuest } from "@shared/types/IGuest";
import { store } from "@/features/store";
import { DESC_EVENTS } from "@/features/events";
import { projectsManager } from "@/features/projectsManager";
import { CGuestBlock } from "../c-guest-block/c-guest-block";
import { CPopup } from "../c-popup/c-popup";
import { CGuestCard } from "../c-guest-card/c-guest-card";
// import { api } from "@/services/api";
import {
  META_EVENTS_LEVEL,
  type IEventCodeItem,
} from "@shared/types/GuestConst";
import { api } from "@/services/api";
import { CModal } from "../c-modal/c-modal";

export class TGuestsBlock extends HTMLElement {
  guests_list_block: HTMLElement | null = null;
  menu: CPopup | null = null;
  modalMenu: CModal | null = null;
  guestForm: CGuestCard | null = null;

  modalOpen_func(id: string) {
    const modal = this.modalMenu;
    if (!modal) return;

    this.guestForm?.init(id, this.modalMenu);
  }
  constructor() {
    super();
    this.innerHTML = template;

    this.guests_list_block = this.querySelector(".guests-list");

    store.on(DESC_EVENTS.project.Changed, () => {
      this.render();
    });

    this.menu = new CPopup();

    this.appendChild(this.menu);

    this.modalMenu = new CModal();
    this.modalMenu.onOpen = (id: any) => {
      this.modalOpen_func(id);
    };

    this.guestForm = new CGuestCard();
    this.modalMenu.querySelector(".c-modal__box")!.appendChild(this.guestForm);

    this.appendChild(this.modalMenu);

    const m: IEventCodeItem[] = [];
    m.push(META_EVENTS_LEVEL.EngagedView);
    m.push(META_EVENTS_LEVEL.Contact);
    m.push(META_EVENTS_LEVEL.InitiateCheckout);

    m.push(META_EVENTS_LEVEL.Lead);
    m.push(META_EVENTS_LEVEL.QualifiedLead);
    m.push(META_EVENTS_LEVEL.Schedule);
    m.push(META_EVENTS_LEVEL.Purchase);

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
      btn.className = "btn md-btn level-" + element.code;
      btn.textContent = element.title || "";
      div.appendChild(btn);
      btn.addEventListener("click", async () => {
        const guest = this.menu!.targetElement as CGuestBlock;
        if (guest.levelBehavior === element.code) return;
        if (await guest.sendMetaEvent(element.code)) {
          resetBtnStatus(element.code + 1);
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
      const res = await api.guest.clearEvents(guest.data._id);
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
      const d = new Date(guest.createdAt);
      const gMonth = d.getMonth();
      const gDay = d.getDate();
      if (gMonth !== month || gDay !== day) {
        month = gMonth;
        day = gDay;
        const dayLineEl = document.createElement("div");
        dayLineEl.classList.add("day-line");
        dayLineEl.textContent = `${gDay}.${gMonth + 1}`;
        this.guests_list_block!.appendChild(dayLineEl);
      }
      const guestBlock = new CGuestBlock(guest, this);
      this.guests_list_block!.appendChild(guestBlock);
    });
  }

  connectedCallback() {
    this.innerHTML = template;
  }
}

export class CGuestsBlock extends TGuestsBlock {
  async connectedCallback() {}
}
customElements.define("c-guests-block", CGuestsBlock);
