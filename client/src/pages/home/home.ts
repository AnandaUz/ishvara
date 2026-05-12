import type { Page } from "../../types";
import html from "@pages/home/home.html?raw";
import "@/components/c-guests/c-guests-main/c-guests-main";
import "@components/c-project-tabs/c-project-tabs";
import { projectsManager } from "@/features/projectsManager";
import "@/components/c-chats/c-chats";
import "./home.scss";

export const homePage: Page = () => {
  return {
    html: html,
    pageClass: "home-page",
    init() {
      projectsManager.init();
    },
  };
};
