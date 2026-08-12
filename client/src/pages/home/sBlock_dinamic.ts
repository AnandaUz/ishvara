import { api } from "@/services/api";
import { core } from "@features/core";

const LineMode = {
  discription: "description",
  echo: "echo",
};
type TLineMode = (typeof LineMode)[keyof typeof LineMode];

export const sBlock_dinamic = async () => {
  // dynamics
  const list = document.querySelector(".dynamics-list") as HTMLElement;
  list.innerHTML = "";
  const data = await api.statistics.pageVisitsForWeeks({
    projectId: Number(core.localPersistence.state.projectId),
  });

  const fragment = document.createDocumentFragment();

  const lastWeek = data["week1"];
  for (let i = 0; i < lastWeek.length; i++) {
    let lineMode: TLineMode | "" = "";
    const item = lastWeek[i] as { _id: number; count: number };
    const page = core.pagesURLData.getPathById(item._id);

    let segments = page?.split("/").filter(Boolean);

    if (segments?.length == 0) segments = ["🏠"];
    let eventName = segments
      ?.map((segment, i) => {
        let cls = `s${i + 1}`;
        if (segment === LineMode.discription) {
          lineMode = LineMode.discription;
        } else if (segment === LineMode.echo) {
          lineMode = LineMode.echo;
        }
        return `<span class="${cls}">${segment}</span>`;
      })
      .join("");

    let history: number[] = [];
    for (let w of Object.values(data)) {
      const week = w as Array<{ _id: number; count: number }>;
      const likeItem = week.find((it) => it._id === item._id);
      if (likeItem) history.push(likeItem.count);
      else history.push(0);
    }
    let historyString = "";
    let t = 0;
    let f = true;
    history.reverse().forEach((week) => {
      const dt = week - t;
      let s = "";
      if (dt > 0) {
        s = `<i>+ ${Math.abs(dt)}</i>`;
      } else if (dt < 0) {
        s = `<i class="minus">- ${Math.abs(dt)}</i>`;
      } else {
        s = "<i></i>";
      }
      if (f) {
        s = "<i></i>";
        f = false;
      }
      //  const s = dt > 0 ? "+" : dt == 0 ? " " : "-";
      historyString = `<span> ${week} ${s}</span>` + historyString;
      t = week;
    });

    const div = document.createElement("div");
    div.classList.add("line", "m1");
    if (lineMode) {
      div.classList.add(lineMode);
    }
    div.innerHTML = `<div class="count">${historyString}</div>
                <!-- <div class="id">${item._id}</div> -->
                <div class="events"><a href="https://world-travel.uz${page}" target="_blank">${eventName}</a></div>`;

    fragment.appendChild(div);
  }
  list.appendChild(fragment);
};
