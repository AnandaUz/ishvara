import { projects_configs } from "@/tabs_config";
import { DESC_EVENTS, store } from "./store";
import type { IGuest } from "@shared/types/IGuest";
import { api } from "@/services/api";
import { bigProjects, type IBigProjectConfig } from "@shared/projects_config";

class TProject {
  config: IBigProjectConfig;
  guests: IGuest[] = [];

  constructor(idName: string) {
    if (bigProjects[idName]) {
      this.config = bigProjects[idName]!;
    } else {
      throw new Error(`Project ${idName} not found`);
    }
  }
  async initGuests() {
    this.guests = await api.guest.load(this.config.id);
  }
}

class ProjectsManager {
  activeProject: TProject | null = null;
  projects: Map<string, TProject> = new Map();
  constructor() {}

  async setProject(idName: string) {
    let newProject: TProject;
    if (this.projects.has(idName)) {
      newProject = this.projects.get(idName)!;
    } else {
      newProject = new TProject(idName);
      this.projects.set(idName, newProject);
      await newProject.initGuests();
    }
    this.activeProject = newProject;
    store.emit(DESC_EVENTS.project.Changed, idName);
  }

  getProject() {
    return localStorage.getItem("project") || projects_configs[0]!.id;
  }

  async init() {
    //
    // this.setProject(localStorage.getItem("project") || projects_configs[0]!.id);
  }
}

export const projectsManager = new ProjectsManager();
