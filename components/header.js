// components/header.js - Update this file with the search functionality
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
              <input type="text" placeholder="Hisse kodu ara...">
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
    
    // Initialize simple ticker filtering
    const searchInput = this.querySelector('.search-bar input');
    if (searchInput) {
      searchInput.addEventListener('input', function() {
        const term = this.value.toUpperCase().trim();
        
        // Only filter stock links (ticker names)
        const stockLinks = document.querySelectorAll('.stock-link');
        stockLinks.forEach(link => {
          const ticker = link.textContent.toUpperCase();
          link.style.display = ticker.includes(term) ? '' : 'none';
        });
      });
    }
  }
}

customElements.define('kap-header', KapHeader);