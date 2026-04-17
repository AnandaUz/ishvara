import { getCookie, sendTrackingEvent } from "@/main";
import "./c-form-meet.scss";
import template from "./c-form-meet.html?raw";
import "@/components/c-anh-to_bot";


export class CFormMeet extends HTMLElement {    
  async connectedCallback() {
    const attr = this.getAttribute('data-attr') || 'f1';    

    const btnText = this.getAttribute('btn-text') || 'Отправить';
    const headerText = this.getAttribute('header-text') || '';
    const bottomText = this.getAttribute('bottom-text') || '';

    this.innerHTML = template
    .replace('{{btnText}}', btnText)
    .replace('{{bottomText}}', bottomText)
    .replace('{{header-text}}', headerText);
    
    const formMeet = this.querySelector('.form-meet') as HTMLFormElement;
    const formBody = this.querySelector('.body') as HTMLFormElement;
    const formMessage = this.querySelector('.formMessage') as HTMLElement;
    const formError = this.querySelector('.formError') as HTMLElement;
    const btnSend = this.querySelector('.btn_send') as HTMLButtonElement;

    if (formMeet && formMessage && formError && btnSend) { 
        
// formBody.style.display = 'none';
// formMessage.style.display = 'block';

        const userName = formMeet.querySelector('.name') as HTMLInputElement;
        const userContact = formMeet.querySelector('.contact') as HTMLInputElement;
        userName.addEventListener('focus', () => {
            sendTrackingEvent('input_name')
        });
        userContact.addEventListener('focus', () => {
            sendTrackingEvent('input_contact')
        });

        btnSend.addEventListener('click', async () => {
            if (!userName?.value) {
                userName?.focus();
                userName?.classList.add('error');
                return;
            }
            userName?.classList.remove('error');
            if (!userContact?.value) {
                userContact?.focus();
                userContact?.classList.add('error');
                return;
            }
            userContact?.classList.remove('error');
            
            //- отправка события в Pixel
            if (typeof window.fbq === 'function') {
                fbq('track', 'Lead', {value: 1.00, currency: 'USD', content_name: 'meet_form'});
            }
            const fbp = getCookie('_fbp')
            const fbc = getCookie('_fbc')
            const userID = localStorage.getItem('good_visiter') || '';
                
            const str = `${userID} 📩 Новая заявка с сайта (Встреча)
Имя: ${userName?.value}
Контакт: ${userContact?.value}
Форма: ${attr}
fbp:${fbp}
fbc:${fbc}
`
            const result = await sendTrackingEvent(str);

            if (result) {              
                formBody.style.display = 'none';
                formMessage.style.display = 'block';
                (formMessage.querySelector('.ex-message-name') as HTMLElement).innerHTML = userName?.value;
                (formMessage.querySelector('.ex-message-contact') as HTMLElement).innerHTML = userContact?.value;
            } else {
                formBody.style.display = 'none';
                formError.style.display = 'block';
                setTimeout(() => {
                    formError.style.display = 'none';
                    formBody.style.display = 'flex';
                    sendTrackingEvent('error_form_reset');
                }, 3000);
                sendTrackingEvent('error_form')
            }
        });
    }
  }
}
customElements.define('c-form-meet', CFormMeet);