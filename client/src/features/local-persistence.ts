const dataName = "page_data";
interface IPageData {
  projectId?: string;
  companiesIds?: Record<string, string>;
  adsets?: string;
  viewports?: string;
  tagsFilter?: Record<string, number[]>;
}
export class LocalPersistence {
  state: IPageData = {} as IPageData;
  constructor() {}
  init() {
    const localState = localStorage.getItem(dataName);
    if (!localState) {
      localStorage.setItem(dataName, "{}");
    } else {
      this.state = JSON.parse(localState) as IPageData;
    }
  }
  save() {
    localStorage.setItem(dataName, JSON.stringify(this.state));
  }
}
