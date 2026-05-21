import type { Page } from "../../types";
import html from "@pages/home/home.html?raw";
import "@/components/c-guests/c-guests-main/c-guests-main";
// import "@components/c-project-tabs/c-project-tabs";
import { projectsManager } from "@/features/projectsManager";
import "@/components/c-chats/c-chats";
import "./home.scss";
import "@components/c-tabs/c-tabs";
import type { CTabs, ITab } from "@components/c-tabs/c-tabs";
import { bigProjectsGet, bigProjects } from "@shared/projects_config";
// import { DESC_EVENTS, store } from "@/features/store";
// import { projects_configs } from "@/tabs_config";

export const homePage: Page = () => {
  return {
    html: html,
    pageClass: "home-page",
    init() {
      projectsManager.init();

      const projectsTabs = document.getElementById("projects-tabs") as CTabs;
      const companyTabs = document.getElementById("company-tabs") as CTabs;
      const companyTabs_block = document.querySelector(
        ".company-tabs-block",
      ) as HTMLElement;

      const data = bigProjects.map((proj) => ({
        id: proj.id,
        name: proj.name,
        isOff: proj.isOff,
      } as ITab));

      projectsTabs.addEventChange((id) => {
        // store.emit(DESC_EVENTS.project.Changed, id);

        const project = bigProjectsGet.projectById(Number(id));
        if (!project) return;

        if (project.companys) {

          let c: ITab[] = [];
          project.companys.forEach((company) => {

            company.adsets?.forEach((adset) => {
              c.push({
                id: adset.id,
                name: `<span class="company-name"><span>${company.name}</span></span> <span class="adset-name">${adset.name}</span>`,
                isOff: adset.isOff,
              } as ITab);
            });
          });
          companyTabs.name = 'pr' + project.id;
          companyTabs.init(c);

          // const d: ITab[] = projects_configs.map((conf) => {
          //   return {
          //     id: conf.id,
          //     name: conf.name,
          //     isOff: conf.isOff,
          //   } as ITab;
          // });
          // companyTabs.init(d);
          companyTabs_block.style.display = "block";
        } else {
          companyTabs_block.style.display = "none";
        }

        projectsManager.setProject(project.id);
      });

      projectsTabs.init(data as ITab[]);
    },
  };
};
