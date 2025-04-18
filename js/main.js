// CRITICAL: Don't modify this line - disables default search behavior
// to prevent conflicts with the dropdown search in header.js
const TICKER_SEARCH_ENABLED_IN_HEADER = true;

// --- Utility function to get today's date in Turkish Format ---
function getTodayTurkishDate() {
    const today = new Date();
    const day = today.getDate();
    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();
    return `${day} ${month} ${year}`;
}

// --- Utility function to get today's date in YYYY-MM-DD Format ---
function getTodaySortableDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


document.addEventListener('DOMContentLoaded', function() {
  console.log("Document loaded, initializing...");

  // Load stock data for index page
  if (document.querySelector('.news-feed') && typeof stocksData !== 'undefined') {
      loadLatestNews(); // Uses stocksData for now
      loadMarketSummary();
      loadPopularStocks();
  }

  // Load stock specific data for stock pages
  const stockHeader = document.querySelector('.stock-header');
  if (stockHeader) {
      const symbolElement = document.querySelector('.stock-symbol');
      if (symbolElement) {
          const symbol = symbolElement.textContent;
          console.log("Stock page detected for symbol:", symbol);
          loadStockPageData(symbol); // Fetches individual JSON
      } else {
          console.error("Stock symbol element not found on stock page!");
      }
  }
});

// --- Loads data for individual stock pages ---
async function loadStockPageData(symbol) {
    console.log("Loading dynamic data for stock page:", symbol);

    const timelineContainer = document.querySelector('.timeline');
    const investmentPlansContainer = document.querySelector('.investment-plans'); // Renamed for clarity

    if (timelineContainer) timelineContainer.innerHTML = '<div id="loading-indicator" style="padding: 20px; text-align: center;">Bildirimler yükleniyor...</div>';
    if (investmentPlansContainer) investmentPlansContainer.innerHTML = '<div id="plans-loading" style="padding: 15px; text-align: center; color: var(--text-lighter);">Yatırım planları yükleniyor...</div>';

    // Load investment plans first (if file exists)
    await loadInvestmentPlans(symbol);

    // Set up filter tab functionality
    setupFilterTabs(symbol); // Setup tabs regardless of news loading

    // Try to load real news data from JSON file
    try {
        console.log("Attempting to load news data from JSON file");
        const newsFile = `../data/${symbol.toLowerCase()}_news.json`; // Path relative to HTML file in /stocks/
        console.log("Fetching:", newsFile);
        const response = await fetch(newsFile);
        console.log("Fetch response status:", response.status);

        if (response.ok) {
            const newsData = await response.json();
            console.log(`News data for ${symbol} loaded successfully: ${newsData.length} days`);

            if (timelineContainer) {
                if (newsData && Array.isArray(newsData) && newsData.length > 0) {
                    loadNewsTimeline(symbol, newsData); // Build timeline HTML with expandable items
                    // Click handlers are now part of setupNewsItemExpansion called within loadNewsTimeline
                } else {
                    console.warn("News data array is empty or invalid for", symbol);
                    displayNoNewsMessage(symbol, timelineContainer, null); // Pass container
                }
            } else {
                 console.error("Timeline container element not found!");
            }
        } else {
            console.warn(`News data file for ${symbol} not found or fetch error (status: ${response.status})`);
            displayNoNewsMessage(symbol, timelineContainer, null); // Pass container
        }
    } catch (error) {
        console.error(`Error loading or parsing news data for ${symbol}:`, error);
        displayNoNewsMessage(symbol, timelineContainer, null); // Pass container
    }
}


