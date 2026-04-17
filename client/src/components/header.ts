
  
export function renderHeader(): void {
  const header = document.querySelector('#header');
  if (!header) return;


  

  // const path = window.location.pathname;

  // header.innerHTML = `
  //   <nav>
  //     <div class="logo-bl">
  //       ${path !== '/' ? `<a href="/" class="logo"></a>` : ''}
  //     </div>
  //     <a href="/settings" class="btn-settings"></a>      
  //   </nav>
  // `;
  // // подсвечивает текущую страницу
  // const links = header.querySelectorAll('a');
  // links.forEach(link => {
  //   if (link.getAttribute('href') === window.location.pathname) {
  //     link.classList.add('active');
  //   }
  // });
}