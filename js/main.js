// js/main.js - CORRECTED VERSION (Handles kap_url)

document.addEventListener('DOMContentLoaded', function() {
  console.log("Document loaded, initializing...");

  // Load stock data for index page
  if (document.querySelector('.news-feed') && typeof stocksData !== 'undefined') { // Check if stocksData exists (only on index)
      loadLatestNews();
      loadMarketSummary();
      loadPopularStocks(); // Added function call
  }

  // Load stock specific data for stock pages
  const stockHeader = document.querySelector('.stock-header');
  if (stockHeader) {
      const symbolElement = document.querySelector('.stock-symbol');
      if (symbolElement) {
          const symbol = symbolElement.textContent;
          console.log("Stock page detected for symbol:", symbol);
          loadStockPageData(symbol); // Use a renamed function for clarity
      } else {
          console.error("Stock symbol element not found on stock page!");
      }
  }
});

// Function specifically for loading data on individual stock pages
async function loadStockPageData(symbol) {
  console.log("Loading dynamic data for stock page:", symbol);

  // Clear placeholders or add loading indicators if needed
  const timelineContainer = document.querySelector('.timeline');
  const detailContainer = document.querySelector('.news-detail');
  const plansContainer = document.querySelector('.investment-plans');

  if (timelineContainer) timelineContainer.innerHTML = '<div id="loading-indicator" style="padding: 20px; text-align: center;">Bildirimler yükleniyor...</div>';
  if (detailContainer) detailContainer.innerHTML = '<div id="detail-loading" style="padding: 20px; text-align: center;">Bildirim detayı yükleniyor...</div>';
  if (plansContainer) plansContainer.innerHTML = '<div id="plans-loading" style="padding: 15px; text-align: center; color: var(--text-lighter);">Yatırım planları yükleniyor...</div>';


  // Load investment plans first
  await loadInvestmentPlans(symbol);

  // Try to load real news data from JSON file
  try {
      console.log("Attempting to load news data from JSON file");
      const newsFile = `../data/${symbol.toLowerCase()}_news.json`;
      console.log("Fetching:", newsFile);
      const response = await fetch(newsFile);
      console.log("Fetch response status:", response.status);

      if (response.ok) {
          const newsData = await response.json();
          console.log(`News data for ${symbol} loaded successfully: ${newsData.length} days`);

          // Debug: Log sample kap_url from loaded data
           if (newsData && newsData.length > 0 && newsData[0].items && newsData[0].items.length > 0 && newsData[0].items[0].kap_url) {
              console.log(`Sample kap_url from first item: ${newsData[0].items[0].kap_url}`);
           }

           if (timelineContainer) {
              if (newsData && newsData.length > 0) {
                  loadNewsTimeline(symbol, newsData); // Build timeline HTML

                  if (detailContainer) {
                      const activeNews = findActiveNews(newsData); // Find which news to show first
                      if (activeNews) {
                           // Debug: Log the active news object including kap_url
                          console.log("Found active news to display:", activeNews.title, "with kap_url:", activeNews.kap_url);
                          updateNewsDetail(activeNews, symbol); // Display the default/active news detail
                      } else {
                          console.warn("No active news found in data, displaying placeholder.");
                          updateNewsDetail({ // Placeholder
                              dayDate: "Bilgi yok", time: "-", title: "Bildirim detayı bulunamadı",
                              content: "<p>Lütfen sol taraftaki listeden bir bildirim seçiniz.</p>", kap_url: null // Ensure kap_url is null here
                          }, symbol);
                      }
                  } else {
                      console.warn("News detail container not found.");
                  }
                  addNewsItemClickHandlers(symbol); // Add listeners AFTER elements exist
              } else {
                  console.warn("News data array is empty for", symbol);
                  displayNoNewsMessage(symbol);
              }
           } else {
               console.error("Timeline container element not found!");
           }
      } else {
          console.warn(`News data file for ${symbol} not found or fetch error (status: ${response.status})`);
          displayNoNewsMessage(symbol);
      }
  } catch (error) {
      console.error(`Error loading or parsing news data for ${symbol}:`, error);
      displayNoNewsMessage(symbol);
  }
}