// --- Renders the news timeline with expandable items ---
function loadNewsTimeline(symbol, newsData) {
    console.log("Rendering news timeline for", symbol);
    const timeline = document.querySelector('.timeline');
    if (!timeline) { console.error("Timeline element not found!"); return; }
    if (!Array.isArray(newsData)) { console.error("Invalid news data format.", newsData); timeline.innerHTML = `<div class="no-news-day" style="text-align: center; padding: 20px; color: var(--red);">Haber verisi hatalı formatta.</div>`; return; }
    if (newsData.length === 0) { console.warn("No news days for", symbol); timeline.innerHTML = `<div class="no-news-day" style="text-align: center; padding: 20px;">${symbol} için kayıtlı şirket bildirimi bulunamadı.</div>`; return; }

    timeline.innerHTML = ''; // Clear loading/previous
    const todaySortable = getTodaySortableDate(); // Get today's date once

    newsData.forEach((day) => {
        // Basic validation for day object structure
        if (!day || typeof day.date !== 'string' || typeof day.sortable_date !== 'string' || !Array.isArray(day.items)) {
             console.warn("Skipping invalid day structure:", day); return;
        }

        const isToday = day.sortable_date === todaySortable; // Check against sortable_date

        const dayMarker = document.createElement('div');
        dayMarker.className = 'day-marker';
        const dotClass = isToday ? 'day-dot today-dot' : 'day-dot past-dot';
        const dateClass = isToday ? 'day-date today-date' : 'day-date';
        const dateText = isToday ? `${day.date} - Bugün` : day.date; // Use the display date from JSON
        dayMarker.innerHTML = `<div class="${dotClass}"></div><div class="${dateClass}">${dateText}</div>`;
        timeline.appendChild(dayMarker);

        if (day.items.length > 0) {
            const newsItemsContainer = document.createElement('div');
            newsItemsContainer.className = 'news-items';
            day.items.forEach(item => {
                 // Basic validation for item object structure
                if (!item || typeof item.title !== 'string' || typeof item.category !== 'string') {
                     console.warn("Skipping invalid item structure:", item); return;
                }

                const newsItem = document.createElement('div');
                // Initial state: not expanded, potentially active if marked in JSON
                newsItem.className = item.active ? 'news-item active' : 'news-item';
                newsItem.setAttribute('data-category-value', item.category); // Store raw category for filtering


                // Generate relevant link HTML only if url is valid
                let linkHTML = '';
                if (item.url && typeof item.url === 'string' && item.url.trim() !== '' && item.url.startsWith('http')) {
                     linkHTML = `<div class="file-link" style="margin-top: 15px; text-align: left;">
                       <a href="${item.url}" target="_blank" class="file-button" style="padding: 8px 16px; font-size: 13px;">
                         Kaynağa Git
                       </a>
                     </div>`;
                }

                newsItem.innerHTML = `
                    <div class="news-item-header" style="cursor: pointer;"> <div class="news-time">${item.time || 'N/A'}</div>
                        <div class="news-title-timeline">${item.title}</div>
                        <div class="news-category">${item.category || 'Genel'}</div>
                    </div>
                    <div class="news-content-expandable" style="display: none; padding-top: 15px; border-top: 1px dashed var(--border); margin-top: 10px;">
                        ${item.content || '<p>İçerik bulunamadı.</p>'}
                        ${linkHTML}
                    </div>`;
                newsItemsContainer.appendChild(newsItem);
            });
            timeline.appendChild(newsItemsContainer);
        } else {
             // If a day has no items
             const noNews = document.createElement('div');
             noNews.className = 'no-news-day';
             noNews.textContent = `Bu tarihte bildirim bulunmuyor.`;
             timeline.appendChild(noNews);
        }
    });

    // Setup the expandable news items AFTER rendering
    setupNewsItemExpansion();

    // Apply initial filter if needed (e.g., default to 'all')
    filterNewsByCategory('all'); // Show all initially

    // Set the first item as active visually if no item was marked active in JSON
    const firstItem = timeline.querySelector('.news-item');
    if(firstItem && !timeline.querySelector('.news-item.active')) {
        // Find the first item that is currently visible after initial filter
        const firstVisibleItem = Array.from(timeline.querySelectorAll('.news-item')).find(item => item.style.display !== 'none');
        if (firstVisibleItem) {
             // No need to mark active for expandable view, handled by expansion state
             // firstVisibleItem.classList.add('active');
             // Maybe expand the first item?
             // toggleExpansion(firstVisibleItem, true); // Expand the first one by default
        }
    }
}

