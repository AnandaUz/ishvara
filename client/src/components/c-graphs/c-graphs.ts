import "./c-graphs.scss";
import html from "./c-graphs.html?raw";

const DAY_IN_MS = 1000 * 60 * 60 * 24;
const Options = {
  scale: {
    forDay: 20,
    forValue: 1,
    scaleStep: 0.2,
  },
  weedend_color: "#89cc983b",
  supportLine_color: "#00000023",
  comment_color: "#00771eff",
  supportLine_width: 1,
} as const;
interface PointData {
  x: number;
  y: number;
  value: number;
  color?: string;
  radius?: number;
}
interface GraphSettings {
  color?: string;
  strokeWidth?: number;
  pointRadius?: number;
}
export class GraphData {
  points = new Map<number, TGraphPoint>();
  settings: GraphSettings = {
    color: "#ff8181ff",
    strokeWidth: 1,
    pointRadius: 1,
  };
  constructor(settings?: GraphSettings) {
    if (settings) this.settings = { ...this.settings, ...settings };
  }
}
export interface TGraphPoint {
  value: number;
  date: number;
  title?: string;
  comment?: string;
  isDashed?: boolean;
}
interface IBg {
  svgStr: string;
  position: { dx: number; dy: number };
  size: { w: number; h: number };
  repeat: string;
}

export class CGraphs extends HTMLElement {
  private isDragging = false;
  private startX = 0;
  private startY = 0;
  private initialLeft = 0;
  private initialTop = 0;
  private desk!: HTMLDivElement;

  private svg!: SVGElement;
  private bgs: Array<IBg> = [];
  private destPosition = { x: 0, y: 0 };
  private dYY = 0;
  private graphs: GraphData[] = [];
  private tooltip!: HTMLDivElement;
  title: string = "";

  optionsFromGraphs = {
    minValue: -Infinity,
    maxValue: Infinity,
    minDate: 0,
    maxDate: 0,
    dayCount: 0,
  };

