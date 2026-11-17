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
  createdAt?: string;
}
