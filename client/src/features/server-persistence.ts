import { api } from "@/services/api";
import type { IGuest } from "@shared/types/IGuest";

const LIMIT = 10;
export class ServerPersistence {
  private skip: number = 0;
  init() {
    this.skip = 0;
  }
  clear() {
    this.skip = 0;
  }
  async loadNextGuests(
    projectId: number,
    filtersTags: number[] = [],
    companyId?: string | undefined,
  ): Promise<IGuest[]> {
    const from = this.skip;
    this.skip += LIMIT;
    return await api.guest.loadNext(
      projectId.toString(),
      LIMIT,
      from,
      filtersTags,
      companyId,
    );
  }
}
