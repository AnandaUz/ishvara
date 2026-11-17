export interface IAd {
  id: number;
  name: string;
  viewText?: string;
}

export interface IAdSet {
  id: number;
  name: string;
  nameInInst?: string;
  createdAt?: string;
  summary?: string;
  city?: string;
  country?: string;
  ads?: IAd[];
  isOff?: boolean;
  viewText?: string;
}

export interface ICompany {
  id: number;
  name: string;
  summary?: string;
  companyPageURL?: string;
  pixel?: string;
  tgbotName?: string;
  adsets?: IAdSet[];
  isOff?: boolean;
  city?: string;
  country?: string;
  viewText?: string;
}

export interface IProjectEntity {
  _id?: string;
  projectId: number;
  name: string;
  allowedOrigins?: string[];
  pixelId?: string;
  pixelToken?: string;
  tgbotName?: string;
  tgbotToken?: string;
  city?: string;
  country?: string;
  url?: string;
  isOff?: boolean;
  summary?: string;
  companys?: ICompany[];
  createdAt?: string;
}

export type IBigProjectConfig = IProjectEntity & { id?: number; pixel?: string };