// --- Loads the news items into the timeline ---
function loadNewsTimeline(symbol, newsData) {
  console.log("Rendering news timeline for", symbol);
  const timeline = document.querySelector('.timeline');
  if (!timeline) { console.error("Timeline element not found!"); return; }
  if (!Array.isArray(newsData)) { console.error("Invalid news data format.", newsData); timeline.innerHTML = `<div class="no-news-day" style="text-align: center; padding: 20px; color: var(--red);">Haber verisi hatalı formatta.</div>`; return; }
  if (newsData.length === 0) { console.warn("No news days for", symbol); timeline.innerHTML = `<div class="no-news-day" style="text-align: center; padding: 20px;">${symbol} için kayıtlı KAP bildirimi bulunamadı.</div>`; return; }

  timeline.innerHTML = ''; // Clear loading/previous
  newsData.forEach((day) => {
      if (!day || typeof day.date !== 'string' || !Array.isArray(day.items)) { console.warn("Skipping invalid day structure:", day); return; }

      const dayMarker = document.createElement('div');
      dayMarker.className = 'day-marker';
      const dotClass = day.isToday ? 'day-dot today-dot' : 'day-dot past-dot';
      const dateClass = day.isToday ? 'day-date today-date' : 'day-date';
      const dateText = day.isToday ? `${day.date} - Bugün` : day.date;
      dayMarker.innerHTML = `<div class="${dotClass}"></div><div class="${dateClass}">${dateText}</div>`;
      timeline.appendChild(dayMarker);

      if (day.items.length > 0) {
          const newsItemsContainer = document.createElement('div');
          newsItemsContainer.className = 'news-items';
          day.items.forEach(item => {
              if (!item || typeof item.title !== 'string') { console.warn("Skipping invalid item structure:", item); return; }

              const newsItem = document.createElement('div');
              newsItem.className = item.active ? 'news-item active' : 'news-item'; // Check if item is marked active
              newsItem.setAttribute('data-content', item.content || '');

              // *** VITAL CHANGE: Store kap_url in data attribute ***
              if (item.kap_url && typeof item.kap_url === 'string' && item.kap_url.trim() !== '') {
                  newsItem.setAttribute('data-kap-url', item.kap_url);
              } else {
                   newsItem.removeAttribute('data-kap-url'); // Ensure it's not present if missing in data
              }
              // *** END VITAL CHANGE ***

              // Keep file_name attribute if you still need it for any reason
              if (item.file_name) { newsItem.setAttribute('data-file', item.file_name); }
               else { newsItem.removeAttribute('data-file');}


              newsItem.innerHTML = `
                  <div class="news-time">${item.time || 'N/A'}</div>
                  <div class="news-title-timeline">${item.title}</div>
                  <div class="news-category">${item.category || 'Genel'}</div>`;
              newsItemsContainer.appendChild(newsItem);
          });
          timeline.appendChild(newsItemsContainer);
      } else {
           // If a day has no items (unlikely but possible)
           const noNews = document.createElement('div');
           noNews.className = 'no-news-day';
           noNews.textContent = `Bu tarihte bildirim bulunmuyor.`; // Generic message for empty day
           timeline.appendChild(noNews);
      }
  });
}

