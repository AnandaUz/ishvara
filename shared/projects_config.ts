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
      pixel?: string;
      tgbotName: string;
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
export const bigProjects: Record<string, IBigProjectConfig> = {
  mastermind_paid: {
    name: "Сайт esho.uz",
    id: 100,
    summary: "сейчас этои ПММ и КМ",
    companys: {
      MasterMind: {
        name: "MasterMind",
        id: 1,
        pixel: "masterMind",
        summary: "Платный МастерМайнд",
        companyPageURL: "https://esho.uz/meet",
        tgbotName: "mastermind",
        adsets: {
          "26-05-04-mastermaind-contact-with-interests-newPixel": {
            name: "ПММ новый пиксель",
            createdAt: "03.05.2026",
            summary: `решил попробовать обновить пиксель, так как есть ощущение что он обучен на неверных данных
    данные раньше собирались по нажатию на кнопку, и там было много мёртвых душ
    `,
            id: 1,
            ads: {
              "video-0": { name: "video-0", id: 1 },
              "video-1": { name: "video-1", id: 2 },
            },
          },
          "26.05.12-ПMM-PView-Almata": {
            name: "Алмата - PView",
            createdAt: "12.05.26",
            summary: `запускаю на Алмату, хочется посмотреть как там люди хотят худеть`,
            id: 2,
            ads: {
              "video-0": { name: "video-0", id: 1 },
              "video-1": { name: "video-1", id: 2 },
            },
          },
        },
      },

      MeditationTashkent: {
        name: "Медитации в Ташкенте",
        id: 2,
        pixel: "masterMind",
        summary: "Коллективные медитации",
        companyPageURL: "https://esho.uz/meditation",
        tgbotName: "meditation",
        adsets: {
          "CM-contact-with-interests-05_05_26": {
            name: "новый пиксель/с интересами/просмотр контента",
            createdAt: "05.05.2026",
            summary: `решил попробовать обновить пиксель, и сразу же на КМ тоже решил эксперементировать`,
            id: 1,
            ads: {
              "v-meditation": { name: "v", id: 1 },
              "v-meditation-0": { name: "v-meditation-0", id: 2 },
            },
          },
          "CM-contact-05_05_26": {
            name: "новый пиксель/без интересов/просмотр контента",
            createdAt: "05.05.2026",
            summary: `решил попробовать обновить пиксель, и сразу же на КМ тоже решил эксперементировать`,
            id: 2,
            ads: {
              "v-meditation": { name: "v", id: 1 },
              "v-meditation-0": { name: "v-meditation-0", id: 2 },
            },
          },
          "CM-contact-with-interests": {
            name: "новый пиксель/с интересами/просмотр контента",
            createdAt: "05.05.2026",
            summary: `+ решил попробовать обновить пиксель, и сразу же на КМ тоже решил эксперементировать`,
            id: 3,
            ads: {
              "v-meditation": { name: "v", id: 1 },
              "v-meditation-0": { name: "v-meditation-0", id: 2 },
            },
          },
          "CM-contact": {
            name: "новый пиксель/без интересов/просмотр контента",
            createdAt: "05.05.2026",
            summary: `+ решил попробовать обновить пиксель, и сразу же на КМ тоже решил эксперементировать`,
            id: 4,
            ads: {
              "v-meditation": { name: "v", id: 1 },
              "v-meditation-0": { name: "v-meditation-0", id: 2 },
            },
          },
        },
      },
    },
  },
} as const;
export const getBigProjectById = (
  id: number,
): IBigProjectConfig | undefined => {
  return Object.values(bigProjects).find((project) => project.id === id);
};
export const getBProjectCompanyById = (
  projectId: number,
  companyId: number,
): IBigProjectConfig["companys"][0] | undefined => {
  const project = getBigProjectById(projectId);
  if (!project) return undefined;
  return Object.values(project.companys).find(
    (company) => company.id === companyId,
  );
};
export const getBProjectCompanyAdsetById = (
  projectId: number,
  companyId: number,
  adsetId: number,
): IBigProjectConfig["companys"][0]["adsets"][0] | undefined => {
  const project = getBigProjectById(projectId);
  if (!project) return undefined;
  const company = Object.values(project.companys).find(
    (company) => company.id === companyId,
  );
  if (!company) return undefined;
  return Object.values(company.adsets).find((adset) => adset.id === adsetId);
};
