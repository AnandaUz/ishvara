import type { IGuest } from "@shared/types/IGuest";
import { bigProjects } from "@shared/projects_config";

export interface ProjectConfig {
  name: string;
  id: string;
  filterFunc: (guest: IGuest) => boolean;
  isOff?: boolean;
}

export const projects_configs: ProjectConfig[] = [
  {
    name: "Коллективные медитации",
    id: "meditations",
    filterFunc: (guest: IGuest) => {
      if (guest.companyId === "meditations") return true;
      if (guest.instagram?.comp_name === "MeditationTashkent") return true;

      const project = bigProjects.mastermind_paid;
      if (guest.projectId === project?.id) {
        const company = project?.companys.MeditationTashkent;
        if (company?.id === guest.instagram?.comp_name) {
          return true;
          // const i = company?.adsets["CM-contact-with-interests-05_05_26"];
          // if (guest.instagram?.adset_name === i?.id) {
          //   return true;
          // }
          // const ii = company?.adsets["CM-contact-05_05_26"];
          // if (guest.instagram?.adset_name === ii?.id) {
          //   return true;
          // }
        }
      }
      return false;
    },
    // companyPageURL: "https://esho.uz/meditation",
  },
  {
    name: "Беспалтные встречи (ПММ)",
    id: "free-meetings",
    filterFunc: (guest: IGuest) => {
      if (guest.companyId === "free-meetings") return true;
      if (guest.instagram?.comp_name === "lead") return true;
      if (guest.instagram?.comp_name === "lead2") return true;

      return false;
    },
    // companyPageURL: "https://esho.uz/meet",
    isOff: true,
  },
  {
    name: "Платный мастермайнд",
    id: "mastermind",
    filterFunc: (guest: IGuest) => {
      if (guest.companyId === "mastermind") return true;
      if (guest.instagram?.comp_name === "MasterMind") return true;
      return false;
    },
    isOff: true,
  },
  {
    name: "ПММ - встречи - новый пиксель",
    id: "new-pixel",
    filterFunc: (guest: IGuest) => {
      const project = bigProjects.mastermind_paid;
      if (guest.projectId === project?.id) {
        const company = project?.companys.MasterMind;
        if (company?.id === guest.instagram?.comp_name) {
          return true;
          // const i =
          //   company?.adsets[
          //     "26-05-04-mastermaind-contact-with-interests-newPixel"
          //   ];
          // if (guest.instagram?.adset_name === i?.id) {
          //   return true;
          // }
        }
      }
      return false;
    },
  },
  {
    name: "Остальные",
    id: "other",
    filterFunc: (guest: IGuest) => {
      if (guest.companyId === "other") return true;
      for (const project of projects_configs) {
        if (project.id === "other") continue;
        if (project.filterFunc(guest)) return false;
      }
      return true;
    },
  },
];
