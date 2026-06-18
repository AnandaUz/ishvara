// import { projects_configs } from "@/tabs_config";
import { EVENTS } from "./store";
import type { IGuest } from "@shared/types/IGuest";
import { api } from "@/services/api";
import {
  bigProjectsGet,
  type IBigProjectConfig,
} from "@shared/projects_config";
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
      throw new Error(`Project ${id} not found`);
    }
  }
  async initGuests() {
    if (this.guests.length) return;
    this.guests = await core.serverPersistence.loadNextGuests();
  }
  async arhive() {
    // 1.9 M
    // 477 К
    let savedGuestCount = 0;
    let clearnGuestCount = 0;
    // let t = 10;
    this.guests.forEach(async (guest) => {
      if (guest.level && guest.level > 0) {
        savedGuestCount++;
      } else {
        // if (t < 0) return;
        // t--;
        if (!guest.createdAt) return;
        clearnGuestCount++;

        if (!guest.lastChange && guest.createdAt)
          guest.lastChange = guest.createdAt;

        Object.keys(guest).forEach((key) => {
          if (
            key !== "_id" &&
            key !== "projectId" &&
            key !== "lastChange" &&
            key !== "tg" &&
            key !== "companyId" &&
            key !== "adsetId"
            // key !== "adId"
          ) {
            (guest as any)[key] = null;
          }
        });
        await api.guest.patchOne(guest._id || "", guest);

        console.log(guest._id);

        return;
      }
    });
    console.log("savedGuestCount", savedGuestCount);
    console.log("clearnGuestCount", clearnGuestCount);
  }
}

export class ProjectsManager {
  private _activeProject: TProject | null = null;
  private projects: Map<number, TProject> = new Map();
  constructor() {}

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
      // await newProject.initGuests();
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

  // getProject() {
  //   return localStorage.getItem("project") || projects_configs[0]!.id;
  // }

  async init() {
    //
    // this.setProject(localStorage.getItem("project") || projects_configs[0]!.id);
  }
}
