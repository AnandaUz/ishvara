const off_MyStat = localStorage.getItem('off_MyStat') === 'true';
const STORAGE_ID = 'good_visiter';

declare global {
  interface Window {
    timeStart: Date;
  }
}
if (!off_MyStat) {
    trackVisit();
    const timers = [
        { ms: 1000,  label: "1с" },  
        { ms: 5000, label: "5с" },
        { ms: 10000, label: "10с" },
        { ms: 30000, label: "30с" },
        { ms: 50000, label: "50с" }
    ];
    // 3. Запускаем циклом
    timers.forEach(timer => {
        setTimeout(() => sendTrackingEvent(timer.label), timer.ms);
    });

//     setTimeout(() => {
//       const fbp = localStorage.getItem('fbp') || '';
//       const fbc = localStorage.getItem('fbc') || '';
//       sendTrackingMessage(`${getVisiterId()} 🔅 10с 🔅 ${window.location.pathname}
// fbp:${fbp} 
// fbc:${fbc}`)
//     }, 10000);



    // let scrollSent = false;
    let scrollTimer: ReturnType<typeof setTimeout>;

    window.addEventListener('scroll', function() {
      clearTimeout(scrollTimer);
      scrollTimer = setTimeout(() => {
        const scrollPercent = Math.round(
          (window.scrollY / (document.documentElement.scrollHeight - window.innerHeight)) * 100
        );
        sendTrackingEvent(`scroll ${scrollPercent}`);
      }, 300); // 500ms после остановки
    });
}
{

    let count = 0;
    const checkFbq = setInterval(() => {
        count++;        

        const isPixel = typeof (window as any).fbq == 'function';
        const fbp = getCookie('_fbp')
        const fbc = getCookie('_fbc')
        
        const fbPixelInfo = `${isPixel ? 'pixel:✔️' : 'pixel:❌'} ${fbp ? 'fbp:✔️' : 'fbp:❌'} ${fbc ? 'fbc:✔️' : 'fbc:❌'}`;
        
        if (fbp || fbc) {
            if (fbp) localStorage.setItem('fbp', fbp);
            if (fbc) localStorage.setItem('fbc', fbc);
            
            clearInterval(checkFbq);
            sendTrackingMessage(`${getVisiterId()} 🍰 ${fbPixelInfo}`)
        }
        if (count > 10) {
            clearInterval(checkFbq);
            sendTrackingMessage(`${getVisiterId()} 🍰 ${fbPixelInfo}`)
        }
    }, 1000);
}

window.addEventListener("load", () => {

  
  
 });
export async function sendTrackingEvent(eventName: string):Promise<boolean> {   
    const page_path = window.location.pathname;
    const message = `${getVisiterId()} 🔅 ${eventName} 🔅 ${page_path}`
    await fetch(import.meta.env.VITE_API_URL + '/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({message})
    }).catch(err =>  {
      console.log('Tracking error:', err);
      return false;
    });
    return true;
}
export async function sendTrackingMessage(message: string):Promise<boolean> {       
    await fetch(import.meta.env.VITE_API_URL + '/track', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({message})
    }).catch(err =>  {
      console.log('Tracking error:', err);
      return false;
    });
    return true;
}
export async function sendMessageToAdmin(message: string):Promise<boolean> {       
    await fetch(import.meta.env.VITE_API_URL + '/track_admin', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({message})
    }).catch(err =>  {
      console.log('Tracking error:', err);
      return false;
    });
    return true;
}







