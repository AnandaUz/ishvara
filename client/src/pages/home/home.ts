import type { IGuest } from '@shared/types/IGuest';
import type { Page } from '../../types';
import html from "@pages/home/home.html?raw"


export const homePage: Page = () => {
  return {
    html: html,
    pageClass: 'home-page',
    init() {
      const guestsList = document.querySelector('.guests-list');
      fetch('http://localhost:8080/api/guests/get')
        .then(response => response.json())
        .then(data => {
          data.forEach((guest: IGuest) => {
            const guestElement = document.createElement('div');
            guestElement.classList.add('guest-bl');

            let companyString = '';
            if (guest.instagram?.comp_name) {
              companyString = `<span>${guest.instagram?.comp_name}</span><span>${guest.instagram?.adset_name}</span><span>${guest.instagram?.ad_name}</span>`;
            }
            let cookieString = '';
            {
              const isPixel = guest.instagram?.pixel;
              const isFbc = guest.instagram?.fbc;
              const isFbp = guest.instagram?.fbp;
              cookieString += `<span class="${isPixel ? 'ok' : ''}"></span>`
              cookieString += `<span class="${isFbc ? 'ok' : ''}"></span>`
              cookieString += `<span class="${isFbp ? 'ok' : ''}"></span>`
            }

            guestElement.innerHTML=`
            <div class='name'>${guest.name || ''}</div>
            <div class='id'>${guest._id}</div>
            <div class='create-time'>${getTimeStr(guest.createdAt)}</div>
            <div class='last-change'>${getTimeStr(guest.lastChange)}</div>
            <div class='company-string'>${companyString}</div>
            <div class='cookie-string'>${cookieString}</div>
     
            <div class='events-bl'></div>`
            const eventsBl = guestElement.querySelector('.events-bl');
            for(let i=0; i<guest.events!.length; i++) {
              const event = guest.events![i];
              const eventElement = document.createElement('div');
              eventElement.classList.add('event');
              eventElement.innerHTML = `${event![0]} - ${event![1]}`;
              eventsBl?.appendChild(eventElement);
            }
           
            guestsList?.appendChild(guestElement);
          });
        });

    }
  };
}

function getTimeStr(date: Date | null | undefined): string {
  if (!date) return '-';

  const d = new Date(date);
  return `${d.getHours()}:${d.getMinutes()}`;
}