  scale: { forDay: number; forValue: number } = {
    forDay: Options.scale.forDay,
    forValue: Options.scale.forValue,
  };
  constructor({ title }: { title?: string }) {
    super();
    this.title = title ?? "";
  }
  addGraph(graph: GraphData) {
    this.graphs.push(graph);
  }
  refreshData() {
    this.refresthOptionsFromGraphs();
    this.renderBgs();
    this.setDestPosition();
  }
  init() {
    this.innerHTML = html;
    this.desk = this.querySelector(".desk")!;
    this.initSvg();
    this.initDrag();
    this.initTooltip();
    this.querySelector(".title")!.textContent = this.title;
  }
  initSvg() {
    // ── создаём SVG ───────────────────────────────────────────────────
    const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    this.desk.appendChild(svg);
    this.svg = svg;
  }
  initTooltip() {
    const tooltip = document.createElement("div");
    tooltip.classList.add("tooltip");
    document.body.appendChild(tooltip);
    this.tooltip = tooltip;

    tooltip.innerHTML = ``;
  }
  showTooltip(x: number, y: number, innerHTML: string) {
    this.tooltip.style.left = x + "px";
    this.tooltip.style.top = y + "px";
    this.tooltip.innerHTML = `        
            ${innerHTML}
        `;
    this.tooltip.classList.add("active");
  }
  hideTooltip() {
    this.tooltip.classList.remove("active");
  }
  /*
  private formatDate(date: Date | null): string {
    if (!date) return "";
    const d = String(date.getDate()).padStart(2, "0");
    const months = [
      "янв",
      "фев",
      "мар",
      "апр",
      "мая",
      "июн",
      "июл",
      "авг",
      "сен",
      "окт",
      "ноя",
      "дек",
    ];
    const m = months[date.getMonth()];
    const y = String(date.getFullYear()).slice(-2);
    return `${d} ${m} ${y}`;
  }
*/
  createPoint(data: PointData, svg: SVGElement, innerHTML: string) {
    const radius = data.radius ?? 6;
    const c2 = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    c2.setAttribute("cx", data.x.toString());
    c2.setAttribute("cy", data.y.toString());
    c2.setAttribute("r", radius.toString());
    if (data.color) {
      c2.setAttribute("fill", data.color);
    }
    svg.appendChild(c2);
    //-
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    circle.setAttribute("cx", data.x.toString());
    circle.setAttribute("cy", data.y.toString());
    circle.setAttribute("r", "6");
    circle.classList.add("chart-point");
    circle.setAttribute("fill", "rgba(255, 255, 255, 0)");

    circle.addEventListener("mouseover", () => {
      const rect = circle.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      this.showTooltip(x, y, innerHTML);
    });
    circle.addEventListener("mouseout", () => {
      this.hideTooltip();
    });
    svg.appendChild(circle);
  }
  /*
  createPoint_kosatelnay(data: PointData): SVGCircleElement {
    const circle = document.createElementNS(
      "http://www.w3.org/2000/svg",
      "circle",
    );
    circle.setAttribute("cx", data.x.toString());
    circle.setAttribute("cy", data.y.toString());
    circle.setAttribute("r", "10");
    circle.classList.add("chart-point");
    circle.setAttribute("fill", "#00000000");

    circle.addEventListener("mouseover", () => {
      const rect = circle.getBoundingClientRect();
      const x = rect.left + rect.width / 2;
      const y = rect.top + rect.height / 2;

      const dW = this.drawTangent(this.graphs[2]!, data.ind) || 0;

      const w = data.value;
      const goalW = 60;
      const delta = goalW - w;
      let days: number | undefined = undefined;
      let goalDate: Date | null = null;
      let st = "";
      let st2 = "";
      if (dW > 0) {
        st = `Через год`;
        st2 = `вес будет: ${Math.round((w + dW * 365) * 100) / 100}`;
      } else {
        days = Math.round(delta / dW);
        st = `До цели ${goalW} кг: ${days} дней`;
        goalDate = new Date(data.date!.getTime() + days * 24 * 60 * 60 * 1000);
        st2 = `Цель ${this.formatDate(goalDate)}`;
      }

      let html = "";
      html += `<div class="date">${Math.round(dW * 1000)} г/день</div>
      <div class="date">${Math.round(dW * 1000 * 7)} г/нед</div>
      <div class="date">${Math.round(dW * 1000 * 30)} г/мес</div>
      <div class="date"> ${st}</div>
      <div class="date">${st2}</div>`;
      this.showTooltip(x, y, html);
    });

    circle.addEventListener("mouseout", () => {
      this.hideTooltip();
    });
    return circle;
  }
  */
  refresthOptionsFromGraphs() {
    let minValue = Infinity;
    let maxValue = -Infinity;
    let minDate = Infinity;
    let maxDate = -Infinity;

    this.graphs.forEach((graph) => {
      graph.points.forEach((point) => {
        minValue = Math.min(minValue, point.value);
        maxValue = Math.max(maxValue, point.value);

        if (minDate === null || point.date < minDate) {
          minDate = point.date;
        }
        if (maxDate === null || point.date > maxDate) {
          maxDate = point.date;
        }
      });
    });

    this.optionsFromGraphs.minValue = minValue;
    this.optionsFromGraphs.maxValue = maxValue;
    this.optionsFromGraphs.minDate = minDate;
    this.optionsFromGraphs.maxDate = maxDate;

    this.optionsFromGraphs.dayCount = Math.ceil(
      (maxDate - minDate) / (1000 * 60 * 60 * 24),
    );
  }
  renderBgs() {
    //- svgBG

    const bgs: IBg[] = [];
    this.bgs = bgs;

    const grOptions = this.optionsFromGraphs;

    this.dYY = (grOptions.maxValue - grOptions.minValue) * this.scale.forValue;
    const wForAllDay = (grOptions.dayCount + 1) * this.scale.forDay;
    const w1 = this.scale.forDay * 5;
    const w2 = this.scale.forDay * 2;
    const w = w1 + w2;
    const h = Math.max(1, this.scale.forValue);
    let s = "";
    //- вертикальные линии
    if (this.scale.forDay > 10) {
      for (let i = 0; i < 7; i++) {
        s += `<line x1="${i * this.scale.forDay}" y1="0" x2="${i * this.scale.forDay}" y2="${h}" stroke="${Options.supportLine_color}" stroke-width="${Options.supportLine_width}"/>`;
      }
    }
    const svg = `             
            <rect x="${w1}" y="0" width="${w2}" height="${h}" fill="${Options.weedend_color}"/>
            ${s}            
        `;

    const minD = new Date(grOptions.minDate);
    const dx = minD.getDay() === 0 ? 6 : minD.getDay() - 1;

    bgs[2] = {
      svgStr: svg,
      position: { dx: -dx * this.scale.forDay, dy: 0 },
      size: { w: w, h: h },
      repeat: "repeat",
    };

    //- горизонтальные линии
    // const svg2 = `
    //         <line x1="0" y1="0" x2="${w}" y2="0" stroke="#00000023" stroke-width="1"/>
    //     `;
    // bgs[3] = {
    //   svgStr: svg2,
    //   position: { dx: 0, dy: -this.dYY },
    //   size: { w: w, h: h },
    //   repeat: "repeat",
    // };

    //- цифры даты снизу
    if (this.scale.forDay > 10) {
      s = "";
      const r = 9;
      const dd = new Date(grOptions.minDate);

      for (let i = 0; i <= grOptions.dayCount; i++) {
        const dx = (i + 0.5) * this.scale.forDay;
        const d = dd.getDate();
        s += `<circle cx="${dx}" cy="${r}" r="${r}" fill="#ffffff62" />    
              <text 
                  x="${dx}" 
                  y="${r}" 
                  fill="#00000090" 
                  font-size="12" 
                  font-family="Arial"
                  text-anchor="middle" 
                  dominant-baseline="central"
              >${d}</text>`;
        dd.setDate(dd.getDate() + 1);
      }
      bgs[0] = {
        svgStr: s,
        position: { dx: 0, dy: -Infinity },
        size: { w: wForAllDay, h: r * 2 },
        repeat: "no-repeat",
      };
    }

    // - цифры веса ----------------
    s = "";
    const r2 = 12;
    for (let i = grOptions.minValue; i < grOptions.maxValue; i++) {
      const dy = (i - grOptions.minValue - 1) * this.scale.forValue;

      s += `<circle cx="${r2}" cy="${dy}" r="${r2}" fill="#ffffffff" />    
            <text 
                x="${r2}" 
                y="${dy}" 
                fill="#00000090" 
                font-size="12" 
                font-family="Arial"
                text-anchor="middle" 
                dominant-baseline="central"
            >${grOptions.maxValue + grOptions.minValue - i}</text>`;
    }

    bgs[1] = {
      svgStr: s,
      position: { dx: -Infinity, dy: -this.dYY },
      size: {
        w: r2 * 2,
        h: (grOptions.maxValue - grOptions.minValue) * this.scale.forValue,
      },
      repeat: "no-repeat",
    };
    /*
    //- коментарии -------------------
    const graph0 = this.graphs[0];
    if (graph0) {
      let svgContent = "";
      const maxChars = Math.max(
        ...graph0.map((curr) => curr?.comment?.length || 0),
      );
      const padding = 20;
      const estimatedHeight = maxChars * 7 + padding; // Примерный расчет: 7px на символ + отступ
      for (let i = 0; i < graph0.length; i++) {
        const curr = graph0[i];
        if (curr && curr.comment) {
          const x = i * this.scale.forDay - 30;
          const y = estimatedHeight - padding; // Нижняя точка

          // Формируем строку SVG
          svgContent += `
                        <text 
                            x="${x}" 
                            y="${y}" 
                            fill="${Options.comment_color}"
                            font-size="12"
                            font-family="Arial"
                            text-anchor="start"
                            transform="rotate(-90, ${x}, ${y})"
                        >${curr.comment}</text>
                    `; // Нижняя точка (базовая линия)
        }
      }
      bgs[4] = {
        svgStr: svgContent,
        position: { dx: 0, dy: -100 },
        size: { w: wForAllDay, h: estimatedHeight },
        repeat: "no-repeat",
      };
    }
*/
    //- заполнение бэкграундов в стили ---
    let bgStr = "";
    let bgSize = "";

    let bgRepeat = "";
    bgs.forEach((bg) => {
      const svg = `
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${bg.size.w} ${bg.size.h}">${bg.svgStr}</svg>
            `;
      bgStr += `url("data:image/svg+xml,${encodeURIComponent(svg)}"),`;
      bgSize += `${bg.size.w}px ${bg.size.h}px,`;

      bgRepeat += `${bg.repeat},`;
    });
    bgStr = bgStr.slice(0, -1);
    bgSize = bgSize.slice(0, -1);

    bgRepeat = bgRepeat.slice(0, -1);

    this.desk.style.backgroundImage = bgStr;
    this.desk.style.backgroundSize = bgSize;
    this.desk.style.backgroundRepeat = bgRepeat;
  }

