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
            <div class="search-bar" style="position: relative;">
              <div class="search-icon">🔍</div>
              <input type="text" id="ticker-search" placeholder="Hisse kodu ara..." autocomplete="off">
              <div id="search-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background-color: white; border: 1px solid var(--border); border-radius: 0 0 8px 8px; max-height: 300px; overflow-y: auto; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-top: 4px;"></div>
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
    
    // IMPORTANT - Remove any existing event listeners from the search input
    const oldInput = document.getElementById('ticker-search');
    if (oldInput) {
      const newInput = oldInput.cloneNode(true);
      oldInput.parentNode.replaceChild(newInput, oldInput);
    }
    
    // Available tickers
    const allTickers = [
      "THYAO", "ASELS", "EREGL", "SISE", "GARAN", "KCHOL", "EKGYO", 
      "AKBNK", "FROTO", "KOZAL", "TAVHL", "ISCTR", "ENKAI", "MGROS",
      "SAHOL", "YKBNK", "ULKER", "TCELL", "AEFES", "CIMSA"
    ];
    
    // Get elements AFTER they've been rendered
    setTimeout(() => {
      const searchInput = document.getElementById('ticker-search');
      const dropdown = document.getElementById('search-dropdown');
      
      if (!searchInput || !dropdown) return;
      
      // Function to show suggestions
      function showSuggestions(term) {
        // Clear previous suggestions
        dropdown.innerHTML = '';
        
        if (!term || term.length === 0) {
          dropdown.style.display = 'none';
          return;
        }
        
        // Filter tickers based on input
        const matches = allTickers.filter(ticker => 
          ticker.includes(term.toUpperCase())
        );
        
        // Show suggestions if we have matches
        if (matches.length > 0) {
          dropdown.style.display = 'block';
          
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
            
            dropdown.appendChild(suggestion);
          });
        } else {
          dropdown.style.display = 'block';
          const noMatches = document.createElement('div');
          noMatches.textContent = 'Eşleşen ticker bulunamadı';
          noMatches.style.padding = '10px 16px';
          noMatches.style.color = 'var(--text-light)';
          noMatches.style.fontStyle = 'italic';
          dropdown.appendChild(noMatches);
        }
      }
      
      // Add input event with explicit handling
      searchInput.addEventListener('input', function(e) {
        e.preventDefault(); // Prevent default behavior
        e.stopPropagation(); // Stop event from bubbling up
        showSuggestions(this.value);
        return false; // Extra measure to prevent other handlers
      });
      
      // Hide dropdown when clicking outside
      document.addEventListener('click', function(e) {
        if (e.target !== searchInput && !dropdown.contains(e.target)) {
          dropdown.style.display = 'none';
        }
      });
      
      // Handle enter key
      searchInput.addEventListener('keydown', function(e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          const ticker = this.value.toUpperCase().trim();
          if (allTickers.includes(ticker)) {
            window.location.href = `/stocks/${ticker.toLowerCase()}.html`;
          }
        }
      });
    }, 100); // Slight delay to ensure DOM is ready
  }
}

customElements.define('kap-header', KapHeader);