import type { Page } from '../types';


export const notFoundPage: Page = () => {
  return {
    html: `

    <h1>404</h1>
    <div class="cont">
      
        <h3>Страница не найдена</h3>
        <a href="/">Вернуться на главную</a>
      
    </div>
    `,
    init() {

    }
  };
}