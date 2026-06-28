import { api } from "@/services/api";
import type { Page } from "../../types";
import tpl from "./server.html?raw";
import "./server.scss";
import { TAGS } from "@shared/types/Tags";

export const serverPage: Page = () => ({
  html: tpl,
  pageClass: "server-page",

  init() {
    const textEl = document.querySelector(".test-block") as HTMLDivElement;
    const btnStatTags = document.querySelector(
      ".btn-stat-tags",
    ) as HTMLButtonElement;
    btnStatTags?.addEventListener("click", async () => {
      const result = await api.statistics.countTags([TAGS.scroll.was.code]);

      textEl.innerHTML = JSON.stringify(result);
    });
    // ----------------------------
    const btn = document.querySelector(".btn-00") as HTMLButtonElement;
    btn?.addEventListener("click", () => {
      console.log("[serverPage] Кнопка нажата – открываем SSE");
      const baseUrl =
        import.meta.env.VITE_API_URL?.trim() +
        "/api/statistics/do-formating-data";
      const sse = new EventSource(baseUrl);
      /** соединение открыто */
      sse.onopen = () => {
        console.log("[SSE] соединение открыто");
      };
      /** получено сообщение от сервера */
      sse.onmessage = (e) => {
        if (textEl) {
          textEl.innerHTML += e.data + "<br/>";
        }
      };
      sse.onerror = (err) => {
        console.error("[SSE] ошибка соединения:", err);
        sse.close();
      };
      sse.addEventListener("end", () => sse.close());
    });
    //------------
    const btnSetTags = document.querySelector(
      ".btn-set-tags",
    ) as HTMLButtonElement;
    btnSetTags?.addEventListener("click", () => {
      const baseUrl =
        import.meta.env.VITE_API_URL?.trim() + "/api/statistics/set-tags";
      const sse = new EventSource(baseUrl);
      /** соединение открыто */
      sse.onopen = () => {
        console.log("[SSE] соединение открыто");
      };
      /** получено сообщение от сервера */
      sse.onmessage = (e) => {
        if (textEl) {
          textEl.innerHTML += e.data + "<br/>";
        }
      };
      sse.onerror = (err) => {
        console.error("[SSE] ошибка соединения:", err);
        sse.close();
      };
      sse.addEventListener("end", () => sse.close());
    });
  },
});
