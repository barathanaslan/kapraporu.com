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
              <input type="text" placeholder="Hisse kodu ara..." autocomplete="off">
              <div class="search-suggestions" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background-color: white; border: 1px solid var(--border); border-radius: 0 0 8px 8px; max-height: 300px; overflow-y: auto; z-index: 100; box-shadow: 0 4px 12px rgba(0,0,0,0.1);"></div>
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
    
    // Available tickers - this is our static list of all possible tickers
    // Add all your tickers here (ideally from your stocks.js)
    const allTickers = [
      "THYAO", "ASELS", "EREGL", "SISE", "GARAN", "KCHOL", "EKGYO", 
      "AKBNK", "FROTO", "KOZAL", "TAVHL", "ISCTR", "ENKAI", "MGROS",
      "SAHOL", "YKBNK", "ULKER", "TCELL", "AEFES", "CIMSA"
    ];
    
    const searchInput = this.querySelector('.search-bar input');
    const suggestionsBox = this.querySelector('.search-suggestions');
    
    if (searchInput && suggestionsBox) {
      // Event listener for input changes
      searchInput.addEventListener('input', function() {
        const term = this.value.toUpperCase().trim();
        
        // Clear previous suggestions
        suggestionsBox.innerHTML = '';
        
        if (term.length === 0) {
          suggestionsBox.style.display = 'none';
          return;
        }
        
        // Filter tickers based on input
        const matches = allTickers.filter(ticker => 
          ticker.includes(term)
        );
        
        // Show suggestions if we have matches
        if (matches.length > 0) {
          suggestionsBox.style.display = 'block';
          
          matches.forEach(ticker => {
            const suggestion = document.createElement('div');
            suggestion.textContent = ticker;
            suggestion.style.padding = '10px 16px';
            suggestion.style.cursor = 'pointer';
            suggestion.style.borderBottom = '1px solid var(--border)';
            suggestion.style.transition = 'background-color 0.2s';
            
            // Highlight on hover
            suggestion.addEventListener('mouseover', () => {
              suggestion.style.backgroundColor = 'var(--bg)';
            });
            suggestion.addEventListener('mouseout', () => {
              suggestion.style.backgroundColor = '';
            });
            
            // Navigate to page on click
            suggestion.addEventListener('click', () => {
              window.location.href = `/stocks/${ticker.toLowerCase()}.html`;
            });
            
            suggestionsBox.appendChild(suggestion);
          });
        } else {
          // Show "no matches" message
          suggestionsBox.style.display = 'block';
          const noMatches = document.createElement('div');
          noMatches.textContent = 'Eşleşen ticker bulunamadı';
          noMatches.style.padding = '10px 16px';
          noMatches.style.color = 'var(--text-light)';
          noMatches.style.fontStyle = 'italic';
          suggestionsBox.appendChild(noMatches);
        }
      });
      
      // Hide suggestions when clicking outside
      document.addEventListener('click', function(e) {
        if (!searchInput.contains(e.target) && !suggestionsBox.contains(e.target)) {
          suggestionsBox.style.display = 'none';
        }
      });
      
      // Handle keyboard navigation and enter key
      searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          // Get the current input value
          const ticker = this.value.toUpperCase().trim();
          
          // Check if it's a valid ticker
          if (allTickers.includes(ticker)) {
            window.location.href = `/stocks/${ticker.toLowerCase()}.html`;
          }
        }
      });
    }
  }
}

customElements.define('kap-header', KapHeader);