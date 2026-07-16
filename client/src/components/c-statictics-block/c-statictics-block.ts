import "./c-statictics-block.scss";
import template from "./c-statictics-block.html?raw";

import "@/components/c-graphs/c-graphs";
import { CGraphs, GraphData } from "@/components/c-graphs/c-graphs";
import { core } from "@/features/core";
import { api } from "@/services/api";
import { TAGS, TAGS_TOOLS } from "@shared/types/Tags";
import { Tools } from "@/services/tools";
import { CTagsTree } from "../c-tags-tree/c-tags-tree";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

interface ITagStat {
  tagId: number;
  count: number;
}

export class CStaticticsBlock extends HTMLElement {
  constructor() {
    super();
  }
  addGraphBlock({
    title,
    parentBlock,
    tags,
    data,
  }: {
    title: string;
    parentBlock?: HTMLElement;
    tags: number[];
    data?: Array<{ _id: string; data: Array<ITagStat> }>;
  }) {
    if (!data) return;
    const graphs = new CGraphs({ title });
    (parentBlock || this).appendChild(graphs);
    graphs.init();

    const graphsDatas: GraphData[] = [];
    tags.forEach((tagCode) => {
      const colors = TAGS_TOOLS.codeToBgColors.get(tagCode);
      graphsDatas[tagCode] = new GraphData({
        color: colors?.bgColor || "rgba(0, 255, 115, 1)",
        pointRadius: 0,
      });
    });
    data.forEach((item: { _id: string; data: Array<ITagStat> }) => {
      const date = new Date(item._id).getTime();

      if (date < 1740834000000) return;

      item.data.forEach((p) => {
        const graphData = graphsDatas[p.tagId];
        if (graphData) {
          graphData.points.set(date, {
            value: p.count,
            date: date,
            title: `${TAGS_TOOLS.codeToName.get(p.tagId)}: ${p.count}`,
          });
        }
      });
    });
    graphsDatas.forEach((graphData) => {
      const points = graphData.points;
      const m = Array.from(points.values());
      const minDate = m[0]?.date || 0;
      const maxDate = m[m.length - 1]?.date || 0;

      const daysDiff = (maxDate - minDate) / DAY_IN_MS;
      for (let day = 0; day < daysDiff; day++) {
        const date = minDate + day * DAY_IN_MS;

        if (!points.has(date)) {
          points.set(date, { value: 0, date: date });
        }
      }
    });
    graphsDatas.forEach((graphData) => {
      graphs.addGraph(graphData);
    });
    graphs.refreshData();
    graphs.setStartPosition();

    graphs.render();
  }
  async init() {
    const tagsTree = document.createElement("c-tag-tree");
    document.body.appendChild(tagsTree);
    this.innerHTML = template;

    const body = this.querySelector(".body") as HTMLElement;

    if (!body) return;
    const projectId = core.localPersistence.state.projectId || "";
    const companyId = core.localPersistence.state.companiesIds?.[projectId];

    if (!projectId) return;

    // #region загрузка данных
    const data: Array<{ _id: string; data: Array<ITagStat> }> =
      await api.statistics.countTags({
        projectId: Number(projectId),
        companyId: Number(companyId),
        tags: [
          TAGS.scroll.was.code,
          TAGS.page.tours.code,
          TAGS.goals.middle.code,
          TAGS.goals.top.code,

          //events
          TAGS.events.click_topBaner.code,
          TAGS.events.click_bronirivat.code,
          TAGS.events.click_copyPhone.code,
          TAGS.events.tourFilter.code,
          TAGS.events.smallSearchTours.code,
          TAGS.page.openTourDetails.code,
        ],
      });
    const dataBots = await api.statistics.countBots({
      projectId: Number(projectId),
      companyId: Number(companyId),
    });
    dataBots.forEach((bot: { _id: string; count: number }) => {
      const d = data.find((item) => {
        return item._id === bot._id;
      });
      if (d) {
        d.data.push({ tagId: TAGS.bot.bot.code, count: bot.count });
      }
    });
    //#endregion

    // #region статстика по целям
    this.addGraphBlock({
      title: "События",
      parentBlock: body,
      tags: [
        TAGS.events.click_topBaner.code,
        TAGS.events.click_bronirivat.code,
        TAGS.events.click_copyPhone.code,
        TAGS.events.tourFilter.code,
        TAGS.events.smallSearchTours.code,
        TAGS.page.openTourDetails.code,
      ],
      data,
    });

    //#endregion

    this.addGraphBlock({
      title: "Общие события",
      parentBlock: body,
      tags: [TAGS.scroll.was.code, TAGS.page.tours.code, TAGS.bot.bot.code],
      data,
    });

    // const midArray: number[] = Tools.loess(predMidArray, 10);
  }
  connectedCallback() {
    this.init();
  }
}

customElements.define("c-statictics-block", CStaticticsBlock);
