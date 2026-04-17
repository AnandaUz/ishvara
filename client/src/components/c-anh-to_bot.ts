import { getCookie, getVisiterId, sendMessageToAdmin } from "@/main";


export class CAnhToBot extends HTMLElement {   

  async connectedCallback() {
    const botUrl = this.getAttribute('data-bot-url') || import.meta.env.VITE_BOT_URL;
    const attr = this.getAttribute('data-attr') || 'f1';
    const btnText = this.getAttribute('btn-text') || 'Отправить';
    const classAttr = this.getAttribute('data-class') || '';
    let userID = localStorage.getItem('good_visiter') || '';
    if (userID) {
      userID = '__'+userID
    }
    this.innerHTML = `
     <a href="${botUrl}?start=${attr}${userID}"
               class="btn btn-meet "
               target="_blank"
               onclick="fbq('track', 'Contact', {value: 0.50, currency: 'USD', content_name: '${attr}'});">
                <span class="${classAttr}">${btnText}</span>
            </a>
     `   
    
    this.querySelector('a')?.addEventListener('click', () => {
    const fbp = getCookie('_fbp')
    const fbc = getCookie('_fbc')
        
    const message = `${getVisiterId()} 🚀 Переход в бот  - ${attr}
fbp:${fbp}
fbc:${fbc}`

      sendMessageToAdmin(message);
    });
  }
}
customElements.define('c-anh-to_bot', CAnhToBot);