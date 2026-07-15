import "./c-statictics-block.scss";
import template from "./c-statictics-block.html?raw";

import "@/components/c-graphs/c-graphs";
import { CGraphs, GraphData } from "@/components/c-graphs/c-graphs";
import { core } from "@/features/core";
import { api } from "@/services/api";
import { TAGS, TAGS_TOOLS } from "@shared/types/Tags";
import { Tools } from "@/services/tools";

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
    this.innerHTML = template;

    const body = this.querySelector(".body") as HTMLElement;

    if (!body) return;
    const projectId = core.localPersistence.state.projectId || "";
    const companyId = core.localPersistence.state.companiesIds?.[projectId];

    if (!projectId) return;

    // #region загрузка данных
    const data = await api.statistics.countTags({
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
      ],
    });
    const dataBots = await api.statistics.countBots({
      projectId: Number(projectId),
      companyId: Number(companyId),
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
      ],
      data,
    });

    //#endregion

    //---

    const graphs = new CGraphs({ title: "Глобальная посещаемость" });
    body.appendChild(graphs);
    graphs.init();

    //

    const graphBots = new GraphData({ color: "#6d6d6dff", pointRadius: 0 });

    // console.log(dataBots);
    dataBots.forEach((item: { _id: string; count: number }) => {
      const date = new Date(item._id).getTime();

      graphBots.points.set(date, {
        value: item.count,
        date: date,
      });
    });
    graphs.addGraph(graphBots);

    const graphsDatas = new Map<number, GraphData>();
    graphsDatas.set(
      TAGS.scroll.was.code,
      new GraphData({ color: TAGS.scroll.was.bgColor, pointRadius: 0 }),
    );
    graphsDatas.set(
      TAGS.page.tours.code,
      new GraphData({ color: TAGS.page.tours.bgColor, pointRadius: 0 }),
    );

    //{"_id":"2019-12-21","data":[{"tagId":10,"count":1}]}

    data.forEach((item: { _id: string; data: Array<ITagStat> }) => {
      const date = new Date(item._id).getTime();

      if (date < 1740834000000) return;

      item.data.forEach((p) => {
        const graphData = graphsDatas.get(p.tagId);
        if (graphData) {
          graphData.points.set(date, {
            value: p.count,
            date: date,
          });
        }
      });
    });

    graphsDatas.forEach((graphData) => {
      graphs.addGraph(graphData);
    });

    // #region усреднёный график для тега скролл
    const graphScrollMid = new GraphData({
      color: "#009933ff",
      strokeWidth: 3,
    });

    // console.log(dataBots);
    const grScrollPoints = graphsDatas.get(TAGS.scroll.was.code)!.points;
    const m = Array.from(grScrollPoints.values());
    const minDate = m[0]?.date || 0;
    const maxDate = m[m.length - 1]?.date || 0;
    const predMidArray: number[] = [];
    if (minDate && maxDate) {
      const daysDiff = (maxDate - minDate) / DAY_IN_MS;
      for (let day = 0; day < daysDiff; day++) {
        const date = minDate + day * DAY_IN_MS;
        const val = grScrollPoints.get(date);
        if (val) {
          predMidArray.push(val.value);
        } else {
          predMidArray.push(0);
        }
      }
    }
    const midArray: number[] = Tools.loess(predMidArray, 10);
    midArray.forEach((value, i) => {
      const date = minDate + i * DAY_IN_MS;

      graphScrollMid.points.set(date, {
        value: value,
        date: date,
      });
    });
    graphs.addGraph(graphScrollMid);

    //#endregion

    // ----------------------
    // const graph1 = new GraphData("#013b1381", 2);

    // const d1 = new Date("2025-01-2");
    // d1.setHours(10, 0, 0, 0);
    // graph1.points.set(d1, {
    //   value: 0,
    //   date: d1,
    // });
    // const d2 = new Date();
    // d2.setHours(10, 0, 0, 0);
    // graph1.points.set(d2, {
    //   value: 100,
    //   date: d2,
    // });

    // graphs.addGraph(graph1);

    graphs.refreshData();
    graphs.setStartPosition();

    graphs.render();
  }
  connectedCallback() {
    this.init();
  }
}

customElements.define("c-statictics-block", CStaticticsBlock);