// --- Toggles the expansion state of a news item ---
function toggleExpansion(item, forceExpand = false) {
    const content = item.querySelector('.news-content-expandable');
    const header = item.querySelector('.news-item-header'); // Find the header
    if (!content || !header) return;

    const isExpanded = item.classList.contains('expanded');

    if (forceExpand && !isExpanded) {
        item.classList.add('expanded');
        content.style.display = 'block';
        item.style.backgroundColor = 'var(--white)'; // Apply expanded styles
        item.style.boxShadow = 'var(--hover-shadow)';
    } else if (!forceExpand && isExpanded) {
        item.classList.remove('expanded');
        content.style.display = 'none';
        item.style.backgroundColor = ''; // Revert styles
        item.style.boxShadow = '';
    } else if (!forceExpand && !isExpanded) {
        // Collapse all others first
        document.querySelectorAll('.news-item.expanded').forEach(expandedItem => {
             if (expandedItem !== item) {
                  toggleExpansion(expandedItem, false); // Collapse others
             }
        });
        // Expand this one
        item.classList.add('expanded');
        content.style.display = 'block';
        item.style.backgroundColor = 'var(--white)'; // Apply expanded styles
        item.style.boxShadow = 'var(--hover-shadow)';
    }
     // Scroll into view if needed (optional)
     if (item.classList.contains('expanded')) {
        // item.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
}


// --- Sets up click listeners for news item expansion ---
function setupNewsItemExpansion() {
    // Use event delegation on the timeline container for potentially better performance
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;

    timeline.addEventListener('click', function(e) {
        // Find the closest ancestor which is a news item header
        const header = e.target.closest('.news-item-header');
        if (!header) return; // Click wasn't on a header

        const newsItem = header.closest('.news-item');
        if (!newsItem) return; // Should not happen if header is found

         // Prevent expansion if clicking the link *inside* the expanded area (though the listener is on the header now)
         // if (e.target.closest('a.file-button')) {
         //     return;
         // }

        console.log("News item header clicked:", newsItem.querySelector('.news-title-timeline')?.textContent);
        toggleExpansion(newsItem); // Toggle this item

    });
}


// --- Loads investment plans ---
async function loadInvestmentPlans(symbol) {
  console.log("Loading investment plans for:", symbol);
  const plansContainer = document.querySelector('.investment-plans');
  if (!plansContainer) { console.warn("Investment plans container not found for", symbol); return; }
  plansContainer.innerHTML = `<div id="plans-loading" style="padding: 15px; text-align: center; color: var(--text-lighter);">Yatırım planları yükleniyor...</div>`;
  plansContainer.style.display = 'none'; // Hide initially

  try {
      const plansFile = `../data/${symbol.toLowerCase()}_investment_plans.json`; // Relative path
      const response = await fetch(plansFile);
      if (!response.ok) {
          console.log(`No investment plans file or fetch error for ${symbol} (Status: ${response.status}). Section will remain hidden.`);
          plansContainer.innerHTML = ''; // Clear loading message
          return; // Exit function, keep section hidden
      }
      const plans = await response.json();
      console.log(`Loaded ${plans.length} investment plans for ${symbol}`);
      if (plans && plans.length > 0) {
          plansContainer.style.display = ''; // Show the container
          plansContainer.innerHTML = `<h2 class="section-title">Yatırım Planları & Projeler<span class="update-schedule">Varsa Son Güncellemeler</span></h2><div class="plans-list"></div>`;
          const plansList = plansContainer.querySelector('.plans-list');
          plans.forEach(plan => {
              const planCard = document.createElement('div');
              planCard.className = 'plan-card widget-card'; // Use widget-card style
              let updatesHTML = '';
              if (plan.updates && plan.updates.length > 0) {
                   updatesHTML = `<div class="plan-updates"><h4>Son Gelişmeler</h4><ul> ${plan.updates.map(update => `<li>
                               <div class="update-date">${update.date || ''}</div>
                               <div class="update-summary">${update.summary || ''}</div>
                               ${update.details ? `<div class="update-details" style="font-size: 0.9em; color: var(--text-light); margin-top: 5px;">${update.details}</div>` : ''}
                               ${(update.url && update.url.startsWith('http')) ? `<a href="${update.url}" target="_blank" style="font-size: 0.85em; margin-top: 8px; display: inline-block; color: var(--secondary);">İlgili Bildirim</a>` : ''}
                           </li>`).join('')}</ul></div>`;
              }

               // Generate link for the main source URL
              let mainLinkHTML = '';
              if (plan.url && typeof plan.url === 'string' && plan.url.trim() !== '' && plan.url.startsWith('http')) {
                  mainLinkHTML = `<a href="${plan.url}" target="_blank" style="font-size: 0.85em; color: var(--secondary);">Kaynak Bildirim</a>`;
              }

              planCard.innerHTML = `
                  <h3 class="plan-title">${plan.title || 'Başlık Yok'}</h3>
                  <div class="plan-meta">
                      <span class="plan-category">${plan.category || 'Genel'}</span>
                      <span class="plan-date">Açıklanma: ${plan.date_announced || 'N/A'}</span>
                      ${mainLinkHTML}
                  </div>
                  ${plan.description ? `<div class="plan-description">${plan.description}</div>` : ''}
                  ${plan.details ? `<div class="plan-details">${plan.details}</div>` : ''}
                  ${plan.financial_impact ? `<div class="plan-financial-impact" style="font-size: 0.9em; margin-top:10px; font-style: italic; color: var(--text-light);"><strong>Finansal Etki:</strong> ${plan.financial_impact}</div>` : ''}
                  ${updatesHTML}`;
              plansList.appendChild(planCard);
          });
          // Make the section visible in the layout logic if 'investment' tab is active
          const investmentTab = document.querySelector('.filter-tab[data-category="investment"]');
          if (investmentTab && investmentTab.classList.contains('active')) {
               plansContainer.classList.add('visible');
               document.querySelector('.news-timeline')?.classList.add('compressed');
          } else {
                plansContainer.classList.remove('visible'); // Ensure it's hidden if not active
          }

      } else {
          console.log(`Investment plans file for ${symbol} is empty. Section will remain hidden.`);
          plansContainer.innerHTML = ''; // Clear loading message
      }
  } catch (error) {
      console.error(`Error loading investment plans for ${symbol}:`, error);
      // Display error message but keep section hidden unless needed
      // plansContainer.innerHTML = `<div style="color: var(--red); padding: 15px;">Yatırım planları yüklenirken hata oluştu.</div>`;
      plansContainer.innerHTML = ''; // Clear loading
      plansContainer.style.display = 'none';
  }
}


// --- Displays message when no news is found ---
// Modified to accept container elements
function displayNoNewsMessage(symbol, timelineContainer, detailContainer) {
    const message = `<div style="text-align: center; padding: 40px 20px; color: var(--text-light);"><div style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">Bildirim Bulunamadı</div><p style="color: var(--text-lighter);">${symbol} için şirket bildirimi bulunamadı veya ilgili JSON dosyası eksik/hatalı.</p></div>`; // Updated message

    if (timelineContainer) {
        timelineContainer.innerHTML = message;
    } else {
        console.warn("Timeline container not found for no-news message.");
    }

    // Clear detail container if it exists (relevant if old structure was used)
    if (detailContainer) {
         detailContainer.innerHTML = ''; // Clear it out
        // detailContainer.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-light);"><div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">Bildirim Detayı Yok</div><p style="color: var(--text-lighter);">Gösterilecek bildirim detayı bulunmamaktadır.</p></div>`;
    }
}

// --- Homepage function: Load latest news preview ---
// Reads from stocksData (user needs to manage news within it OR this needs dynamic fetch)
function loadLatestNews() {
    const newsContainer = document.querySelector('.news-feed');
    if (!newsContainer || typeof stocksData === 'undefined') {
        console.error("News container or stocksData not found for index page.");
        if(newsContainer) newsContainer.innerHTML = '<p>Haberler yüklenemedi.</p>';
        return;
    }

    let allNews = [];
    const todayDateStr = getTodayTurkishDate(); // Get today's date dynamically
    console.log("Loading news for index page for date:", todayDateStr);

    for (const symbol in stocksData) {
        const stock = stocksData[symbol];
        // CRITICAL: This assumes 'news' array exists in stocksData
        if (stock.news && Array.isArray(stock.news)) {
            stock.news.forEach(dayNews => {
                // Compare using the dynamically generated Turkish date string
                if (dayNews.date === todayDateStr) {
                    if (dayNews.items && Array.isArray(dayNews.items)) {
                        dayNews.items.forEach(item => {
                            if (item.title && item.content) {
                                // Simple description: remove HTML tags and truncate
                                let desc = 'İçerik özeti yok.';
                                if (typeof item.content === 'string') {
                                    desc = item.content.replace(/<[^>]*>/g, '').substring(0, 150).trim(); // Remove tags, trim whitespace
                                    if (item.content.length > 150) {
                                        desc += '...';
                                    }
                                }
                                allNews.push({
                                    // sortable_date: dayNews.sortable_date || null, // Not strictly needed for display here
                                    date: dayNews.date || "Tarih Yok",
                                    time: item.time || "Saat Yok",
                                    title: item.title,
                                    desc: desc,
                                    symbol: stock.symbol // Use the key from stocksData
                                });
                            }
                        });
                    }
                }
            });
        } else {
            // Log if a stock in stocksData is missing the news array (if expected)
            // console.warn(`Stock ${symbol} in stocksData is missing the 'news' array.`);
        }
    }

    // Sort news by time (descending)
    allNews.sort((a, b) => {
        return (b.time || '00:00').localeCompare(a.time || '00:00');
    });

    // Use correct Turkish title
    newsContainer.innerHTML = `<h2 class="section-title">Günün Şirket Haberleri<span class="update-schedule">Günlük Güncellenir</span></h2>`;
    if (allNews.length > 0) {
        allNews.forEach(news => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            // Ensure symbol link is correct
            const stockPageUrl = `stocks/${news.symbol.toLowerCase()}.html`;
            newsCard.innerHTML = `
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-time">${news.date || ''} - ${news.time || ''}</span>
                        <span class="news-source">BORSA</span>
                    </div>
                    <h3 class="news-title">${news.title || 'Başlık Yok'}</h3>
                    <p class="news-desc">${news.desc || ''}</p>
                    <div class="related-tickers">
                        <a href="${stockPageUrl}" class="ticker-link">
                            <div class="ticker">${news.symbol}</div>
                        </a>
                    </div>
                </div>`;
            newsContainer.appendChild(newsCard);
        });
    } else {
        newsContainer.innerHTML += `<p style="text-align: center; padding: 20px; color: var(--text-lighter);">Bugün için şirket bildirimi bulunamadı (Veri kaynağını kontrol edin: /data/stocks.js).</p>`; // Updated message
    }
}


