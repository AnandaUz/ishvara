import type { Page } from '../../types';
import "./guide.scss";
import html from "./guide.html?raw";
import '@components/top/c-top';
import { getCookie, getVisiterId, sendTrackingMessage } from '@/main';

export const guidePage: Page = () => {
  return {
    html: html,
    init() {
      // onclick="fbq('track', 'Lead', {value: 1.00, currency: 'USD'}
      const btn = document.querySelector('.open_pdf');
      btn?.addEventListener('click', () => {
        // fbq('track', 'Lead', {value: 1.00, currency: 'USD'});
        

        
        const fbp = getCookie('_fbp')
        const fbc = getCookie('_fbc')
                
            const message = `${getVisiterId()} 🤖🤖🤖 Скачали гайд 
fbp:${fbp}
fbc:${fbc}`
        
              sendTrackingMessage(message);
      });
    },
    title: 'Гайд',
    pageClass: 'guide-page',
  };
}
