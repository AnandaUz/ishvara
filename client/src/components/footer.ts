export function renderFooter(): void {
  const footer = document.querySelector('#footer');
  if (!footer) return;

  footer.innerHTML = `
    
    <p><a target="_blank" class="anh" href="https://t.me/ananda_uzc">
            Чтобы не пропустить новых статей, рекомендую подключиться к моему каналу.<br> <span>Ссылка</span>
        </a>

    </p>
    <p>© 2025-2026 <a href="https://t.me/ananda_uz">Ананда Шадрин</a></p>

    <a href="/privacy-policy" target="_blank" class="anh2">
        Политика конфиденциальности
    </a>

  `;
}