// --- Homepage function: Load market summary ---
// TODO: Update with current data or implement dynamic fetching
function loadMarketSummary() {
    const marketList = document.querySelector('.market-list');
    if (!marketList) return;

    // Updated static data for April 13, 2025 (Example - REPLACE with real/dynamic data)
    marketList.innerHTML = `
        <li class="market-item"><span class="market-name">BIST 100</span><span class="market-value">10,350.12</span></li>
        <li class="market-item"><span class="market-name">BIST 30</span><span class="market-value">13,050.78</span></li>
        <li class="market-item"><span class="market-name">TCMB Faizi</span><span class="market-value">25.00%</span></li>
        <li class="market-item"><span class="market-name">Dolar/TL</span><span class="market-value">32.65</span></li>
        <li class="market-item"><span class="market-name">Euro/TL</span><span class="market-value">35.40</span></li>
        <li class="market-item"><span class="market-name">Altın (ONS)</span><span class="market-value">$2385.20</span></li>
        <li class="market-item"><span class="market-name">Brent Petrol</span><span class="market-value">$88.10</span></li>
    `;
    // Update the schedule text dynamically maybe?
    const scheduleSpan = document.querySelector('.sidebar .widget-card:nth-child(1) .section-title .update-schedule');
    if(scheduleSpan) scheduleSpan.textContent = "13.04.2025"; // Update date
}

