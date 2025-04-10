// components/header.js
class KapHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    this.innerHTML = `
      <header>
        <div class="container header-container">
          <a href="/" class="logo">
            <div class="logo-icon">K</div> Kap Raporu
          </a>
          <div class="search-container">
            <div class="search-bar">
              <div class="search-icon">🔍</div>
              <input type="text" placeholder="Arama fonksiyonu yakında hizmetinizde..." disabled>
              <span style="position: absolute; right: 10px; font-size: 12px; color: var(--text-lighter);">Yakında</span>
            </div>
          </div>
          <div></div>
        </div>
      </header>

      <div class="update-info">
        <div class="container">
          Son güncelleme: ${new Date().toLocaleDateString('tr-TR')}, ${new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute:'2-digit'})} | Veriler KAP'tan alınmaktadır.
        </div>
      </div>
    `;
  }
}

customElements.define('kap-header', KapHeader);