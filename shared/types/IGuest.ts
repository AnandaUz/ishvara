

export interface IGuest {
  _id: string          // session id
  createdAt: Date
  lastChange: Date
  ua?: string            // user agent
  referrer?: string
  isMobile?: boolean
  name?: string
  tg?: {
    id: string
    first_name?: string
    last_name?: string
    username?: string
  }
  instagram?: {
    pixel?:boolean
    fbp?: string          // _fbp cookie от Facebook
    fbc?: string          // _fbc cookie
    comp_name?: string
    adset_name?: string
    ad_name?: string
  }
  maxScroll?: number     // максимальный скролл %
  duration?: number      // время на странице в секундах
  events?: [number, number][]  // [[время, код], ...]
}