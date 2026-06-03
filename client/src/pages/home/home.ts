import type { Page } from "../../types";
import html from "@pages/home/home.html?raw";
import "@/components/c-guests/c-guests-main/c-guests-main";
import "@/components/c-chats/c-chats";
import "./home.scss";
import "@components/c-tabs/c-tabs";
import type { CTabs, ITab } from "@components/c-tabs/c-tabs";
import { bigProjectsGet, bigProjects } from "@shared/projects_config";
import { core } from "@/features/core";

interface ITabData {
  companyId?: number;
  adsetId?: number;
}

export const homePage: Page = () => {
  return {
    html: html,
    pageClass: "home-page",
    init() {
      core.projectsManager.init();

      const projectsTabs = document.getElementById("projects-tabs") as CTabs;
      const companyTabs = document.getElementById("company-tabs") as CTabs;
      const companyTabs_block = document.querySelector(
        ".company-tabs-block",
      ) as HTMLElement;

      const data = bigProjects.map(
        (proj) =>
          ({
            id: proj.id,
            name: proj.name,
            isOff: proj.isOff,
            data: proj.id,
          }) as ITab,
      );

      projectsTabs.addEventChange((tabData) => {
        const id = tabData?.data;

        const project = bigProjectsGet.projectById(Number(id));
        if (!project) return;

        if (project.companys) {
          let c: ITab[] = [];

          c.push({
            id: project.id + "_ALL",
            name: `всё`,
            data: {
              companyId: -1,
            } as ITabData,
          } as ITab);
          c.push({
            id: project.id + "_else",
            name: `прочее`,
            data: {
              companyId: -2,
            } as ITabData,
          } as ITab);

          project.companys.forEach((company) => {
            // if (company.adsets) {
            //   company.adsets.forEach((adset) => {
            //     c.push({
            //       id: adset.id + "_" + company.id,
            //       name: `<span class="company-name"><span>${company.name}</span></span> <span class="adset-name">${adset.name}</span>`,
            //       isOff: adset.isOff,
            //       data: {
            //         companyId: company.id,
            //         adsetId: adset.id,
            //       } as ITabData,
            //     } as ITab);
            //   });
            // } else {
            c.push({
              id: company.id,
              name: company.name,
              isOff: company.isOff,
              data: {
                companyId: company.id,
              } as ITabData,
            } as ITab);
            // }
          });
          companyTabs.name = "pr" + project.id;

          companyTabs.addEventChange((tabData) => {
            const companyId = tabData?.data?.companyId;

            // const adsetId = tabData?.data?.adsetId;
            core.projectsManager.setProject(project.id, (guest) => {
              // console.log(guest.instagram);

              if (companyId == -1) return true;

              const comp = guest.companyId;
              if (comp && comp == companyId) {
                // if (guest.adsetId == adsetId) return true;
                return true;
                // const inst: string | number | undefined = guest.instagram?.adset;
                // if (!inst) return false;

                // if (inst === id) return true;
              }
              return false;
            });
          });
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
          core.projectsManager.setProject(project.id);
        }

        //
      });

      projectsTabs.init(data as ITab[]);
    },
  };
};
