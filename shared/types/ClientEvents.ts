interface IClientEventCodeItem {
  name?: string;
  oldCode?: number | string;
  code: number;
}
export const CLIENT_EVENTS = {
  scroll: {
    up: { code: 11, name: "скрол наверх" },
    down: { code: 12, name: "скрол вниз" },
    scroll1: { code: 13, name: "скрол 1", oldCode: 1 },
    scroll2: { code: 14, name: "скрол 2", oldCode: 2 },
    scroll3: { code: 15, name: "скрол 3", oldCode: 3 },
    scroll4: { code: 16, name: "скрол 4", oldCode: 4 },
    scroll5: { code: 17, name: "скрол 5", oldCode: 5 },
    scroll6: { code: 18, name: "скрол 6", oldCode: 6 },
    scroll7: { code: 19, name: "скрол 7", oldCode: 7 },
  },
  page: {
    in: { code: 21, name: "Вход на страницу", oldCode: 8 },
    out: { code: 22, name: "Выход со страницы", oldCode: 9 },
  },
} as const satisfies Record<string, Record<string, IClientEventCodeItem>>;

// { code: "vS", name: "Bидео - старт", oldCode: "v:start" },
// { code: "vH", name: "Bидео - середина", oldCode: "v:half" },
// { code: "vC", name: "Bидео - конец", oldCode: "v:complete" },
// { code: "bM", name: "??", oldCode: "btnMaps" },
// { code: "b0", name: "Клик по кнопке целиё", oldCode: "goalBtnClick" },

// // wt events
// { code: "s1", name: "скрол 10%", oldCode: 1 },
// { code: "s2", name: "скрол 25%", oldCode: 2 },
// { code: "s3", name: "скрол 50%", oldCode: 3 },
// { code: "s4", name: "скрол 75%", oldCode: 4 },
// { code: "s5", name: "скрол 100%", oldCode: 5 },
// { code: "s6", name: "скрол 100%", oldCode: 6 },
// { code: "s7", name: "скрол 100%", oldCode: 7 },
// { code: "pI", name: "Вход на страницу", oldCode: 8 },
// { code: "pO", name: "Выход со страницы", oldCode: 9 },
// { code: "gl", name: "Клик по кнопке цели", oldCode: 10 },
// { code: "pS", name: "Показал страницу", oldCode: 11 },
// { code: "oG", name: "Открыл гайд", oldCode: 12 },
// { code: "cl", name: "Клик", oldCode: "c" },
// { code: "iR", name: "??", oldCode: "inner-routing" },

// { code: "pT", name: "Показал туры", oldCode: "tours-show" },
// { code: "tD", name: "??", oldCode: "open-tour-details" },
// { code: "fS", name: "??", oldCode: "small-search-tours" },
// { code: "tF", name: "??", oldCode: "tour-filter" },
// { code: "bF", name: "Показ формы брони", oldCode: "show-booking-form" },
// { code: "cP", name: "Скопировал телефон", oldCode: "copy-booking-phone" },
// { code: "bС", name: "Клик по баннеру", oldCode: "c-tBaner" },
// {
//   code: "tC",
//   name: "Показал контакт фирмы",
//   oldCode: "show-tour-firm-contacts",
// },
// { code: "tG", name: "??", oldCode: "tour-go-to-firm" },
// { code: "t1", name: "??", oldCode: "tours-search" },
// { code: "tL", name: "Лайк на туре", oldCode: "tour-set-like" },
// { code: "cF", name: "Копировал телефон фирмы", oldCode: "copy-firm-phone" },
// { code: "t2", name: "??", oldCode: "tour-filter-mobile" },
// { code: "t3", name: "Сортировка туров", oldCode: "tours-ordering" },
// {
//   code: "t4",
//   name: "Показал контакт фирмы",
//   oldCode: "show-tour-firm-contacts",
// },

function flattenEvents(events: typeof CLIENT_EVENTS) {
  return Object.values(events).flatMap((category) => Object.values(category));
}

const FLAT_EVENTS = flattenEvents(CLIENT_EVENTS);

export const CLIENT_EVENTS_TOOLS = {
  oldCodeToName: new Map(
    FLAT_EVENTS.filter((e) => e.oldCode !== undefined).map((e) => [
      e.oldCode,
      e.name,
    ]),
  ),
  codeToName: new Map(FLAT_EVENTS.map((e) => [e.code, e.name])),
  oldCodeToCode: new Map(
    FLAT_EVENTS.filter((e) => e.oldCode !== undefined).map((e) => [
      e.oldCode,
      e.code,
    ]),
  ),

  // getNames(events: (number | string)[]): (string | undefined)[] {
  //   return events.map((ev) =>
  //     typeof ev === "number" ? oldCodeToName.get(ev) : codeToName.get(ev),
  //   );
  // },
};
