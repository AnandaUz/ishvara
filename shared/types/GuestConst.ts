export interface IEventCodeItem {
  name?: string;
  code: number;
  title?: string;
  color?: string;
  class?: string;
} 
export const EVENT_CODE = {
  scroll0:{code:1,title:'0%',class:'scroll s0'},
  scroll1:{code:2,title:'16%',class:'scroll s1'},
  scroll2:{code:3,title:'33%',class:'scroll s2'},
  scroll3:{code:4,title:'50%',class:'scroll s3'},
  scroll4:{code:5,title:'66%',class:'scroll s4'},
  scroll5:{code:6,title:'83%',class:'scroll s5'},
  scroll6:{code:7,title:'100%',class:'scroll s6'},
  inPage:{code:8,title:'Вход на страницу',class:'page-in'},
  outPage:{code:9,title:'Выход со страницы',class:'page-out'},
  goalBtnClick:{code:10,title:'Клик по кнопке цели',class:'goalBtnClick'},
} as const satisfies Record<string, IEventCodeItem>


export const EVENT_BY_CODE = Object.fromEntries(
  Object.values(EVENT_CODE).map(item => [item.code, item])
)