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
      core.cGuestMain.guestsNotes.forEach((item) => {
        if (item.flags.isTour) {
          if (item.data.level && item.data.level === 1) {
            item.sendLevel_and_MetaEvent(2);
          }
        }
      });
    });

    this.querySelector(".arhive-items")?.addEventListener("click", () => {
      core.projectsManager.activeProject.arhive();
    });
  }
}
customElements.define("c-menu-for-wt", CMenuForWT);
