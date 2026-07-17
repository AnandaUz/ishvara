import "./c-guests-list.scss";
import template from "./c-guests-list.html?raw";
import type { IGuest } from "@shared/types/IGuest";
import { EVENTS } from "@/features/store";
import { CGuestBlock } from "../c-guest-block/c-guest-block";
import { CPopup } from "../../c-popup/c-popup";
import { CGuestCard } from "../c-guest-card/c-guest-card";
import "../c-guests-filters-bl/c-guests-filters-bl";
import "@components/elements/c-checkBox/c-checkBox";
import { CCheckBox } from "@components/elements/c-checkBox/c-checkBox";
// import "@/components/c-menu-for-wt/c-menu-for-WT";
// import { api } from "@/services/api";
import {
  META_EVENTS_LEVEL,
  type IMetaEventLevel,
} from "@shared/types/GuestConst";
import { api } from "@/services/api";
import { CModal } from "../../c-modal/c-modal";
import { core } from "@/features/core";
import { TAGS, TAGS_TOOLS } from "@shared/types/Tags";

const daysName = ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"];
export class CGuestsList extends HTMLElement {
  guests_list_block: HTMLElement | null = null;
  menu: CPopup | null = null;
  modalMenu: CModal | null = null;
  guestForm: CGuestCard | null = null;
  observer!: IntersectionObserver;

  guestsNotes: CGuestBlock[] = [];
  lastDayForRender: Date | null = null;
  stat: number[] = [];

  filters = {
    eventLevel: 0,
    timeLine_visible: true,
  };

  modalOpen_func(guestBlock: CGuestBlock) {
    const modal = this.modalMenu;
    if (!modal) return;

    this.guestForm?.init(guestBlock, this.modalMenu!);
  }
  async loadNextGuests() {
    const guests = await core.serverPersistence.loadNextGuests(
      Number(core.localPersistence.state.projectId!),
    );
    this.addGuestsBlocks(guests);
  }
  constructor() {
    super();
    // core.cGuestMain = this;
    // core.store.on(EVENTS.project.Changed, (_id: number) => {
    //   h1!.textContent = core.projectsManager.activeProject!.config.name;
    // });
    core.store.on(EVENTS.guests.Filter.LevelChanged, (level: number) => {
      this.filters.eventLevel = level;
      if (level === 0) this.filters.timeLine_visible = true;
      else this.filters.timeLine_visible = false;
    });

    this.observer = new IntersectionObserver(async (entries) => {
      if (entries && entries[0] && entries[0].isIntersecting) {
        // loadMore();

        this.observer.unobserve(entries[0].target);

        await this.loadNextGuests();
      }
    });
    // core.store.on(EVENTS.guests., (level: number) => {
    //   this.filters.eventLevel = level;
    //   if (level === 0) this.filters.timeLine_visible = true;
    //   else this.filters.timeLine_visible = false;
    // });
  }

  async render() {
    this.guests_list_block?.replaceChildren();
    this.guestsNotes = [];

    const guests = await core.serverPersistence.loadNextGuests(
      Number(core.localPersistence.state.projectId!),
    );
    this.addGuestsBlocks(guests);
  }
  addGuestsBlocks(data: IGuest[]) {
    if (!data) return;
    let guestBlock: CGuestBlock | null = null;
    for (let i = 0; i < data.length; i++) {
      const guest = data[i];
      if (!guest) continue;

      if (
        !(
          guest.tags?.includes(TAGS.goals.top.code) ||
          guest.tags?.includes(TAGS.goals.middle.code)
        )
      )
        continue;

      let d = new Date(guest.lastChange || guest.createdAt!);

      if (
        d.getMonth() !== this.lastDayForRender?.getMonth() ||
        d.getDate() !== this.lastDayForRender?.getDate()
      ) {
        if (this.stat.length > 0) {
          const el = document.createElement("div");
          el.classList.add("stat-line");
          this.stat.forEach((count, tag) => {
            const span = document.createElement("span");
            span.innerHTML = `${TAGS_TOOLS.codeToName.get(tag)} <i>${count}</i>`;
            const colors = TAGS_TOOLS.codeToBgColors.get(tag);
            span.style.setProperty("--bgColor", colors?.bgColor || "");
            span.style.setProperty("--fontColor", colors?.fontColor || "");

            el.appendChild(span);
          });
          this.guests_list_block!.appendChild(el);
          this.stat = [];
        }
        this.lastDayForRender = d;
        const gMonth = d.getMonth();
        const gDay = d.getDate();
        const gWeekDay = d.getDay();

        const dayLineEl = document.createElement("div");
        dayLineEl.classList.add("day-line");

        dayLineEl.innerHTML = `<div class="bl-0">
        <span>${gDay}.${gMonth + 1}</span>
        <span class="day-name">${daysName[gWeekDay]}</span>
        </div>
        `;
        this.guests_list_block!.appendChild(dayLineEl);
      }

      // if (!guest.createdAt && !guest.events && !guest.tg) {
      //   continue;
      // }
      guestBlock = new CGuestBlock(guest, this);
      this.guests_list_block!.appendChild(guestBlock);
      this.guestsNotes.push(guestBlock);
      guestBlock.render();

      guest.tags?.forEach((tag: number) => {
        this.stat[tag] = (this.stat[tag] || 0) + 1;
      });
    }
    if (guestBlock) this.observer.observe(guestBlock);
    else this.loadNextGuests();
  }
  connectedCallback() {
    this.innerHTML = template;
    this.guests_list_block = this.querySelector(".guests-list");

    // core.store.on(EVENTS.project.Changed, () => {
    //   this.render();
    // });

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
        if (guest.data.level === element[0].code) return;
        if (await guest.sendLevel_and_MetaEvent(element[0].code)) {
          resetBtnStatus(element[0].code + 1);
          this.menu?.close();
        }
      });
    }
    this.menu.onOpen = (owner: CGuestBlock) => {
      const level = owner.data.level || 0;
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

    const options_showTimeLine = document.querySelector(
      ".options-showTimeLine",
    ) as CCheckBox;
    if (options_showTimeLine)
      options_showTimeLine.onChange((checked) => {
        core.options.isShowTimeLine = checked;
        core.store.emit(EVENTS.options.Changed, { isShowTimeLine: checked });
      });

    const filterBtn = document.querySelector(
      ".tools-btns.i-filter",
    ) as HTMLElement;
    if (filterBtn) {
      filterBtn.addEventListener("click", () => {
        core.tagsTreeMenu?.toggle(filterBtn);
      });
    }
  }
}

customElements.define("c-guests-list", CGuestsList);
