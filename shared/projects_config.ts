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
        },
      },
      MeditationTashkent: {
        name: "Медитации в Ташкенте",
        id: 2,
        pixel: "masterMind",
        summary: "Коллективные медитации",
        companyPageURL: "https://esho.uz/meditation",
        adsets: {
          "CM-contact-with-interests-05_05_26": {
            name: "новый пиксель/с интересами/просмотр контента",
            createdAt: "05.05.2026",
            summary: `решил попробовать обновить пиксель, и сразу же на КМ тоже решил эксперементировать`,
            id: 1,
            ads: {
              "v-meditation-0": { name: "v-meditation-0", id: 1 },
            },
          },
          "CM-contact-05_05_26": {
            name: "новый пиксель/без интересов/просмотр контента",
            createdAt: "05.05.2026",
            summary: `решил попробовать обновить пиксель, и сразу же на КМ тоже решил эксперементировать`,
            id: 2,
            ads: {
              "v-meditation-0": { name: "v-meditation-0", id: 1 },
            },
          },
        },
      },
    },
  },
} as const;