  render() {
    //- svgDesk
    // this.renderBgs();

    const svgDesk = this.svg;

    const grOptions = this.optionsFromGraphs;

    const W = (grOptions.dayCount + 3) * this.scale.forDay; //+ 30 * 12
    const H = (grOptions.maxValue - grOptions.minValue) * this.scale.forValue;

    svgDesk.setAttribute("width", W + 5 + "px");
    svgDesk.setAttribute("height", H + 5 + "px");
    svgDesk.setAttribute("viewBox", `0 0 ${W} ${H}`);

    this.svg.innerHTML = "";

    for (let ii = 0; ii < this.graphs.length; ii++) {
      const layer = document.createElementNS("http://www.w3.org/2000/svg", "g");

      let dY_forGraph = ii * 2;
      this.svg.appendChild(layer);
      const graph = this.graphs[ii];
      const settings = graph?.settings;
      let prevPoint: TGraphPoint | null = null;
      if (graph) {
        let i = 0;
        const minDate = grOptions.minDate;
        const sorted = [...graph.points.entries()].sort((a, b) => a[0] - b[0]);
        for (const [_date, curr] of sorted) {
          i++;
          // const next = graph.points.values.next().value;

          // curr.date?.setHours(12, 0, 0, 0);

          // берём значение: если null — берём соседнее для визуального соединения
          if (curr && prevPoint) {
            const y1 =
              (grOptions.maxValue - (prevPoint as TGraphPoint).value) *
                this.scale.forValue +
              dY_forGraph;
            const y2 =
              (grOptions.maxValue - curr?.value) * this.scale.forValue +
              dY_forGraph;

            const dx = this.scale.forDay * 0.5;
            const d1 = prevPoint.date || 0;
            const d2 = curr.date || 0;
            // const dd = (d2 - d1) / DAY_IN_MS;
            const k = 0.9996; // погрешность отображения свг и бг;
            const x1 =
              Math.floor((d1 - minDate) / DAY_IN_MS) * this.scale.forDay * k +
              dx;
            const x2 =
              Math.floor((d2 - minDate) / DAY_IN_MS) * this.scale.forDay * k +
              dx;

            const innerHTML = `${curr.title || ""}`;

            this.createPoint(
              {
                x: x2,
                y: y2,
                value: curr.value,
                color: settings?.color || "",
                radius: settings?.pointRadius || 1,
              },
              this.svg,
              innerHTML,
            );

            if (i == 2) {
              this.createPoint(
                {
                  x: x1,
                  y: y1,
                  value: prevPoint.value,
                  color: settings?.color || "",
                  radius: settings?.pointRadius || 1,
                },
                this.svg,
                innerHTML,
              );
            }
            if (ii == 2) {
              // this.svg.appendChild(
              //   this.createPoint_kosatelnay({
              //     x: x2,
              //     y: y2,
              //     weight: next.weight,
              //     ind: i + 1,
              //     date: next.date || null,
              //   }),
              // );
            }

            const line = document.createElementNS(
              "http://www.w3.org/2000/svg",
              "line",
            );
            line.setAttribute("x1", String(x1));
            line.setAttribute("y1", String(y1));
            line.setAttribute("x2", String(x2));
            line.setAttribute("y2", String(y2));
            line.setAttribute("stroke", settings?.color || "");
            line.setAttribute(
              "stroke-width",
              settings?.strokeWidth + "" || "1",
            );

            if (curr.isDashed) {
              line.setAttribute("stroke-dasharray", "6 4");
            }

            layer.appendChild(line);
          }
          prevPoint = curr;
        }
      }
    }

    // const g2 = this.graphs[2]!;
    // if (g2.length) this.drawTangent(this.graphs[2]!, g2.length - 1);

    // this.setDestPosition();
  }
  drawTangent(graph: TGraphPoint[], pointIndex: number) {
    // 1. Переводим координату SVG → индекс дня
    const loessGraph = graph; // или graphs[1] — какой нужен
    if (!loessGraph || loessGraph.length < 3) return;

    const i = pointIndex;
    const iClamped = Math.max(1, Math.min(loessGraph.length - 2, i));

    // 2. Численная производная (центральная разность)
    const wPrev = loessGraph[iClamped - 1]?.value ?? 0;
    const wNext = loessGraph[iClamped + 1]?.value ?? 0;

    // скорость в кг/день (отрицательная = похудение)
    const dw_per_day = (wNext - wPrev) / 2;

    // 3. Координаты точки касания в SVG
    const wCurr = loessGraph[iClamped]?.value ?? 0;
    const px = (iClamped - 1) * this.scale.forDay;
    const py = (this.optionsFromGraphs.maxValue - wCurr) * this.scale.forValue;

    // 4. Наклон в SVG-пикселях
    // dy/dx в пикселях: dy = -dw * scaleWeight (минус т.к. Y перевёрнут), dx = scaleDay
    const slope_svg = (-dw_per_day * this.scale.forValue) / this.scale.forDay;

    // 5. Рисуем касательную
    const len = 300; // полудлина линии в пикселях
    const mag = Math.sqrt(1 + slope_svg * slope_svg);
    const dx = len / mag;
    const dy = slope_svg * dx;

    // Удаляем старую
    this.svg.querySelector("#tangent-line")?.remove();
    this.svg.querySelector("#tangent-dot")?.remove();

    const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
    line.setAttribute("id", "tangent-line");
    line.setAttribute("x1", String(px - dx));
    line.setAttribute("y1", String(py - dy));
    line.setAttribute("x2", String(px + dx));
    line.setAttribute("y2", String(py + dy));
    line.setAttribute("stroke", "#000e2c6c");
    line.setAttribute("stroke-width", "1");
    // line.setAttribute("stroke-dasharray", "8 4");
    this.svg.appendChild(line);

    // const dot = document.createElementNS(
    //   "http://www.w3.org/2000/svg",
    //   "circle",
    // );
    // dot.setAttribute("id", "tangent-dot");
    // dot.setAttribute("cx", String(px));
    // dot.setAttribute("cy", String(py));
    // dot.setAttribute("r", "5");
    // dot.setAttribute("fill", "#FF6B6B");
    // this.svg.appendChild(dot);

    return dw_per_day; // кг/день — скорость сброса
  }
  setDestPosition() {
    const dx = this.destPosition.x;
    const dy = this.destPosition.y;
    let bgPosition = "";

    this.bgs.forEach((bg) => {
      let x: number | string;
      if (bg.position.dx == -Infinity) x = "right";
      else x = bg.position.dx + dx + "px";

      let y: number | string;
      if (bg.position.dy == -Infinity) y = " bottom";
      else y = bg.position.dy + dy + "px";
      bgPosition += `${x} ${y},`;
    });

    bgPosition = bgPosition.slice(0, -1);

    this.desk.style.backgroundPosition = bgPosition;

    this.svg.style.transform = `translate(${dx}px, ${dy}px)`;
  }
  setStartPosition() {
    let rect: DOMRect;
    if (this.desk) {
      rect = this.desk.getBoundingClientRect();
    } else {
      rect = new DOMRect(0, 0, 0, 0);
    }

    // const grOptions = this.optionsFromGraphs;

    // let totalDays = grOptions.dayCount;
    const dayInDesk = rect.width / this.scale.forDay;

    let minValue = Infinity;
    let maxValue = -Infinity;

    const maxDate = new Date().getTime();
    // maxDate.setHours(12, 0, 0, 0);
    const minDate = new Date(maxDate - dayInDesk * DAY_IN_MS).getTime();

    this.graphs.forEach((graph) => {
      graph.points.forEach((point) => {
        if (point.date < minDate || point.date > maxDate) return;
        minValue = Math.min(minValue, point.value);
        maxValue = Math.max(maxValue, point.value);
      });
    });
    const padding = 10;

    const scaleValue = rect.height / (maxValue - minValue + padding);
    this.scale.forValue = scaleValue; //Math.min(scaleValue, this.scale.forValue);
    this.setDestPosition();
  }
  private initDrag() {
    // --- Мышь ---
    this.desk.addEventListener("mousedown", (e) => {
      e.preventDefault();
      this.startDragging(e.clientX, e.clientY);
      this.desk.style.cursor = "grabbing";
    });

    window.addEventListener("mousemove", (e) => {
      if (!this.isDragging) return;
      this.moveDragging(e.clientX, e.clientY);
    });

    window.addEventListener("mouseup", () => {
      this.stopDragging();
      this.desk.style.cursor = "default";
    });

    // --- Скролл (Zoom) ---
    this.desk.addEventListener(
      "wheel",
      (e) => {
        e.preventDefault();
        this.handleWheel(e);
      },
      { passive: false },
    );

    // --- Тач (Мобилки) ---
    this.desk.addEventListener(
      "touchstart",
      (e) => {
        // Предотвращаем скролл страницы при перетаскивании канваса
        if (e.touches.length > 0) {
          // e.preventDefault(); // Может блокировать клики, если неаккуратно
          const touch = e.touches[0];
          if (!touch) return;
          this.startDragging(touch.clientX, touch.clientY);
        }
      },
      { passive: false },
    );

    window.addEventListener(
      "touchmove",
      (e) => {
        if (!this.isDragging) return;
        if (e.touches.length > 0) {
          e.preventDefault(); // Обязательно для плавности и блокировки скролла
          const touch = e.touches[0];
          if (!touch) return;
          this.moveDragging(touch.clientX, touch.clientY);
        }
      },
      { passive: false },
    );

    window.addEventListener("touchend", () => {
      this.stopDragging();
    });
  }

