import "./c-tabs.scss";

export interface ITab {
  id: string;
  name: string;
  isOff: boolean;
}

export class CTabs extends HTMLElement {
  tabs: HTMLDivElement[] = [];
  dataString: string = "";
  funcChangeEvent: ((id: string) => void) | null = null;

  init(data: ITab[]) {
    this.tabs = [];
    this.innerHTML = "";
    this.dataString = this.getAttribute("data-name") || "aaa";

    data
      .sort((a, b) => (a.isOff ? 1 : 0) - (b.isOff ? 1 : 0))
      .forEach((project) => {
        const tab = document.createElement("div");
        tab.textContent = project.name;
        tab.classList.add("tab");
        if (project.isOff) tab.classList.add("off");

        this.appendChild(tab);
        tab.id = project.id;

        tab.addEventListener("click", () => {
          this.setActive(project.id);
        });
        this.tabs.push(tab);
      });

    const s = localStorage.getItem(this.dataString) || "all";
    this.setActive(s);
  }

  setActive(id: string) {
    this.tabs.forEach((tab) => tab.classList.remove("active"));
    const tab = this.querySelector(`#${id}`);
    if (tab) {
      tab.classList.add("active");
      localStorage.setItem(this.dataString, id);
      if (this.funcChangeEvent) {
        this.funcChangeEvent(id);
      }
    }
  }
  addEventChange(func: (id: string) => void) {
    this.funcChangeEvent = func;
  }
}
customElements.define("c-tabs", CTabs);
