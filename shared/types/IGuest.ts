export interface IGuest {
  _id: string; // session id
  createdAt: Date;
  lastChange: Date;
  ua?: string; // user agent
  referrer?: string;
  name?: string;
  userAgentString?: string;

  tg?: {
    id: string;
    first_name?: string;
    last_name?: string;
    username?: string;
  };
  instagram?: {
    fbp?: string; // _fbp cookie от Facebook
    fbc?: string; // _fbc cookie
    comp_name?: string;
    adset_name?: string;
    ad_name?: string;
  };
  paramsString?: string;
  events?: [number | string, number | string][]; // [[время, код], ...]
  tags?: number[];
}
