import { projects_configs, type ProjectConfig } from "@/projects_config";
import { DESC_EVENTS, store } from "./store";
import type { IGuest } from "@shared/types/IGuest";

class TProject {
  config: ProjectConfig;
  //  private _guests: IGuest[] = [];
  private owner: ProjectsManager;

  constructor(config: ProjectConfig, owner: ProjectsManager) {
    this.config = config;
    this.owner = owner;
  }
  get guests(): IGuest[] {
    const guests = this.owner.guests.filter((guest: IGuest) =>
      this.config.filterFunc(guest),
    );
    return guests;
  }
}

class ProjectsManager {
  activeProject: TProject | null = null;
  projects: TProject[] = [];
  guests: IGuest[] = [];
  constructor() {
    this.projects = projects_configs.map(
      (config) => new TProject(config, this),
    );
  }

  setProject(id: string) {
    localStorage.setItem("project", id);
    this.activeProject = this.projects.find(
      (project) => project.config.id === id,
    )!;

    store.emit(DESC_EVENTS.project.Changed, id);
  }

  getProject() {
    return localStorage.getItem("project") || projects_configs[0]!.id;
  }
  async loadGuests() {
    const response = await fetch(
      import.meta.env.VITE_API_URL + "/api/guests/get",
    );
    const data = await response.json();
    this.guests = data;
  }

  async init() {
    await this.loadGuests();
    this.setProject(localStorage.getItem("project") || projects_configs[0]!.id);
  }
}

export const projectsManager = new ProjectsManager();
