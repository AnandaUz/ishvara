import "./c-statictics-block.scss";
import template from "./c-statictics-block.html?raw";

import "@/components/c-graphs/c-graphs";
import { CGraphs, GraphData } from "@/components/c-graphs/c-graphs";
import { core } from "@/features/core";
import { api } from "@/services/api";
import { TAGS } from "@shared/types/Tags";
import { Tools } from "@/services/tools";

const DAY_IN_MS = 1000 * 60 * 60 * 24;

export class CStaticticsBlock extends HTMLElement {
  constructor() {
    super();
  }
  async init() {
    this.innerHTML = template;

    const body = this.querySelector(".body");

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
      ],
    });
    const dataBots = await api.statistics.countBots({
      projectId: Number(projectId),
      companyId: Number(companyId),
    });
    //#endregion

    // #region статстика по целям
    const graphs2 = new CGraphs();
    body.appendChild(graphs2);
    graphs2.init();

    const graphsDatas2: GraphData[] = [];
    graphsDatas2[TAGS.goals.middle.code] = new GraphData({
      color: TAGS.goals.middle.bgColor,
      pointRadius: 0,
    });
    graphsDatas2[TAGS.goals.top.code] = new GraphData({
      color: TAGS.goals.top.bgColor,
      pointRadius: 0,
    });
    graphsDatas2[TAGS.page.tours.code] = new GraphData({
      color: TAGS.page.tours.bgColor,
      pointRadius: 0,
    });

    data.forEach(
      (item: {
        _id: string;
        data: Array<{ tagId: number; count: number }>;
      }) => {
        const date = new Date(item._id).getTime();

        if (date < 1740834000000) return;

        item.data.forEach((p) => {
          const graphData = graphsDatas2[p.tagId];
          if (graphData) {
            graphData.points.set(date, {
              value: p.count,
              date: date,
            });
          }
        });
      },
    );
    graphsDatas2.forEach((graphData) => {
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
    graphsDatas2.forEach((graphData) => {
      graphs2.addGraph(graphData);
    });
    graphs2.refreshData();
    graphs2.setStartPosition();

    graphs2.render();
    //#endregion

    //---

    const graphs = new CGraphs();
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

    data.forEach(
      (item: {
        _id: string;
        data: Array<{ tagId: number; count: number }>;
      }) => {
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
      },
    );

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
