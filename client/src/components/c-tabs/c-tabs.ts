import "./c-tabs.scss";

export interface ITab {
  id: string | number;
  name: string;
  isOff: boolean;
  data?: any;
}

export class CTabs extends HTMLElement {
  tabs: HTMLDivElement[] = [];
  dataString: string = "";
  funcChangeEvent: ((tabData: ITab | null) => void) | null = null;
  name: string = "";
  private tabsData: Map<string | number, ITab> = new Map();

  init(data: ITab[]) {
    this.tabs = [];
    this.innerHTML = "";
    this.dataString = this.getAttribute("data-name") || "aaa";

    this.tabsData.clear();

    data
      .sort((a, b) => (a.isOff ? 1 : 0) - (b.isOff ? 1 : 0))
      .forEach((tab) => {
        this.tabsData.set(tab.id.toString(), tab);
        const tabDiv = document.createElement("div");
        tabDiv.innerHTML = tab.name;
        tabDiv.classList.add("tab");
        if (tab.isOff) tabDiv.classList.add("off");

        this.appendChild(tabDiv);
        tabDiv.id = `tab_${tab.id}`;

        tabDiv.addEventListener("click", () => {
          this.setActive(tab.id.toString());
        });
        this.tabs.push(tabDiv);
      });

    const s = localStorage.getItem(this.name + this.dataString);
    if (s) this.setActive(s);
  }

  setActive(id: string) {
    this.tabs.forEach((tab) => tab.classList.remove("active"));
    const tab = this.querySelector(`#tab_${id}`);
    if (tab) {
      tab.classList.add("active");
      localStorage.setItem(this.name + this.dataString, id.toString());
      if (this.funcChangeEvent) {
        this.funcChangeEvent(this.tabsData.get(id) || null);
      }
    }
  }
  addEventChange(func: (tabData: ITab | null) => void) {
    this.funcChangeEvent = func;
  }
}
customElements.define("c-tabs", CTabs);
