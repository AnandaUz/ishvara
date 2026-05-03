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