// --- Homepage function: Load popular stocks links ---
function loadPopularStocks() {
    const stocksContainer = document.querySelector('.stock-list-simple');
    if (!stocksContainer || typeof stocksData === 'undefined') return;

    // Generate list from stocksData keys for consistency
    const availableSymbols = Object.keys(stocksData);

    // Optionally, define a preferred list for BIST30/popular display order
    const popularSymbols = [
        "THYAO", "ASELS", "EREGL", "SISE", "GARAN", "KCHOL", "EKGYO",
        "AKBNK", "FROTO", "KOZAL", "TAVHL", "ISCTR", "ENKAI", "MGROS",
        "SAHOL", "YKBNK", "ULKER", "TCELL", "AEFES", "CIMSA", "TUPRS",
        "BIMAS", "PGSUS", "TOASO", "TTKOM", "ASTOR" // Add others as needed
    ]; // Use the list from stocksData or define popular ones

    stocksContainer.innerHTML = '';
    popularSymbols.forEach(symbol => {
        if (stocksData[symbol]) { // Check if data exists for this symbol
            const link = document.createElement('a');
            link.href = `stocks/${symbol.toLowerCase()}.html`;
            link.className = 'stock-link';
            link.textContent = symbol;
            stocksContainer.appendChild(link);
        }
    });
     // Update schedule text
     const scheduleSpan = document.querySelector('.sidebar .widget-card:nth-child(2) .section-title .update-schedule');
     if(scheduleSpan) scheduleSpan.textContent = `${availableSymbols.length} Hisse`;
}


