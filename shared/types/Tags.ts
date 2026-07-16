interface ITagItem {
  name?: string;
  description?: string;
  code: number;
  bgColor?: string;
  fontColor?: string;
}

export const TAGS = {
  bot: {
    bot: {
      code: 2000,
      name: "bot",
      description: "Бот",
      bgColor: "#748e99ff",
      fontColor: "#ffffff",
    },
  },
  events: {
    click_topBaner: {
      code: 101,
      name: "cl baner",
      description: "Клик банер",
      bgColor: "#ff566cff",
      fontColor: "#ffffff",
    },
    click_bronirivat: {
      code: 102,
      name: "cl бронировать",
      description: "Клик бронировать",
      bgColor: "#af3d4cff",
      fontColor: "#ffffff",
    },
    click_copyPhone: {
      code: 103,
      name: "cl копировать телефон",
      description: "Клик копировать телефон",
      bgColor: "#b808cfff",
      fontColor: "#ffffff",
    },
    tourFilter: {
      code: 104,
      name: "cl фильтр тур",
      description: "Клик фильтр тур",
      bgColor: "#01ccbbff",
      fontColor: "#d1e0ffff",
    },
    smallSearchTours: {
      code: 105,
      name: "Поиск туров малая форма",
      bgColor: "#2ca09aff",
      fontColor: "#021853ff",
    },
  },
  goals: {
    middle: {
      code: 31,
      name: "middle",
      description: "Достижение средней цели",
      bgColor: "#ff56daff",
      fontColor: "#ffffff",
    },
    top: {
      code: 32,
      name: "top",
      description: "Достижение главной цели",
      bgColor: "#ff5f38ff",
      fontColor: "#ffffff",
    },
  },
  scroll: {
    was: {
      code: 10,
      name: "scroll",
      description: "На странице был скролл",
      bgColor: "#95caadff",
      fontColor: "#000000",
    },
  },
  page: {
    tours: {
      code: 20,
      name: "стр Туры",
      description: "Страница туры",
      bgColor: "#d8b281ff",
    },
    openTourDetails: {
      code: 26,
      name: "Переход в описание тура",
      bgColor: "#019af3ff",
      fontColor: "#d1fff9ff",
    },
  },
} as const satisfies Record<string, Record<string, ITagItem>>;

function flattenTags(tags: typeof TAGS): ITagItem[] {
  return Object.values(tags).flatMap((category) => Object.values(category));
}

const FLAT_TAGS = flattenTags(TAGS);

export const TAGS_TOOLS = {
  codeToName: new Map(FLAT_TAGS.map((e) => [e.code, e.name])),
  codeToDescription: new Map(FLAT_TAGS.map((e) => [e.code, e.description])),
  codeToBgColors: new Map(
    FLAT_TAGS.map((e) => [
      e.code,
      { bgColor: e.bgColor, fontColor: e.fontColor },
    ]),
  ),
  // codeToFontColor: new Map(FLAT_TAGS.map((e) => [e.code, e.fontColor])),

  // getNames(events: (number | string)[]): (string | undefined)[] {
  //   return events.map((ev) =>
  //     typeof ev === "number" ? oldCodeToName.get(ev) : codeToName.get(ev),
  //   );
  // },
};
