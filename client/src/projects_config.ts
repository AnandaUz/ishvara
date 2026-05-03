import type { IGuest } from "@shared/types/IGuest";

export interface ProjectConfig {
  name: string;
  id: string;
  filterFunc: (guest: IGuest) => boolean;
  companyPageURL: string;
  isOff?: boolean;
}

export const projects_configs: ProjectConfig[] = [
  {
    name: "Коллективные медитации",
    id: "meditations",
    filterFunc: (guest: IGuest) => {
      if (guest.companyId === "meditations") return true;
      if (guest.instagram?.comp_name === "MeditationTashkent") return true;

      return false;
    },
    companyPageURL: "https://esho.uz/meditation",
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
    companyPageURL: "https://esho.uz/meet",
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
    companyPageURL: "https://esho.uz/meet",
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
    companyPageURL: "",
  },
];

interface IBlock {
  name: string;
  id: number;
  title: string;
}

export const R_COMPANIES_NAMES: IBlock[] = [
  {
    name: "lead",
    id: 1,
    title: "приглашение на бесплатную встречу про вес",
  },
  {
    name: "MeditationTashkent",
    id: 2,
    title: "приглашение на КМ",
  },
];

export const R_ADSETS_NAMES: IBlock[] = [
  {
    name: "contact",
    id: 1,
    title: "контакт",
  },
  {
    name: "contact-with-interests",
    id: 2,
    title: "контакт с интересами",
  },
  {
    name: "lead-with-interests",
    id: 3,
    title: "лид с интересами",
  },
  {
    name: "lead-without-interests",
    id: 4,
    title: "лид без интересов",
  },
];
export const R_ADS_NAMES: IBlock[] = [
  {
    name: "v-meditation-0",
    id: 1,
    title: "в. приглашение на медитацию",
  },
  {
    name: "video0",
    id: 2,
    title: "в. приглашение на встречу 0",
  },
  {
    name: "video1",
    id: 3,
    title: "в. приглашение на встречу 1",
  },
];
