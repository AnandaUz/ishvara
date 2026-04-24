export interface IEventCodeItem {
  name?: string;
  code: number;
  title?: string;
  color?: string;
  class?: string;
}
export const EVENT_CODE = {
  scroll0: { code: 1, title: "0%", class: "scroll s0" },
  scroll1: { code: 2, title: "16%", class: "scroll s1" },
  scroll2: { code: 3, title: "33%", class: "scroll s2" },
  scroll3: { code: 4, title: "50%", class: "scroll s3" },
  scroll4: { code: 5, title: "66%", class: "scroll s4" },
  scroll5: { code: 6, title: "83%", class: "scroll s5" },
  scroll6: { code: 7, title: "100%", class: "scroll s6" },
  inPage: { code: 8, title: "Вход на страницу", class: "page-in" },
  outPage: { code: 9, title: "Выход со страницы", class: "page-out" },
  goalBtnClick: {
    code: 10,
    title: "Клик по кнопке цели",
    class: "goalBtnClick",
  },
  showPage: { code: 11, title: "Показ страницы", class: "show-page" },
  goalBtnGaude: {
    code: 12,
    title: "Открыли гайд",
    class: "goalBtnGaude",
  },
} as const satisfies Record<string, IEventCodeItem>;

export const EVENT_BY_CODE = Object.fromEntries(
  Object.values(EVENT_CODE).map((item) => [item.code, item]),
);

export interface IMetaEventLevel {
  name?: string;
  code: number;
  title?: string;
  value?: number;
}
export const META_EVENTS_LEVEL = {
  Purchase: {
    code: 7,
    title: "Ходит 3 месяца",
    value: 200,
  },
  Schedule: {
    code: 6,
    title: "Сделал первую оплату",
    value: 100,
  },
  QualifiedLead: {
    code: 5,
    title: "Согласился участвовать",
    value: 50,
  },
  Lead: {
    code: 4,
    title: "Пришёл на встречу",
    value: 10,
  },
  InitiateCheckout: {
    code: 3,
    title: "Нажал на кнопку регистрации, отвечает на вопросы",
  },
  Contact: {
    code: 2,
    title: "Проявил интерес к странице (посмотрел видео)",
  },
  EngagedView: {
    code: 1,
    title: "Живой и вовлечённый",
  },
} as const satisfies Record<string, IMetaEventLevel>;

export const META_EVENT_LEVEL_BY_CODE = Object.fromEntries(
  Object.entries(META_EVENTS_LEVEL).map(([key, item]) => [item.code, key]),
);

export const META_EVENT_BY_CODE = Object.fromEntries(
  Object.values(META_EVENTS_LEVEL).map((item) => [item.code, item]),
);

interface IGuestTag {
  code: number;
  title: string;
}
export const GUEST_TAGS = {
  // начинаю с 10 так как использовал предыдущие чтобы указывать уровень событий для меты
  returned: {
    code: 10,
    title: "Вернувшийся",
  },
} as const satisfies Record<string, IGuestTag>;