// --- Sets up filter tabs on stock pages ---
function setupFilterTabs(symbol) {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const newsTimelineContainer = document.querySelector('.news-timeline'); // Container holding timeline
    const investmentPlansContainer = document.querySelector('.investment-plans'); // Container for plans

    if (!filterTabs.length || !newsTimelineContainer || !investmentPlansContainer) {
        console.warn("Missing elements for filter tabs setup");
        return;
    }

    // Check if investment plans actually have content loaded (check if it has child elements other than loading message)
    const hasInvestmentPlans = investmentPlansContainer.querySelector('.plans-list'); // Check if list was rendered

    filterTabs.forEach(tab => {
        const category = tab.getAttribute('data-category');

        // Disable/hide the 'Yatırım' tab if no plans were loaded
        if (category === 'investment' && !hasInvestmentPlans) {
            tab.style.display = 'none'; // Hide the tab
        }

        tab.addEventListener('click', function() {
            // Update active state
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');

            const currentCategory = this.getAttribute('data-category');

            // Handle layout adjustment for Investment Plans
            if (currentCategory === 'investment' && hasInvestmentPlans) {
                investmentPlansContainer.classList.add('visible');
                newsTimelineContainer.classList.add('compressed');
            } else {
                investmentPlansContainer.classList.remove('visible');
                newsTimelineContainer.classList.remove('compressed');
            }

            // Filter the news items in the timeline
            filterNewsByCategory(currentCategory);
        });
    });

     // Activate the 'all' tab by default if no tab is active initially
     if (!document.querySelector('.filter-tab.active')) {
         const allTab = document.querySelector('.filter-tab[data-category="all"]');
         if (allTab) {
             allTab.click(); // Simulate a click to trigger filtering and active state
         }
     }
}