// --- Adds click listeners to the news items in the timeline ---
function addNewsItemClickHandlers(symbol) {
  // Slight delay can help ensure elements are fully rendered, though often 0ms works
  setTimeout(() => {
      const newsItems = document.querySelectorAll('.timeline .news-item'); // Be more specific
      console.log(`Attaching click handlers to ${newsItems.length} news items for ${symbol}`);

      newsItems.forEach(item => {
          // To prevent adding multiple listeners if this function were called again,
          // we could check if a listener already exists, or use a named function and remove it first.
          // For simplicity here, we assume it's called once after loadNewsTimeline.
          item.addEventListener('click', function handleNewsItemClick() { // Using 'function' for correct 'this' binding
              const titleElement = this.querySelector('.news-title-timeline');
              console.log("News item clicked:", titleElement ? titleElement.textContent : 'N/A');

              // Manage 'active' class
              document.querySelectorAll('.timeline .news-item.active').forEach(i => i.classList.remove('active'));
              this.classList.add('active');

              // Retrieve data stored in attributes
              const dateElement = this.closest('.news-items')?.previousElementSibling?.querySelector('.day-date');
              const dateText = dateElement ? dateElement.textContent.split(' - ')[0] : "Bilinmeyen Tarih";
              const time = this.querySelector('.news-time')?.textContent || '-';
              const title = titleElement ? titleElement.textContent : 'Başlık Yok';
              const content = this.getAttribute('data-content') || "<p>Detaylı bilgi mevcut değil.</p>";

              // *** VITAL CHANGE: Retrieve kap_url from data attribute ***
              const kapUrl = this.getAttribute('data-kap-url'); // Gets the string value or null
              // *** END VITAL CHANGE ***


              // Prepare data object for the detail view
              const customNewsData = {
                  dayDate: dateText,
                  time: time,
                  title: title,
                  content: content,
                  kap_url: kapUrl // Pass the retrieved URL (or null)
              };

              // Update the detail panel
              updateNewsDetail(customNewsData, symbol);
          });
      });
  }, 50); // 50ms delay
}


// --- Updates the news detail panel ---
function updateNewsDetail(newsData, symbol) {
  console.log("Updating news detail. Received kap_url:", newsData.kap_url); // Log received URL
  const newsDetail = document.querySelector('.news-detail');
  if (!newsDetail) { console.error("News detail element not found"); return; }

   // Validate required data
   if (!newsData || typeof newsData.title !== 'string' || typeof newsData.content !== 'string') {
       console.error("Invalid data received by updateNewsDetail:", newsData);
       newsDetail.innerHTML = `<div style="padding: 20px; color: var(--red);">Detay bilgisi yüklenirken hata oluştu (geçersiz veri).</div>`;
       return;
   }

  // Clear loading indicator
  document.getElementById('detail-loading')?.remove(); // Use optional chaining

  // *** VITAL CHANGE: Generate link based on kap_url ***
  let kapLinkHTML = '';
  // Check if kap_url exists, is a string, and is not empty
  if (newsData.kap_url && typeof newsData.kap_url === 'string' && newsData.kap_url.trim() !== '') {
      console.log(`Generating KAP link for URL: ${newsData.kap_url}`);
      kapLinkHTML = `
          <div class="file-link">
              <a href="${newsData.kap_url}" target="_blank" class="file-button">
                  KAP Bildirimine Git
              </a>
          </div>
      `;
  } else {
      // Handle case where URL is missing or empty
      console.log("No specific KAP URL provided for this item. Button will not be displayed.");
      // No button is added if kap_url is missing/invalid
  }
  // *** END VITAL CHANGE ***

  // Construct the detail HTML
  newsDetail.innerHTML = `
      <div class="news-detail-header">
          <div class="news-detail-meta">
              <div class="news-detail-time">${newsData.dayDate || 'Tarih Yok'} - ${newsData.time || 'Saat Yok'}</div>
              <div class="news-detail-source">KAP</div>
          </div>
          <h3 class="news-detail-title">${newsData.title}</h3>
      </div>
      <div class="news-detail-content">
          ${newsData.content}
          ${kapLinkHTML} {/* Insert the generated button/link HTML here */}
      </div>
  `;
}


// --- Finds the default news item to display initially ---
function findActiveNews(newsData) {
  if (!Array.isArray(newsData) || newsData.length === 0) { console.warn("No news data for findActiveNews"); return null; }

  // First, look for an item explicitly marked as active:true in the JSON
  for (const day of newsData) {
      if (Array.isArray(day.items)) {
          for (const item of day.items) {
              if (item && item.active === true) {
                   console.log("Found explicitly active news item:", item.title);
                  return { dayDate: day.date, ...item }; // Return it, including kap_url if present
              }
          }
      }
  }

  // If none marked active, default to the very first item of the first day
  if (newsData[0] && Array.isArray(newsData[0].items) && newsData[0].items.length > 0 && newsData[0].items[0]) {
      console.log("No explicitly active news found, defaulting to the first item:", newsData[0].items[0].title);
      // Optionally mark the first DOM element as active for visual consistency
      const firstNewsItemElement = document.querySelector('.timeline .news-item');
      if(firstNewsItemElement && !firstNewsItemElement.classList.contains('active')) {
           firstNewsItemElement.classList.add('active');
      }
      return { dayDate: newsData[0].date, ...newsData[0].items[0] }; // Return first item, including its kap_url
  }

  console.warn("Could not find any news item to display by default.");
  return null; // No suitable item found
}

