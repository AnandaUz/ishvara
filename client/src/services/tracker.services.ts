import type { IGuest } from "@shared/types/IGuest";

class Guest {
     private _id: string | null = null;

     private data: IGuest | null = null;

     constructor() {
       
     }
     async init() {
          // 1. Проверяем, нет ли уже ID в sessionStorage
          this._id = localStorage.getItem('guestID');
          if (this._id) return this._id;

          
          const urlParams = new URLSearchParams(window.location.search);      

          // const isMobile = /Mobile|Android|iPhone/i.test(navigator.userAgent) ? "📱" : "💻";   

          const { browser, version, os } = parseUserAgent(navigator.userAgent);
          
          this.data = {
            _id: '',
            createdAt: new Date(),
            ua: `${browser}${version ? '-' + version : ''} ${os}`,
            referrer: document.referrer,
            
            instagram: {
               pixel: window.fbq ? true : false,
               comp_name: urlParams.get('comp_name') || '',
               adset_name: urlParams.get('adset_name') || '',
               ad_name: urlParams.get('ad_name') || ''
            }
          }



          
          try {
          // 4. Запрашиваем создание сессии
          const response = await fetch('/api/session', {
               method: 'POST',
               headers: { 'Content-Type': 'application/json' },
               body: JSON.stringify(payload),
          });

          if (!response.ok) throw new Error('Failed to init session');

          const data = await response.json();
          
          // 5. Сохраняем полученный от Монго ID
          if (data._id) {
               localStorage.setItem('guestID', data._id);
               return data._id;
          }
          } catch (err) {
          console.error('Session init error:', err);
          return null;
          }
     }

  
}

const guest = new Guest();
export default guest;



function parseUserAgent(ua: string): { browser: string; version: string; os: string } {
  if (!ua) return { browser: 'Unknown', version: '', os: 'Unknown' };

  const browsers = [
    { name: 'Edge',            regex: /Edg\/([0-9.]+)/ },
    { name: 'Opera',           regex: /OPR\/([0-9.]+)/ },
    { name: 'Opera Legacy',    regex: /Opera\/([0-9.]+)/ },
    { name: 'Yandex Browser',  regex: /YaBrowser\/([0-9.]+)/ },
    { name: 'Samsung Browser', regex: /SamsungBrowser\/([0-9.]+)/ },
    { name: 'UC Browser',      regex: /UCBrowser\/([0-9.]+)/ },
    { name: 'Firefox',         regex: /Firefox\/([0-9.]+)/ },
    { name: 'Chrome',          regex: /Chrome\/([0-9.]+)/ },
    { name: 'Safari',          regex: /Version\/([0-9.]+).*Safari/ },
    { name: 'Safari',          regex: /Safari\/([0-9.]+)/ }, // fallback
  ];

  const osList = [
    { name: 'Windows 11/10', regex: /Windows NT 10\.0/ },
    { name: 'Windows 8.1',   regex: /Windows NT 6\.3/ },
    { name: 'Windows 8',     regex: /Windows NT 6\.2/ },
    { name: 'Windows 7',     regex: /Windows NT 6\.1/ },
    { name: 'macOS',         regex: /Mac OS X ([0-9_]+)/ },
    { name: 'iPhone (iOS)',  regex: /iPhone OS ([0-9_]+)/ },
    { name: 'iPad (iOS)',    regex: /iPad.*OS ([0-9_]+)/ },
    { name: 'Android',       regex: /Android ([0-9.]+)/ },
    { name: 'Linux',         regex: /Linux/ },
  ];

  let browser = 'Unknown', version = '';
  for (const b of browsers) {
    const match = ua.match(b.regex);
    if (match) {
      browser = b.name;
      version = match[1]?.split('.')[0] || '';
      break;
    }
  }

  let detectedOS = 'Unknown';
  for (const o of osList) {
    const match = ua.match(o.regex);
    if (match) {
      detectedOS = o.name;
      if (match[1]) detectedOS += ` ${match[1].replace(/_/g, '.')}`;
      break;
    }
  }

  return { browser, version, os: detectedOS };
}
function trackVisit() {
  const timeEnd = new Date();
    const timeDiff = Math.round((timeEnd.getTime() - window.timeStart.getTime())/10)/100;
  if (isAlreadyTracked()) {    
    sendTrackingEvent(`in ${timeDiff}`);
    return;
  }
  const params = new URLSearchParams(window.location.search);
  let fbclid = params.get('fbclid')

  

  fetch(import.meta.env.VITE_API_URL + '/track', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ message })
  });
}
export function getCookie(name: string): string {
    const match = document.cookie.match(new RegExp('(^| )' + name + '=([^;]+)'));
    return match && match[2] ? match[2] : '';
}
export function getVisiterId() {
  if (!localStorage.getItem(STORAGE_ID)) {
    trackVisit();
  }
  return localStorage.getItem(STORAGE_ID)
}
function isAlreadyTracked(): boolean {
    const str = localStorage.getItem(STORAGE_ID)
    if (str) return true; 
    return false; 
}