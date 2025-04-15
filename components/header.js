// components/header.js
class KapHeader extends HTMLElement {
  constructor() {
    super();
  }

  connectedCallback() {
    const currentLocaleTime = new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute:'2-digit' });
    const currentLocaleDate = new Date().toLocaleDateString('tr-TR');

    this.innerHTML = `
      <header>
        <div class="container header-container">
          <a href="/" class="logo">
            <div class="logo-icon">K</div> Kap Raporu
          </a>
          <div class="search-container">
            <div class="search-bar" style="position: relative;">
              <div class="search-icon">🔍</div>
              <input type="text" id="kapraporu-search" placeholder="Hisse kodu ara..." autocomplete="off">
              <div id="kapraporu-dropdown" style="display: none; position: absolute; top: 100%; left: 0; right: 0; background-color: white; border: 1px solid var(--border); border-radius: 0 0 8px 8px; max-height: 300px; overflow-y: auto; z-index: 1000; box-shadow: 0 4px 12px rgba(0,0,0,0.1); margin-top: 4px;"></div>
            </div>
          </div>
          <div></div> </div>
      </header>

      <div class="update-info">
        <div class="container">
          Sayfa Yüklenme Zamanı: ${currentLocaleDate}, ${currentLocaleTime} | Veriler KAP'tan API ile alınmaktadır.
        </div>
      </div>
    `;

    // CRITICAL: Use completely unique IDs to avoid conflicts
    const searchInput = document.getElementById('kapraporu-search');
    const dropdown = document.getElementById('kapraporu-dropdown');

    if (!searchInput || !dropdown) {
        console.error("Search input or dropdown not found in header component.");
        return; // Exit if essential elements are missing
    }

    // Available tickers - Should match stocksData keys + ensure pages exist
    const allTickers = [
        "THYAO", "GARAN", "ASELS", "EREGL", "SISE", "CIMSA", "AEFES",
        "TUPRS", "TCELL", "AKBNK", "BIMAS", "FROTO", "PGSUS", "KOZAL",
        "TAVHL", "TOASO", "ISCTR", "ENKAI", "TTKOM", "ASTOR", "MGROS",
        "KCHOL", "SAHOL", "YKBNK", "ULKER", "EKGYO"
        // Add any other symbols from stocks.js if they have pages
    ].sort(); // Sort alphabetically for better dropdown usability


    // Function to show suggestions
    function showSuggestions(term) {
      // Clear previous suggestions
      dropdown.innerHTML = '';

      if (!term || term.length === 0) {
        dropdown.style.display = 'none';
        return;
      }

      // Filter tickers based on input (case-insensitive)
      const searchTermUpper = term.toUpperCase();
      const matches = allTickers.filter(ticker =>
        ticker.toUpperCase().includes(searchTermUpper) // Ensure ticker is also upper for comparison
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
            suggestion.style.backgroundColor = 'var(--bg-alt)'; // Use alt background for hover
          });
          suggestion.addEventListener('mouseout', () => {
            suggestion.style.backgroundColor = '';
          });

          // Navigate to page on click
          suggestion.addEventListener('click', () => {
            window.location.href = `/stocks/${ticker.toLowerCase()}.html`; // Ensure base path is correct if needed
          });

          dropdown.appendChild(suggestion);
        });
         // Remove border from last item
         if(dropdown.lastChild) {
            dropdown.lastChild.style.borderBottom = 'none';
         }
      } else {
        dropdown.style.display = 'block';
        const noMatches = document.createElement('div');
        noMatches.textContent = 'Eşleşen hisse bulunamadı';
        noMatches.style.padding = '10px 16px';
        noMatches.style.color = 'var(--text-light)';
        noMatches.style.fontStyle = 'italic';
        dropdown.appendChild(noMatches);
      }
    }

    // Use capturing phase for input events to potentially avoid conflicts
    searchInput.addEventListener('input', function(e) {
     //   e.stopImmediatePropagation(); // Use cautiously - might break other things
      showSuggestions(this.value);
    }, false); // Changed back to false (bubbling) unless conflicts are proven

    // Hide dropdown when clicking outside
    document.addEventListener('click', function(e) {
      // Check if the click is outside the search input AND outside the dropdown
      if (e.target !== searchInput && !dropdown.contains(e.target)) {
        dropdown.style.display = 'none';
      }
    });

    // Handle enter key
    searchInput.addEventListener('keydown', function(e) {
      if (e.key === 'Enter') {
       // e.stopImmediatePropagation(); // Use cautiously
        e.preventDefault(); // Prevent form submission if it's in a form
        const ticker = this.value.toUpperCase().trim();
        // Check against the definitive list
        if (allTickers.includes(ticker)) {
          window.location.href = `/stocks/${ticker.toLowerCase()}.html`; // Ensure base path is correct
        } else {
            // Optional: Indicate no match on Enter if needed
            showSuggestions(ticker); // Show "no matches" message
        }
      }
    }, false); // Changed back to false
  }
}

customElements.define('kap-header', KapHeader);