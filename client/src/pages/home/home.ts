import type { IGuest } from '@shared/types/IGuest';
import type { Page } from '../../types';
import html from "@pages/home/home.html?raw"
import '@components/c-guest-block/c-guest-block';
import { CGuestBlock } from '@components/c-guest-block/c-guest-block';


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
            const guestBlock = new CGuestBlock(guest);
            
            guestsList?.appendChild(guestBlock);         

            

          });
        });

    }
  };
}