  private startDragging(clientX: number, clientY: number) {
    this.isDragging = true;
    this.startX = clientX;
    this.startY = clientY;
    this.initialLeft = this.destPosition.x;
    this.initialTop = this.destPosition.y;
  }

  private moveDragging(clientX: number, clientY: number) {
    const dx = clientX - this.startX;
    const dy = clientY - this.startY;

    const newLeft = this.initialLeft + dx;
    const newTop = this.initialTop + dy;

    this.destPosition.x = newLeft;
    this.destPosition.y = newTop;
    this.setDestPosition();
  }

  private stopDragging() {
    if (this.isDragging) {
      this.isDragging = false;
    }
  }

  private handleWheel(e: WheelEvent) {
    const zoomFactor = e.deltaY > 0 ? 0.9 : 1.1;

    const rect = this.desk.getBoundingClientRect();
    const mouseX = e.clientX - rect.left;
    const mouseY = e.clientY - rect.top;

    // Позиция относительно канваса
    const canvasX = mouseX - this.destPosition.x;
    const canvasY = mouseY - this.destPosition.y;

    // Новые масштабы
    const oldScaleH = this.scale.forDay;
    const oldScaleV = this.scale.forValue;

    this.scale.forDay *= zoomFactor;
    this.scale.forValue *= zoomFactor;

    // Ограничения
    this.scale.forDay = Math.max(0.1, Math.min(1000, this.scale.forDay));
    this.scale.forValue = Math.max(0.1, Math.min(1000, this.scale.forValue));

    const actualZoomFactorH = this.scale.forDay / oldScaleH;
    const actualZoomFactorV = this.scale.forValue / oldScaleV;

    // Новая позиция, чтобы точка под мышкой осталась на месте
    const newLeft = mouseX - canvasX * actualZoomFactorH;
    const newTop = mouseY - canvasY * actualZoomFactorV;

    this.destPosition.x = newLeft;
    this.destPosition.y = newTop;

    this.renderBgs();
    this.setDestPosition();

    this.render();
  }

  connectedCallback() {
    // this.init();
  }
}

customElements.define("c-graphs", CGraphs);
