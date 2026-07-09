import "./c-tabs.scss";

export interface ITab {
  id: string | number;
  name: string;
  isOff: boolean;
  bgColor?: string;
}

export class CTabs extends HTMLElement {
  tabs: HTMLDivElement[] = [];
  dataString: string = "";
  funcChangeEvent: ((id: string | number) => void) | null = null;
  name: string = "";
  private tabsData: Map<string | number, ITab> = new Map();

  init(data: ITab[]) {
    this.tabs = [];
    this.innerHTML = "";
    this.dataString = this.getAttribute("data-name") || "";

    this.tabsData.clear();

    data
      .sort((a, b) => (a.isOff ? 1 : 0) - (b.isOff ? 1 : 0))
      .forEach((tab) => {
        this.tabsData.set(tab.id.toString(), tab);
        const tabDiv = document.createElement("div");
        tabDiv.innerHTML = tab.name;
        tabDiv.classList.add("tab");
        if (tab.isOff) tabDiv.classList.add("off");
        if (tab.bgColor)
          tabDiv.setAttribute("style", "--bg-color: " + tab.bgColor);

        this.appendChild(tabDiv);
        tabDiv.id = `tab_${tab.id}`;

        tabDiv.addEventListener("click", () => {
          this.setActive(tab.id.toString());
          if (this.funcChangeEvent) {
            this.funcChangeEvent(tab.id);
          }
        });
        this.tabs.push(tabDiv);
      });

    // const s = localStorage.getItem(this.name + this.dataString);
    // if (s) this.setActive(s);
  }

  setActive(id: string) {
    this.tabs.forEach((tab) => tab.classList.remove("active"));
    const tab = this.querySelector(`#tab_${id}`);
    if (tab) {
      tab.classList.add("active");
      // localStorage.setItem(this.name + this.dataString, id.toString());
    }
  }

  addEventChange(func: (id: string | number) => void) {
    this.funcChangeEvent = func;
  }
}
customElements.define("c-tabs", CTabs);
