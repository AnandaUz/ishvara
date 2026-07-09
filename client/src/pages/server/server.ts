import { api } from "@/services/api";
import type { Page } from "../../types";
import tpl from "./server.html?raw";
import "./server.scss";
// import { TAGS } from "@shared/types/Tags";

export const serverPage: Page = () => ({
  html: tpl,
  pageClass: "server-page",

  init() {
    const textEl = document.querySelector(".test-block") as HTMLDivElement;
    const btnArhive1 = document.querySelector(
      ".btn-arhive1",
    ) as HTMLButtonElement;
    btnArhive1?.addEventListener("click", async () => {
      textEl.innerHTML = "";
      await api.eventSourceAsync("/api/statistics/set-tags", textEl);
      await api.eventSourceAsync("/api/server/arhive1", textEl);
    });
    // ----------------------------
    const btn = document.querySelector(".btn-00") as HTMLButtonElement;
    btn?.addEventListener("click", () => {
      api.eventSourceAsync("/api/statistics/do-formating-data", textEl);
    });
    //- set tags -----------
    const btnSetTags = document.querySelector(
      ".btn-set-tags",
    ) as HTMLButtonElement;
    btnSetTags?.addEventListener("click", () => {
      textEl.innerHTML = "";
      api.eventSourceAsync("/api/statistics/set-tags", textEl);
    });
  },
});
