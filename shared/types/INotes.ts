export interface INotes {
  _id?: string;
  createdAt?: Date;
  lastChange?: Date;

  projectId?: number;
  companyId?: string;

  text?: string;
}
