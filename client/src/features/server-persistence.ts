import { api } from "@/services/api";
import type { IGuest } from "@shared/types/IGuest";
import { core } from "./core";

const LIMIT = 10;
export class ServerPersistence {
  private skip: number = 0;
  init() {}
  async loadNextGuests(): Promise<IGuest[]> {
    const from = this.skip;
    const projId = core.projectsManager.activeProject.config.id;

    this.skip += LIMIT;
    return await api.guest.loadNext(projId, LIMIT, from);
  }
}
