import { DESC_EVENTS, store } from "@/features/store";
import "./c-guests-filters-bl.scss";

// import template from "./c-guest-block.html?raw";

class Btn extends HTMLElement {
  ind: number = 0;
}
customElements.define("c-btn", Btn);

export class CguestsFiltersBl extends HTMLElement {
  level: number = 0;
  btns: Btn[] = [];
  constructor() {
    super();
    for (let i = 0; i <= 7; i++) {
      const btn = document.createElement("c-btn") as Btn;
      btn.classList.add("btn", `level-${i}`);
      btn.ind = i;

      btn.addEventListener("click", () => {
        this.setLevel(i);
      });
      this.btns.push(btn);
      this.appendChild(btn);
    }
  }
  async connectedCallback() {
    const ind = localStorage.getItem("c-guests-filters-bl");
    if (ind) {
      this.setLevel(parseInt(ind));
    } else {
      this.setLevel(0);
    }
  }
  setLevel(level: number) {
    if (this.level === level) return;
    this.level = level;
    localStorage.setItem("c-guests-filters-bl", level.toString());
    this.btns.forEach((btn) => {
      if (btn.ind <= level) {
        btn.classList.add("active");
      } else {
        btn.classList.remove("active");
      }
    });
    store.emit(DESC_EVENTS.guests.Filter.LevelChanged, level);
  }

  setFilter() {}
}
customElements.define("c-guests-filters-bl", CguestsFiltersBl);
