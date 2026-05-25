export interface IAd {
  id: number;
  name: string;
}

export interface IAdSet {
  id: number;
  name: string;
  nameInInst?: string;
  createdAt: string;
  summary?: string;
  city?: string;
  country?: string;
  ads?: IAd[];
  isOff?: boolean;
}

export interface ICompany {
  id: number;
  name: string;
  summary?: string;
  companyPageURL?: string;
  pixel?: string;
  tgbotName?: string;
  adsets?: IAdSet[];
  isOff?: boolean;
}

export interface IBigProjectConfig {
  id: number;
  name: string;
  summary?: string;
  isOff?: boolean;
  companys?: ICompany[];
  pixel?: string;
}
export const bigProjects: IBigProjectConfig[] = [
  {
    id: 5,
    name: "World Travel",
  },
  {
    id: 10,
    name: "Медитация",
    companys: [
      {
        id: 2,
        name: "КМ",
        pixel: "masterMind",
        summary: "Коллективные медитации",
        companyPageURL: "https://esho.uz/meditation",
        tgbotName: "meditation",
        adsets: [
          {
            id: 1,
            name: "с интересами + просмотр контента",
            nameInInst: "CM-contact-with-interests-05_05_26",
            createdAt: "05.05.2026",
            summary: `решил попробовать обновить пиксель, и сразу же на КМ тоже решил эксперементировать`,
            city: "tashkent",
            country: "uz",
            ads: [{ name: "v-meditation-0", id: 2 }],
          },
        ],
      },
    ],
  },
  {
    id: 100,
    name: "Esho.uz",
    summary: "сейчас это ПММ",
    companys: [
      {
        name: "MasterMind",
        id: 1,
        pixel: "masterMind",
        summary: "Платный МастерМайнд",
        companyPageURL: "https://esho.uz/meet",
        tgbotName: "mastermind",
        adsets: [
          {
            id: 1,
            name: "просмотр контента",
            nameInInst: "26-05-04-mastermaind-contact-with-interests-newPixel",
            createdAt: "03.05.2026",
            city: "tashkent",
            country: "uz",
            summary: `решил попробовать обновить пиксель, так как есть ощущение что он обучен на неверных данных
    данные раньше собирались по нажатию на кнопку, и там было много мёртвых душ`,
            ads: [
              { id: 1, name: "video-0" },
              { id: 2, name: "video-1" },
            ],
          },
          {
            id: 2,
            name: "PView Алматы",
            nameInInst: "26.05.12-ПMM-PView-Almata",
            createdAt: "12.05.26",
            summary: `запускаю на Алмату, хочется посмотреть как там люди хотят худеть`,
            city: "almaty",
            country: "kz",
            ads: [
              { id: 1, name: "video-0" },
              { id: 2, name: "video-1" },
            ],
          },
          {
            id: 3,
            name: "начало + интересы",
            nameInInst: "",
            createdAt: "05.26",
            summary: `начальные запуски`,
            city: "tashkent",
            country: "uz",
            ads: [
              { id: 1, name: "video-0" },
              { id: 2, name: "video-1" },
            ],
          },
        ],
      },
      {
        name: "ТГ портал",
        id: 3,
        summary: "",
        tgbotName: "mastermind",
      },
    ],
  },
] as const;

export const bigProjectsGet = {
  projectById: (id: number): IBigProjectConfig | undefined => {
    return bigProjects.find((p) => p.id === id);
  },
  companyById: (projectId: number, companyId: number): ICompany | undefined => {
    return bigProjectsGet
      .projectById(projectId)
      ?.companys?.find((c) => c.id === companyId);
  },
  adsetById: (
    projectId: number,
    companyId: number,
    adsetId: number,
  ): IAdSet | undefined => {
    return bigProjectsGet
      ?.companyById(projectId, companyId)
      ?.adsets?.find((a) => a.id === adsetId);
  },
  adById: (
    projectId: number,
    companyId: number,
    adsetId: number,
    adId: number,
  ): IAd | undefined => {
    return bigProjectsGet
      ?.adsetById(projectId, companyId, adsetId)
      ?.ads?.find((a) => a.id === adId);
  },
} as const;
