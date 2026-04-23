import type { IGuest } from "@shared/types/IGuest";
import "./c-guest-block.scss";
// import guest from "@/services/tracker.services";
// import template from "./c-guest-block.html?raw";
import { getTimeStr } from "@/services/tools";
import { guestClearEvents, guestDelete } from "@/services/api";
import { EVENT_CODE } from "@shared/types/GuestConst";


export class CGuestBlock extends HTMLElement {
  data: IGuest;
  constructor(data: IGuest) {
    super();

    this.classList.add('guest-bl');
    this.data = data;

    let companyString = '';
    if (this.data.instagram?.comp_name) {
        companyString = `<span class='comp-name'>${this.data.instagram?.comp_name}</span><span class='adset-name'>${this.data.instagram?.adset_name}</span><span class='ad-name'>${this.data.instagram?.ad_name}</span>`;
    }
    let cookieString = '';
    {
        const isFbc = this.data.instagram?.fbc;
        const isFbp = this.data.instagram?.fbp;              
        cookieString += `<span class="${isFbc ? 'ok' : ''}"></span>`
        cookieString += `<span class="${isFbp ? 'ok' : ''}"></span>`
    }  
    const paramsString = this.data.paramsString || '';       
    const createdAt = new Date(this.data.createdAt);
    const lastChange = new Date(this.data.lastChange);
    let duration = '';
    if (this.data.createdAt && this.data.lastChange) {
        const d = (lastChange.getTime() - createdAt.getTime())/1000;
        if (d > 60) {
            duration = (d/60).toFixed(1) + 'm';
        } else {
            duration = d.toFixed(1) + 's';
        }
    }
    let id = this.data._id
    if (this.data.name) id = `<div class='withName'>${this.data.name}</div>`

    this.innerHTML=`            
    <div class='id'>${id}</div>
    <div class='create-time'>${getTimeStr(this.data.createdAt)}</div>
    <div class='last-change'>${getTimeStr(this.data.lastChange)}</div>
    <div class='duration'>${duration}</div>
    <div class='company-string'>${companyString}</div>
    <div class='cookie-string'>${cookieString}</div>
    <div class='params-string'>${paramsString}</div>

    <div class='events-bl'></div>`

    const btn_delete = document.createElement('button');
    btn_delete.className = 'btn sml-btn btn-delete';
    btn_delete.addEventListener('click', async () => {
      const res = await guestDelete(this.data._id);
      if (res.ok) {
        this.remove();
      }
    });
    this.appendChild(btn_delete);

    const btn_clear = document.createElement('button');
    btn_clear.className = 'btn sml-btn btn-clear';
    btn_clear.addEventListener('click', async () => {
      const res = await guestClearEvents(this.data._id);
      if (res.ok) {
        this.data.events = [];
        this.querySelector('.events-bl')!.innerHTML = '';
      }
    });
    
    this.appendChild(btn_clear);
    const eventsBl = this.querySelector('.events-bl');

    let t = 0
    const k = 40 // 20 пикселей на секунду
    for(let i=0; i<this.data.events!.length; i++) {
        const event = this.data.events![i];
        if (!event) continue;
        const eventElement = document.createElement('div');
        eventElement.classList.add('event');

        let newStarTime = null;
        let time = 0;
        let kod = '';
        if (typeof event[0] === 'string') {
          kod = event[0][0] || '';
          switch (kod) {
            case 't':
              newStarTime = new Date(Number(event[0].slice(1)));

              break;
          
            default:
                

              break;
          }
          
        } else {
          time = Number(event[0]);
        } 
        
        

        if (typeof event[1] === 'string') {
            if (i>0) {
                const blBR = document.createElement('br');
                eventsBl?.appendChild(blBR);
            }
            eventElement.innerHTML = `<span></span><span class='page-name'>${event![1]}</span>`;
            if (newStarTime) {
                eventElement.innerHTML += `<span class='time'>${getTimeStr(newStarTime)}</span>`;
            }
            eventElement.className += ' ' + 'page-in';

        } else {
            let xx = time - t;
            let save_xx = xx;

            if (xx > 60) {
              eventElement.classList.add('ex-scale');
              xx = 1;
            } else  {

              const dT = 1
              if (xx > dT) {
                
                let ii=0
                const n = Math.floor(xx/dT)
                for(; ii<n; ii++) {
                    const eventElement = document.createElement('div');
                    eventElement.classList.add('event');
                    // eventElement.classList.add('scale');
                    eventElement.style.width = k + 'px'
                    eventsBl?.appendChild(eventElement);
                    
                }
                xx-=n*dT;
              }
            }

            
            
            eventElement.style.width = xx*k + 'px'


            switch (event[1]) {
                case EVENT_CODE.outPage!.code:
                    eventElement.innerHTML = `<span></span><i class='time'>${time.toFixed(1)}</i>`;
                    eventElement.className += ' ' + EVENT_CODE.outPage!.class!;
                    break;                
                default:
                    eventElement.innerHTML = `<span>${event![1]}</span>`;
                    break;
            }
        }

        eventsBl?.appendChild(eventElement);
        
        

        t = time;
    }    
  }
  async connectedCallback() {
    // const guest = this.getAttribute('data-guest') || '';
    // this.innerHTML = template.replace('{{guest}}', guest);
  }
}

customElements.define('c-guest-block', CGuestBlock);