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
import { api } from "@/services/api";
import { sBlock_dinamic } from "./sBlock_dinamic";
import "@/components/c-company-modal/c-company-modal";
import type { CCompanyModal } from "@/components/c-company-modal/c-company-modal";
import type { ICompanyEntity } from "@shared/types/ICompanyEntity";
import "@/components/c-project-modal/c-project-modal";
import type { CProjectModal } from "@/components/c-project-modal/c-project-modal";

interface ITabData {
  companyId?: number;
  adsetId?: number;
}

export const homePage: Page = () => {
  return {
    html: html,
    pageClass: "home-page",

    async init() {
      await core.init();
      const companyTabs_block = document.querySelector(
        ".company-tabs-block",
      ) as HTMLElement;

      let oldProjectId = "";
      let oldCompanyId = "";
      // projectsTabs
      const projectsTabs = document.getElementById("projects-tabs") as CTabs;
      let activeProjectId = core.localPersistence.state.projectId;
      const projectModal = document.getElementById("project-modal") as CProjectModal;
      const btnEditProjects = document.getElementById("btn-edit-projects") as HTMLButtonElement;

      btnEditProjects?.addEventListener("click", () => {
        projectModal?.open();
      });

      const reloadProjects = async () => {
        let projects: { id: number; name: string; isOff?: boolean }[] = [];
        try {
          const res = await api.project.getAll();
          if (Array.isArray(res) && res.length > 0) {
            projects = res.map((p) => ({
              id: p.projectId,
              name: p.name,
              ...(p.isOff !== undefined && { isOff: p.isOff }),
            }));
          }
        } catch (e) {
          console.error("Failed to load projects from DB", e);
        }
        if (projects.length === 0) {
          projects = bigProjects.map((p) => ({
            id: p.id,
            name: p.name,
            ...(p.isOff !== undefined && { isOff: p.isOff }),
          }));
        }
        const tabsData = projects.map(
          (proj) =>
            ({
              id: proj.id,
              name: proj.name,
              ...(proj.isOff !== undefined && { isOff: proj.isOff }),
              data: proj.id,
            }) as ITab,
        );
        projectsTabs.init(tabsData);
        if (activeProjectId) {
          projectsTabs.setActive(activeProjectId);
        } else if (tabsData.length > 0 && tabsData[0]) {
          const firstId = tabsData[0].id.toString();
          activeProjectId = firstId;
          core.localPersistence.state.projectId = firstId;
          core.localPersistence.save();
          projectsTabs.setActive(firstId);
        }
      };

      if (projectModal) {
        projectModal.onChange = async () => {
          await reloadProjects();
          core.store.emit(EVENTS.options.MainTabsChanged, ["projectsUpdated"]);
        };
      }

      projectsTabs.addEventChange((tabId) => {
        const id = tabId.toString();
        if (activeProjectId !== id) {
          activeProjectId = id;
          core.localPersistence.state.projectId = id || "";
          core.localPersistence.save();
          updateCompanySelector();
          core.store.emit(EVENTS.options.MainTabsChanged, [id]);
        }
      });
      await reloadProjects();

      // #region dynamicCompanySelector
      const companySelector = document.getElementById(
        "company-selector",
      ) as HTMLSelectElement;
      const btnEditCompanies = document.getElementById(
        "btn-edit-companies",
      ) as HTMLButtonElement;
      const companyModal = document.getElementById(
        "company-modal",
      ) as CCompanyModal;

      const updateCompanySelector = async () => {
        const curProjId =
          Number(core.localPersistence.state.projectId) ||
          Number(bigProjects[0]?.id) ||
          0;
        if (!curProjId || !companySelector) return;

        const companies: ICompanyEntity[] =
          await api.company.getByProject(curProjId);
        const savedCompanyId =
          core.localPersistence.state.companiesIds?.[curProjId.toString()] ||
          "";

        companySelector.innerHTML = '<option value="">Все страницы</option>';
        companies.forEach((comp) => {
          const opt = document.createElement("option");
          opt.value = comp._id || "";
          opt.textContent = comp.name;
          companySelector.appendChild(opt);
        });

        if (savedCompanyId && companies.some((c) => c._id === savedCompanyId)) {
          companySelector.value = savedCompanyId;
        } else {
          companySelector.value = "";
        }
      };

      companySelector?.addEventListener("change", () => {
        const selectedId = companySelector.value;
        const curProjId = core.localPersistence.state.projectId || "";
        if (curProjId) {
          if (!core.localPersistence.state.companiesIds) {
            core.localPersistence.state.companiesIds = {};
          }
          core.localPersistence.state.companiesIds[curProjId] = selectedId;
          core.localPersistence.save();
          core.store.emit(EVENTS.options.MainTabsChanged, [
            "companySelectorChanged",
          ]);
        }
      });

      btnEditCompanies?.addEventListener("click", () => {
        const curProjId =
          Number(core.localPersistence.state.projectId) ||
          Number(bigProjects[0]?.id) ||
          0;
        if (curProjId) {
          companyModal.open(curProjId);
        }
      });

      if (companyModal) {
        companyModal.onChange = async () => {
          await updateCompanySelector();
          core.store.emit(EVENTS.options.MainTabsChanged, ["companiesUpdated"]);
        };
      }

      await updateCompanySelector();
      // #endregion dynamicCompanySelector
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
          if (!projectData || !projectData.companys) {
            companyTabs_block.style.display = "none";
            return;
          }

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
        c.push({
          id: 3,
          name: `визиты на страницы`,
          bgColor: "rgba(0, 186, 233, 1)",
        } as ITab);
        c.push({
          id: 4,
          name: `динамика страниц`,
          bgColor: "rgb(204, 161, 229)",
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
      const viewportsBl = document.querySelector(".viewports-block");
      const viewportsEl = viewportsBl?.querySelectorAll(
        ".viewport",
      ) as NodeListOf<HTMLElement>;
      // const v1 = viewports?.querySelector(".v-statistics") as HTMLElement;
      // const v2 = viewports?.querySelector(".v-guests") as HTMLElement;
      let cGuestList: CGuestsList | null = null;

      let cStaticticsBlock: CStaticticsBlock | null = null;
      const viewportsRender = async () => {
        viewportsEl.forEach((el) => {
          el.style.display = "none";
        });
        let activeViewportId = core.localPersistence.state.viewports;
        if (activeProjectId) {
          const activBlock = viewportsEl?.[Number(activeViewportId) - 1];
          if (!activBlock) return;
          activBlock.style.display = "block";

          if (activeViewportId === "1") {
            if (!cStaticticsBlock) {
              cStaticticsBlock = document.createElement(
                "c-statictics-block",
              ) as CStaticticsBlock;
              activBlock.appendChild(cStaticticsBlock);
            } else {
              cStaticticsBlock.init();
            }
          } else if (activeViewportId === "2") {
            // guest list
            if (!cGuestList) {
              cGuestList = document.createElement(
                "c-guests-list",
              ) as CGuestsList;
              activBlock.appendChild(cGuestList);
            }
            core.serverPersistence.clear();
            cGuestList.render();
            core.cGuestList = cGuestList;
          } else if (activeViewportId === "3") {
            // visits
            const visitsList = activBlock.querySelector(
              ".visits-list",
            ) as HTMLElement;
            visitsList.innerHTML = "";
            const prId = core.localPersistence.state.projectId;
            const compId =
              core.localPersistence.state.companiesIds?.[prId || ""];
            const data = await api.statistics.pageVisitsForMonth({
              projectId: Number(prId),
              companyId: compId,
            });

            for (let i = 0; i < 100; i++) {
              const item = data[i] as { _id: number; count: number };
              const page = core.pagesURLData.getPathById(item._id);

              let segments = page?.split("/").filter(Boolean);

              if (segments?.length == 0) segments = ["🏠"];
              let eventName = segments
                ?.map((segment, i) => {
                  let cls = `s${i + 1}`;

                  // if (i === segments.length - 1) cls = "ss";

                  return `<span class="${cls}">${segment}</span>`;
                })
                .join("");

              visitsList.innerHTML += `<div class="line">
                <div class="count">${item.count}</div>
                <div class="id">${item._id}</div>
                <div class="events"><a href="https://world-travel.uz${page}" target="_blank">${eventName}</a></div>
              </div>`;
            }
          } else if (activeViewportId === "4") {
            sBlock_dinamic();
          }
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
