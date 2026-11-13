export interface ICompanyEntity {
  _id?: string;
  projectId: number;
  name: string;
  urls: string[];
  pageIds: number[];
  createdAt?: string;
}

