export interface IGuest {
  _id?: string; // session id
  createdAt?: Date;
  lastChange?: Date;

  referrer?: string;
  name?: string;
  userAgentString?: string;
  phone?: string;
  projectId?: number;
  ip?: string;
  oldId?: string;
  companyId?: string; //для совместимости

  tg?: {
    id?: string;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
  instagram?: {
    fbp?: string; // _fbp cookie от Facebook
    fbc?: string; // _fbc cookie
    comp_name?: string | number;
    adset_name?: string | number;
    ad_name?: string | number;
  };
  paramsString?: string;
  events?: [number | string, number | string][]; // [[время, код], ...]
  tags?: number[];
  notes?: string;
  chat?: {
    id: number;
    tgbotName: string;
  } | null;
}
