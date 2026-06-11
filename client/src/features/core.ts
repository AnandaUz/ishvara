import "@styles/style.scss";
import "@/main.ts";
import { render } from "@features/router";

import { renderHeader } from "@components/header"; // добавить
import { renderFooter } from "@components/footer"; // добавить
import { Store } from "./store";
import type { CGuestsMain } from "@/components/c-guests/c-guests-main/c-guests-main";
import { ProjectsManager } from "@features/projectsManager";

class Core {
  options = {
    isShowTimeLine: true,
  };
  cGuestMain!: CGuestsMain;

  projectsManager = new ProjectsManager();

  store = new Store();
  constructor() {
    // this.store.on(EVENTS.options.Changed, () => {});

    //- options ------
    const d = localStorage.getItem("guests-show-timeline");
    if (d !== null) this.options.isShowTimeLine = d === "true";

    //---------

    document.addEventListener("click", (e) => {
      const target = e.target as HTMLAnchorElement;

      if (
        target.tagName === "A" &&
        target.href.startsWith(window.location.origin)
      ) {
        // Пропускаем PDF и внешние открытия
        if (target.href.endsWith(".pdf") || target.target === "_blank") return;

        e.preventDefault();
        history.pushState({}, "", target.href);
        render();
      }
    });

    // Обрабатываем кнопки браузера "назад" / "вперёд"
    window.addEventListener("popstate", () => {
      render();
    });
    this.init();
  }

  async init() {
    renderHeader();
    renderFooter();
    await render();
  }
}

export const core = new Core();
