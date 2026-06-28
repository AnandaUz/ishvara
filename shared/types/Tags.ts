interface ITagItem {
  name?: string;
  description?: string;
  code: number;
  bgColor?: string;
  fontColor?: string;
}

export const TAGS = {
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
    tours: { code: 20, name: "стр Туры", description: "Страница туры" },
  },
} as const satisfies Record<string, Record<string, ITagItem>>;

function flattenTags(tags: typeof TAGS): ITagItem[] {
  return Object.values(tags).flatMap((category) => Object.values(category));
}

const FLAT_TAGS = flattenTags(TAGS);

export const TAGS_TOOLS = {
  codeToName: new Map(FLAT_TAGS.map((e) => [e.code, e.name])),
  codeToDescription: new Map(FLAT_TAGS.map((e) => [e.code, e.description])),
  codeToBgColor: new Map(FLAT_TAGS.map((e) => [e.code, e.bgColor])),
  // codeToFontColor: new Map(FLAT_TAGS.map((e) => [e.code, e.fontColor])),

  // getNames(events: (number | string)[]): (string | undefined)[] {
  //   return events.map((ev) =>
  //     typeof ev === "number" ? oldCodeToName.get(ev) : codeToName.get(ev),
  //   );
  // },
};
