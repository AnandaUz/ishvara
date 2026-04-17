
import "./c-top.scss";

export class CTop extends HTMLElement {     

  async connectedCallback() {
    this.innerHTML = `
    <div class="top">
      <img src="/photo-ananda2.jpg" alt="" fetchpriority="high" loading="eager">

      
      <div class="b00">
    <!--  
          Саморазвитие • Здоровье • Бизнес
          -->
      </div>
        

      <div class="b02">
        <a href="/" class="home_anh">
            <span class="home"></span>
            <span class="name">АНАНДА ШАДРИН</span>

        </a>
      </div>
      
  </div>
    
    `

    
  }
}

customElements.define('c-top', CTop);