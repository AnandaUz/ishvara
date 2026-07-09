import type { Page } from "../../types";
import html from "@pages/home/home.html?raw";
import "@/components/c-guests/c-guests-list/c-guests-list";
import "@/components/c-chats/c-chats";
import "./home.scss";
import "@components/c-tabs/c-tabs";
import type { CTabs, ITab } from "@components/c-tabs/c-tabs";
import { bigProjectsGet, bigProjects } from "@shared/projects_config";
import { core } from "@/features/core";
import type { CGuestsList } from "@/components/c-guests/c-guests-list/c-guests-list";
import { EVENTS } from "@/features/store";
import "@/components/c-statictics-block/c-statictics-block";
import type { CStaticticsBlock } from "@/components/c-statictics-block/c-statictics-block";

interface ITabData {
  companyId?: number;
  adsetId?: number;
}

export const homePage: Page = () => {
  return {
    html: html,
    pageClass: "home-page",

    init() {
      core.init();
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

      let oldProjectId = "";
      let oldCompanyId = "";
      // projectsTabs
      const projectsTabs = document.getElementById("projects-tabs") as CTabs;
      let activeProjectId = core.localPersistence.state.projectId;
      projectsTabs.init(data as ITab[]);
      projectsTabs.addEventChange((tabId) => {
        const id = tabId.toString();
        if (activeProjectId !== id) {
          activeProjectId = id;
          core.localPersistence.state.projectId = id || "";
          core.localPersistence.save();
          core.store.emit(EVENTS.options.MainTabsChanged, [id]);
        }
      });
      if (activeProjectId) {
        projectsTabs.setActive(activeProjectId);
      }
      // #region companyTabs
      const companyTabs = document.getElementById("company-tabs") as CTabs;

      companyTabs.addEventChange((tabId) => {
        const companyId = tabId;
        const projectId = core.localPersistence.state.projectId || "";
        if (projectId) {
          if (!core.localPersistence.state.companiesIds) {
            core.localPersistence.state.companiesIds = {};
          }
          core.localPersistence.state.companiesIds[projectId] =
            companyId?.toString() || "";
          core.localPersistence.save();
          core.store.emit(EVENTS.options.MainTabsChanged, ["companyChanged"]);
        }
      });
      const companyTabRender = () => {
        const projectId = core.localPersistence.state.projectId;
        const companyId =
          core.localPersistence.state.companiesIds?.[projectId || ""] || "";

        if (oldProjectId == projectId) {
          if (oldCompanyId == companyId) {
            return;
          }
        } else {
          const projectData = bigProjectsGet.projectById(Number(projectId));
          if (!projectData) return;

          if (projectData.companys) {
            let c: ITab[] = [];
            companyTabs_block.style.display = "";

            c.push({
              id: -1,
              name: `всё`,
              bgColor: "rgba(102, 197, 145, 1)",
            } as ITab);
            c.push({
              id: -2,
              name: `прочее`,
            } as ITab);

            projectData.companys.forEach((company) => {
              c.push({
                id: company.id,
                name: company.name,
                isOff: company.isOff,
                data: {
                  companyId: company.id,
                } as ITabData,
              } as ITab);
            });

            companyTabs.name = "pr" + projectId;
            companyTabs.init(c);
            if (companyId) {
              companyTabs.setActive(companyId);
            }
          } else {
            companyTabs_block.style.display = "none";
          }
        }
        oldProjectId = projectId || "";
        oldCompanyId = companyId || "";
      };
      companyTabRender();
      core.store.on(EVENTS.options.MainTabsChanged, () => {
        companyTabRender();
      });
      // #endregion companyTabs
      // #region viewTypeTabs
      const viewTypeTabs = document.querySelector(".view-type-tabs") as CTabs;
      viewTypeTabs.addEventChange((tabId) => {
        core.localPersistence.state.viewports = tabId.toString();
        core.localPersistence.save();
        core.store.emit(EVENTS.options.MainTabsChanged, ["viewportChanged"]);
      });
      const viewTypeTabRender = () => {
        let c: ITab[] = [];
        c.push({
          id: 1,
          name: `статистика`,
          bgColor: "rgba(245, 238, 149, 1)",
        } as ITab);
        c.push({
          id: 2,
          name: `активность`,
          bgColor: "rgba(79, 204, 135, 1)",
        } as ITab);
        viewTypeTabs.init(c);
        let activeViewType = core.localPersistence.state.viewports;
        if (activeViewType) {
          viewTypeTabs.setActive(activeViewType);
        }
      };
      viewTypeTabRender();
      core.store.on(EVENTS.options.MainTabsChanged, () => {
        let activeViewType = core.localPersistence.state.viewports;
        if (activeViewType) {
          viewTypeTabs.setActive(activeViewType);
        }
      });
      // #endregion viewTypeTabs
      // #region viewports
      const viewports = document.querySelector(".viewports-block");
      const v1 = viewports?.querySelector(".v-statistics") as HTMLElement;
      const v2 = viewports?.querySelector(".v-guests") as HTMLElement;
      let cGuestList: CGuestsList | null = null;
      let cStaticticsBlock: CStaticticsBlock | null = null;
      const viewportsRender = () => {
        v1.style.display = "none";
        v2.style.display = "none";
        let activeViewportId = core.localPersistence.state.viewports;
        if (activeViewportId === "1") {
          v1.style.display = "block";
          if (!cStaticticsBlock) {
            cStaticticsBlock = document.createElement(
              "c-statictics-block",
            ) as CStaticticsBlock;
            v1.appendChild(cStaticticsBlock);
          }
        } else if (activeViewportId === "2") {
          // guest list
          v2.style.display = "block";
          if (!cGuestList) {
            cGuestList = document.createElement("c-guests-list") as CGuestsList;
            v2.appendChild(cGuestList);
          }
          cGuestList.render();
        }
      };
      viewportsRender();
      core.store.on(EVENTS.options.MainTabsChanged, () => {
        viewportsRender();
      });
      // #endregion viewports
    },
  };
};