// --- Loads investment plans ---
async function loadInvestmentPlans(symbol) {
  console.log("Loading investment plans for:", symbol);
  const plansContainer = document.querySelector('.investment-plans');
  if (!plansContainer) { console.warn("Investment plans container not found for", symbol); return; }
  plansContainer.innerHTML = `<div id="plans-loading" style="padding: 15px; text-align: center; color: var(--text-lighter);">Yatırım planları yükleniyor...</div>`;

  try {
      const plansFile = `../data/${symbol.toLowerCase()}_investment_plans.json`;
      const response = await fetch(plansFile);
      if (!response.ok) {
          console.log(`No investment plans file or fetch error for ${symbol} (Status: ${response.status}). Hiding section.`);
          plansContainer.innerHTML = ''; plansContainer.style.display = 'none'; return;
      }
      const plans = await response.json();
      console.log(`Loaded ${plans.length} investment plans for ${symbol}`);
      if (plans && plans.length > 0) {
          plansContainer.style.display = '';
          plansContainer.innerHTML = `<h2 class="section-title">Yatırım Planları<span class="update-schedule">Varsa Son Güncellemeler</span></h2><div class="plans-list"></div>`;
          const plansList = plansContainer.querySelector('.plans-list');
          plans.forEach(plan => {
              const planCard = document.createElement('div');
              planCard.className = 'plan-card widget-card';
              let updatesHTML = '';
              if (plan.updates && plan.updates.length > 0) {
                  updatesHTML = `<div class="plan-updates"><h4>Güncellemeler</h4><ul>
                      ${plan.updates.map(update => `<li>
                              <div class="update-date">${update.date || ''}</div>
                              <div class="update-summary">${update.summary || ''}</div>
                              ${update.details ? `<div class="update-details" style="font-size: 0.9em; color: var(--text-light);">${update.details}</div>` : ''}
                              ${update.kap_url ? `<a href="${update.kap_url}" target="_blank" style="font-size: 0.85em; margin-top: 5px; display: inline-block;">Detay (KAP)</a>` : ''}
                          </li>`).join('')}</ul></div>`;
              }
              planCard.innerHTML = `
                  <h3 class="plan-title">${plan.title || 'Başlık Yok'}</h3>
                  <div class="plan-meta">
                      <span class="plan-category">${plan.category || 'Genel'}</span>
                      <span class="plan-date">Açıklanma: ${plan.date_announced || 'N/A'}</span>
                      ${plan.kap_url ? `<a href="${plan.kap_url}" target="_blank" style="font-size: 0.85em;">Ana Bildirim (KAP)</a>` : ''}
                  </div>
                  ${plan.description ? `<div class="plan-description">${plan.description}</div>` : ''}
                  ${plan.details ? `<div class="plan-details">${plan.details}</div>` : ''}
                  ${plan.financial_impact ? `<div class="plan-financial-impact" style="font-size: 0.9em; margin-top:10px; font-style: italic;"><strong>Finansal Etki:</strong> ${plan.financial_impact}</div>` : ''}
                  ${updatesHTML}`;
              plansList.appendChild(planCard);
          });
      } else {
          console.log(`Investment plans file for ${symbol} is empty. Hiding section.`);
          plansContainer.innerHTML = ''; plansContainer.style.display = 'none';
      }
  } catch (error) {
      console.error(`Error loading investment plans for ${symbol}:`, error);
      plansContainer.innerHTML = `<div style="color: var(--red); padding: 15px;">Yatırım planları yüklenirken hata oluştu.</div>`;
      plansContainer.style.display = '';
  }
}