// --- Filters news items in the timeline by category ---
function filterNewsByCategory(category) {
    const newsItems = document.querySelectorAll('.timeline .news-item');
    console.log(`Filtering news by category: ${category}`);

    // Define mapping from tab data-category to JSON category values
    // This needs to be accurate based on your JSON data categories.
    const categoryMap = {
        'all': null, // Special case: show all
        'financial': ["Finansal", "Mali Tablo", "Faiz İçeren"], // Example grouping
        'investment': ["Yatırım", "Sermaye", "Pay Alım Satım", "İştirak", "Bölünme", "Birleşme", "Yeni İş İlişkisi"], // Example grouping
        'operational': ["Operasyonel", "Üretim", "Satış", "İhale Süreci / Sonucu", "Varlık Alım/Satım"], // Example grouping
        'management': ["Yönetim", "Genel Kurul", "Atama", "Organizasyonel Değişiklik"], // Example grouping
        'other': ["Diğer", "Genel", "Derecelendirme", "Sürdürülebilirlik", "Özel Durum Açıklaması (Genel)", "Haber ve Söylenti"] // Catch-all
        // Add more specific categories from your JSON if needed
    };


    const targetCategories = categoryMap[category];

    let visibleCount = 0;
    newsItems.forEach(item => {
        const itemCategory = item.getAttribute('data-category-value'); // Get category from data attribute

        // Determine if the item should be visible
        let isVisible = false;
        if (category === 'all') {
            isVisible = true;
        } else if (targetCategories && itemCategory) {
            // Check if the item's category is included in the target list for the selected tab
            isVisible = targetCategories.some(tc => itemCategory.toLowerCase().includes(tc.toLowerCase()));
             // Fallback: if category is 'other', also show items whose category isn't explicitly mapped elsewhere
             if (!isVisible && category === 'other') {
                 const allMappedCats = Object.values(categoryMap).flat().filter(Boolean); // Get all known categories
                 if (!allMappedCats.some(knownCat => itemCategory.toLowerCase().includes(knownCat.toLowerCase()))) {
                    isVisible = true; // Show if it's not recognized by other filters
                 }
             }
        } else if (category === 'other' && !itemCategory) {
             isVisible = true; // Show items with no category under 'other'
        }


        item.style.display = isVisible ? '' : 'none';
        if(isVisible) visibleCount++;
    });

    // Handle display of day markers: hide marker if no items are visible for that day
    const dayMarkers = document.querySelectorAll('.timeline .day-marker');
    dayMarkers.forEach(marker => {
        const itemsContainer = marker.nextElementSibling;
        if (itemsContainer && itemsContainer.classList.contains('news-items')) {
            const visibleItemsInDay = itemsContainer.querySelectorAll('.news-item[style*="display: block"], .news-item:not([style*="display: none"])'); // Check visible items
             if (visibleItemsInDay.length === 0) {
                 marker.style.display = 'none'; // Hide day marker
                 itemsContainer.style.display = 'none'; // Hide empty container too
             } else {
                  marker.style.display = ''; // Show day marker
                  itemsContainer.style.display = ''; // Show container
             }
        } else if (itemsContainer && itemsContainer.classList.contains('no-news-day')) {
            // Hide 'no news' message if filtering is active (unless filter is 'all')
             marker.style.display = category === 'all' ? '' : 'none';
             itemsContainer.style.display = category === 'all' ? '' : 'none';
        }
    });

    // Optional: Display a message if the filter results in no visible items
    const timelineContainer = document.querySelector('.timeline');
    let noResultsMsg = timelineContainer.querySelector('.no-filter-results');
    if (visibleCount === 0 && category !== 'all') {
        if (!noResultsMsg) {
            noResultsMsg = document.createElement('div');
            noResultsMsg.className = 'no-filter-results no-news-day'; // Reuse style
            noResultsMsg.style.textAlign = 'center';
            noResultsMsg.style.padding = '20px';
            timelineContainer.appendChild(noResultsMsg);
        }
        noResultsMsg.textContent = `"${categoryMap[category] ? categoryMap[category].join(', ') : category}" kategorisinde bildirim bulunamadı.`;
        noResultsMsg.style.display = 'block';
    } else if (noResultsMsg) {
        noResultsMsg.style.display = 'none'; // Hide message if there are results
    }
}