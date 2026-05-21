import { projects_configs } from "@/tabs_config";
import { DESC_EVENTS, store } from "./store";
import type { IGuest } from "@shared/types/IGuest";
import { api } from "@/services/api";
import { bigProjectsGet, type IBigProjectConfig } from "@shared/projects_config";

class TProject {
  config: IBigProjectConfig;
  guests: IGuest[] = [];

  constructor(id: number) {
    const c = bigProjectsGet.projectById(id)
    if (c) {
      this.config = c;
    } else {
      throw new Error(`Project ${id} not found`);
    }
  }
  async initGuests() {
    if (this.guests.length) return;
    this.guests = await api.guest.load(this.config.id);
  }
}

class ProjectsManager {
  activeProject: TProject | null = null;
  projects: Map<number, TProject> = new Map();
  constructor() { }

  async setProject(id: number) {
    let newProject: TProject;
    if (this.projects.has(id)) {
      newProject = this.projects.get(id)!;
    } else {
      newProject = new TProject(id);
      this.projects.set(id, newProject);
      await newProject.initGuests();
    }
    this.activeProject = newProject;
    store.emit(DESC_EVENTS.project.Changed, id);
  }

  // getProject() {
  //   return localStorage.getItem("project") || projects_configs[0]!.id;
  // }

  async init() {
    //
    // this.setProject(localStorage.getItem("project") || projects_configs[0]!.id);
  }
}

export const projectsManager = new ProjectsManager();
