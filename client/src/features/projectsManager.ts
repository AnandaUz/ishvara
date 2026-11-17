import { EVENTS } from "./store";
import type { IGuest } from "@shared/types/IGuest";
import type { IProjectEntity } from "@shared/types/IProjectEntity";
import {
  bigProjectsGet,
  bigProjectsRegistry,
  type IBigProjectConfig,
} from "@shared/projects_config";
import { api } from "@/services/api";
import { core } from "./core";

class TProject {
  config: IBigProjectConfig;
  private _guests: IGuest[] = [];
  public filterFunc: ((guest: IGuest) => boolean) | null = null;

  get guests() {
    if (this.filterFunc) {
      return this._guests.filter(this.filterFunc);
    }
    return this._guests;
  }
  set guests(value) {
    this._guests = value;
  }

  constructor(id: number) {
    const c = bigProjectsGet.projectById(id);
    if (c) {
      this.config = c;
    } else {
      this.config = {
        projectId: id,
        id,
        name: `Project ${id}`,
      };
    }
  }
}

export class ProjectsManager {
  private _activeProject: TProject | null = null;
  private projects: Map<number, TProject> = new Map();
  public projectsList: IProjectEntity[] = [];

  constructor() {
    core.store.on(EVENTS.options.MainTabsChanged, () => {});
  }

  async loadProjects(): Promise<IProjectEntity[]> {
    try {
      const res = await api.project.getAll();
      this.projectsList = Array.isArray(res) ? res : [];
      bigProjectsRegistry.setProjects(this.projectsList);
      return this.projectsList;
    } catch (e) {
      console.error("Failed to load projects from DB", e);
      return [];
    }
  }

  async setProject(
    id: number,
    filterFunc: ((guest: IGuest) => boolean) | null = null,
  ) {
    let newProject: TProject;
    if (this.projects.has(id)) {
      newProject = this.projects.get(id)!;
    } else {
      newProject = new TProject(id);
      this.projects.set(id, newProject);
    }
    if (filterFunc) {
      newProject.filterFunc = filterFunc;
    }
    this._activeProject = newProject;
    core.store.emit(EVENTS.project.Changed, id);
  }
  get activeProject(): TProject {
    if (!this._activeProject) throw new Error("No active project");
    return this._activeProject;
  }

  async init() {
    await this.loadProjects();
  }
}