// --- Displays message when no news is found ---
function displayNoNewsMessage(symbol) {
  const timeline = document.querySelector('.timeline');
  const newsDetail = document.querySelector('.news-detail');
  const message = `<div style="text-align: center; padding: 40px 20px; color: var(--text-light);"><div style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">Bildirim Bulunamadı</div><p style="color: var(--text-lighter);">${symbol} için KAP bildirimi bulunamadı veya veriler yüklenirken bir sorun oluştu.</p></div>`;

  if (timeline) { timeline.innerHTML = message; }
  else { console.warn("Timeline element not found for no-news message."); }

  if (newsDetail) { newsDetail.innerHTML = `<div style="text-align: center; padding: 20px; color: var(--text-light);"><div style="font-size: 16px; font-weight: 600; margin-bottom: 10px;">Bildirim Detayı Yok</div><p style="color: var(--text-lighter);">Gösterilecek bildirim detayı bulunmamaktadır.</p></div>`; }
  else { console.warn("News detail element not found for no-news message."); }
}

// --- Homepage function: Load latest news preview ---
function loadLatestNews() {
    const newsContainer = document.querySelector('.news-feed');
    if (!newsContainer || typeof stocksData === 'undefined') return;
    let allNews = [];
    
    // Set today's date for filtering
    const todayDate = "8 Nisan 2025"; // For development purposes
    
    for (const symbol in stocksData) {
        const stock = stocksData[symbol];
        if (stock.news && Array.isArray(stock.news)) {
            stock.news.forEach(dayNews => {
                // Only include news from today
                if (dayNews.date === todayDate) {
                    if (dayNews.items && Array.isArray(dayNews.items)) {
                        dayNews.items.forEach(item => {
                            if (item.title && item.content) {
                                allNews.push({
                                    sortable_date: dayNews.sortable_date || null, 
                                    date: dayNews.date || "Tarih Yok", 
                                    time: item.time || "Saat Yok", 
                                    title: item.title,
                                    desc: (typeof item.content === 'string' ? item.content.replace(/<\/?p>/g, '').substring(0, 150) : 'İçerik yok') + '...',
                                    symbol: stock.symbol
                                });
                            }
                        });
                    }
                }
            });
        }
    }
    
    // Sort news by time
    allNews.sort((a, b) => {
        return (b.time || '00:00').localeCompare(a.time || '00:00');
    });
    
    newsContainer.innerHTML = `<h2 class="section-title">Today's KAP News<span class="update-schedule">Günlük Güncellenir</span></h2>`;
    if (allNews.length > 0) {
        allNews.forEach(news => {
            const newsCard = document.createElement('div'); 
            newsCard.className = 'news-card';
            newsCard.innerHTML = `<div class="news-content"><div class="news-meta"><span class="news-time">${news.date || ''} - ${news.time || ''}</span><span class="news-source">KAP</span></div><h3 class="news-title">${news.title || 'Başlık Yok'}</h3><p class="news-desc">${news.desc || ''}</p><div class="related-tickers"><a href="stocks/${news.symbol.toLowerCase()}.html" class="ticker-link"><div class="ticker">${news.symbol}</div></a></div></div>`;
            newsContainer.appendChild(newsCard);
        });
    } else { 
        newsContainer.innerHTML += `<p style="text-align: center; padding: 20px;">Bugün için KAP bildirimi bulunamadı.</p>`; 
    }
}

// --- Homepage function: Load market summary ---
function loadMarketSummary() {
    const marketList = document.querySelector('.market-list'); 
    if (!marketList) return;
    
    marketList.innerHTML = `
        <li class="market-item"><span class="market-name">BIST 100</span><span class="market-value">10,245.67</span></li>
        <li class="market-item"><span class="market-name">BIST 30</span><span class="market-value">12,876.45</span></li>
        <li class="market-item"><span class="market-name">BIST TUM</span><span class="market-value">9,854.32</span></li>
        <li class="market-item"><span class="market-name">TCMB Faizi</span><span class="market-value">25.00%</span></li>
        <li class="market-item"><span class="market-name">Dolar/TL</span><span class="market-value">32.45</span></li>
        <li class="market-item"><span class="market-name">Euro/TL</span><span class="market-value">35.20</span></li>
        <li class="market-item"><span class="market-name">Altın (ONS)</span><span class="market-value">$2350.50</span></li>
        <li class="market-item"><span class="market-name">BRENT Petrol</span><span class="market-value">$85.70</span></li>
    `;
}

