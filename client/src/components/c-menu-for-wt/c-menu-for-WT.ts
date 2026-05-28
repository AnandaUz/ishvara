import "./c-menu-for-WT.scss";
import template from "./c-menu-for-WT.html?raw";
import { core } from "@/features/core";

export class CMenuForWT extends HTMLElement {
  async connectedCallback() {
    this.innerHTML = template;

    this.querySelector("button.by-scroll")?.addEventListener("click", () => {
      core.cGuestMain.guestsNotes.forEach((item) => {
        if (item.flags.isScrolled) {
          if (!item.data.level) {
            item.sendLevel_and_MetaEvent(1);
          }
        }
      });
    });

    this.querySelector("button.by-tour")?.addEventListener("click", () => {
      core.cGuestMain.guestsNotes.forEach((item) => {
        if (item.flags.isTour) {
          if (item.data.level && item.data.level === 1) {
            item.sendLevel_and_MetaEvent(2);
          }
        }
      });
    });
  }
}
customElements.define("c-menu-for-wt", CMenuForWT);
