import "./c-project-tabs.scss";
// import template from "./c-project-tabs.html?raw";
import { projects_configs } from "@/projects_config";
import { store } from "@features/store";
import { DESC_EVENTS } from "@features/events";
import { projectsManager } from "@/features/projectsManager";

class ProjectTabs extends HTMLElement {
  tabs: Element[];
  constructor() {

    super();
    this.tabs = [];
    this.classList.add('c-project-tabs');

    projects_configs.forEach(project => {
      const tab = document.createElement('div');
      tab.textContent = project.name;
      tab.classList.add('tab');
      this.appendChild(tab);
      tab.id = project.id;

      tab.addEventListener('click', () => {
        projectsManager.setProject(project.id);
      });
      this.tabs.push(tab);
    });

     store.on(DESC_EVENTS.project.Changed, (id: string) => {
                 this.setProject(id);
            });
  }

  setProject(id: string) {    
    this.tabs.forEach(tab => tab.classList.remove('active'));
    const tab = this.querySelector(`#${id}`);
    if (tab) {
      tab.classList.add('active');
    }
  }
}

export class CProjectTabs extends ProjectTabs {    
  async connectedCallback() {   

    
  }
}
customElements.define('c-project-tabs', CProjectTabs);