// --- Homepage function: Load popular stocks links ---
function loadPopularStocks() {
    const stocksContainer = document.querySelector('.stock-list-simple'); 
    if (!stocksContainer || typeof stocksData === 'undefined') return;
    
    // BIST30 symbols (use available ones for now)
    const bist30Symbols = [
        "THYAO", "ASELS", "EREGL", "SISE", "GARAN", "KCHOL", "EKGYO", 
        "AKBNK", "FROTO", "KOZAL", "TAVHL", "ISCTR", "ENKAI", "MGROS",
        "SAHOL", "YKBNK", "ULKER", "TCELL", "AEFES", "CIMSA"
    ];
    
    stocksContainer.innerHTML = '';
    bist30Symbols.forEach(symbol => {
        if (stocksData[symbol]) { 
            const link = document.createElement('a'); 
            link.href = `stocks/${symbol.toLowerCase()}.html`; 
            link.className = 'stock-link'; 
            link.textContent = symbol; 
            stocksContainer.appendChild(link); 
        }
    });
}


// --- Utility function to parse Turkish dates ---
// Improved version to handle potential errors
function parseTurkishDate(dateString) {
  if (!dateString || typeof dateString !== 'string') return null;
  const parts = dateString.split(' ');
  if (parts.length !== 3) return null; // Expect "Day Month Year"
  const day = parseInt(parts[0], 10);
  const monthIndex = getMonthNumber(parts[1]); // Uses the existing function
  const year = parseInt(parts[2], 10);
  if (isNaN(day) || monthIndex === undefined || isNaN(year)) {
      return null; // Invalid date components
  }
  // Check for reasonable date values
  if (day < 1 || day > 31 || year < 1900 || year > 2100) {
       return null;
  }
  try {
      // Construct Date object - Month is 0-indexed
      return new Date(year, monthIndex, day);
  } catch (e) {
      console.error("Error constructing date:", dateString, e);
      return null;
  }

}


// --- Utility function to get month number from Turkish name ---
function getMonthNumber(monthName) {
  if (!monthName || typeof monthName !== 'string') return undefined;
  const cleanedMonth = monthName.trim().toLowerCase();
  // Explicitly handle Turkish dotted/dotless i issues if necessary, though lowercase often suffices
  const months = {
      'ocak': 0, 'şubat': 1, 'mart': 2, 'nisan': 3,
      'mayıs': 4, 'haziran': 5, 'temmuz': 6, 'ağustos': 7,
      'eylül': 8, 'ekim': 9, 'kasım': 10, 'aralık': 11
  };
   // Handle common variations or potential issues if needed
   if (cleanedMonth === 'subat') return 1; // Example: Handle missing ş
   if (cleanedMonth === 'agustos') return 7; // Example: Handle missing ğ
   if (cleanedMonth === 'eylul') return 8; // Example: Handle missing ü

  return months[cleanedMonth]; // Returns undefined if not found
}

// Add this to your main.js file (at the end)
document.addEventListener('DOMContentLoaded', function() {
    const searchInput = document.querySelector('.search-bar input');
    
    if (searchInput) {
        // Add event listener for search functionality
        searchInput.addEventListener('input', function(e) {
            const searchTerm = e.target.value.toLowerCase().trim();
            
            // If on index page, filter stock list
            const stockLinks = document.querySelectorAll('.stock-link');
            if (stockLinks.length > 0) {
                stockLinks.forEach(link => {
                    const stockText = link.textContent.toLowerCase();
                    if (searchTerm === '' || stockText.includes(searchTerm)) {
                        link.style.display = '';
                    } else {
                        link.style.display = 'none';
                    }
                });
            }
            
            // If on index page, filter news cards
            const newsCards = document.querySelectorAll('.news-card');
            if (newsCards.length > 0) {
                newsCards.forEach(card => {
                    const title = card.querySelector('.news-title').textContent.toLowerCase();
                    const ticker = card.querySelector('.ticker')?.textContent.toLowerCase() || '';
                    
                    if (searchTerm === '' || title.includes(searchTerm) || ticker.includes(searchTerm)) {
                        card.style.display = '';
                    } else {
                        card.style.display = 'none';
                    }
                });
            }
        });
    }
});