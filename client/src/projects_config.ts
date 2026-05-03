import type { IGuest } from "@shared/types/IGuest";

export interface ProjectConfig {
  name: string;
  id: string;
  filterFunc: (guest: IGuest) => boolean;
  isOff?: boolean;
}
export interface IBigProjectConfig {
  name: string;
  id: number;
  summary?: string;
  companys: {
    [key: string]: {
      name: string;
      id: number;
      summary?: string;
      companyPageURL: string;
      adsets: {
        [key: string]: {
          name: string;
          createdAt: string;
          summary?: string;
          id: number;
          ads: {
            [key: string]: {
              name: string;
              id: number;
            };
          };
        };
      };
    };
  };
}
export const BitProjects: Record<string, IBigProjectConfig> = {
  mastermind_paid: {
    name: "Сайт esho.uz",
    id: 100,
    summary: "сейчас этои ПММ и КМ",
    companys: {
      mastermind: {
        name: "mastermind",
        id: 1,
        summary: "Платный МастерМайнд",
        companyPageURL: "https://esho.uz/meet",
        adsets: {
          "26-05-04-mastermaind-contact-with-interests-newPixel": {
            name: "ПММ новый пиксель",
            createdAt: "03.05.2026",
            summary: `решил попробовать обновить пиксель, так как есть ощущение что он обучен на неверных данных
    данные раньше собирались по нажатию на кнопку, и там было много мёртвых душ
    `,
            id: 1,
            ads: {
              video0: { name: "video0", id: 1 },
              video1: { name: "video1", id: 2 },
            },
          },
        },
      },
    },
  },
} as const;

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
    isOff: true,
  },
  {
    name: "ПММ - встречи - новый пиксель",
    id: "new-pixel",
    filterFunc: (guest: IGuest) => {
      const project = BitProjects.mastermind_paid;
      if (guest.projectId === project?.id) {
        const company = project?.companys.mastermind;
        if (company?.id === guest.instagram?.comp_name) {
          const i =
            company?.adsets[
              "26-05-04-mastermaind-contact-with-interests-newPixel"
            ];
          if (guest.instagram?.adset_name === i?.id) {
            return true;
          }
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
