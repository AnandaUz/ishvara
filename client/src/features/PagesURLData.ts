import { api } from "@/services/api";
import type { IPages } from "@shared/types/IPages";

export class PagesURLData {
  pagesMap = new Map<string, number>();
  allPages: Map<number, IPages> = new Map();

  async init() {
    const r = await api.pages.getAll();
    const text = await r.text();
    this.allPages = new Map(
      JSON.parse(text).map((page: IPages) => [page._id, page]),
    );
  }
  getPathById(id: number) {
    return this.allPages.get(id)?.path;
  }
}
