// js/main.js - BIST30 Hisseleri Sorunu İçin Düzeltilmiş Versiyon

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

// --- Utility function to get today's date in format-MM-DD Format ---
function getTodaySortableDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are 0-indexed
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}


document.addEventListener('DOMContentLoaded', function() {
  console.log("Document loaded, initializing...");

  // Anasayfa için fonksiyonları yükle
  if (document.querySelector('.news-feed')) {
      loadLatestNews();
      loadPopularStocks();
  }

  // Hisse senedi sayfaları için fonksiyonları yükle
  const stockHeader = document.querySelector('.stock-header');
  if (stockHeader) {
      const symbolElement = document.querySelector('.stock-symbol');
      if (symbolElement) {
          const symbol = symbolElement.textContent;
          console.log("Stock page detected for symbol:", symbol);
          loadStockPageData(symbol);
      } else {
          console.error("Stock symbol element not found on stock page!");
      }
  }
});

// --- Hisse senedi sayfası için verileri yükleyen ana fonksiyon ---
async function loadStockPageData(symbol) {
    console.log("Loading dynamic data for stock page:", symbol);

    const timelineContainer = document.querySelector('.timeline');
    const investmentPlansContainer = document.querySelector('.investment-plans'); 

    if (timelineContainer) timelineContainer.innerHTML = '<div id="loading-indicator" style="padding: 20px; text-align: center;">Bildirimler yükleniyor...</div>';
    if (investmentPlansContainer) investmentPlansContainer.innerHTML = '<div id="plans-loading" style="padding: 15px; text-align: center; color: var(--text-lighter);">Yatırım planları yükleniyor...</div>';

    // Önce yan panel verilerini (yatırım, analist) yükle
    await loadInvestmentPlans(symbol);
    await loadAnalystRatings(symbol);

    // Veriler yüklendikten sonra sekmeleri ayarla
    setupFilterTabs(symbol);

    // Haber akışını yükle
    try {
        console.log("Attempting to load news data from JSON file");
        const newsFile = `../data/${symbol.toLowerCase()}_news.json`;
        console.log("Fetching:", newsFile);
        const response = await fetch(newsFile);
        console.log("Fetch response status:", response.status);

        if (response.ok) {
            const newsData = await response.json();
            console.log(`News data for ${symbol} loaded successfully: ${newsData.length} days`);

            if (timelineContainer) {
                if (newsData && Array.isArray(newsData) && newsData.length > 0) {
                    loadNewsTimeline(symbol, newsData);
                } else {
                    console.warn("News data array is empty or invalid for", symbol);
                    displayNoNewsMessage(symbol, timelineContainer);
                }
            } else {
                 console.error("Timeline container element not found!");
            }
        } else {
            console.warn(`News data file for ${symbol} not found or fetch error (status: ${response.status})`);
            displayNoNewsMessage(symbol, timelineContainer);
        }
    } catch (error) {
        console.error(`Error loading or parsing news data for ${symbol}:`, error);
        displayNoNewsMessage(symbol, timelineContainer);
    }
}


// --- Haber akışını oluşturan fonksiyon ---
function loadNewsTimeline(symbol, newsData) {
    const timeline = document.querySelector('.timeline');
    if (!timeline) { console.error("Timeline element not found!"); return; }
    if (!Array.isArray(newsData)) { console.error("Invalid news data format.", newsData); timeline.innerHTML = `<div class="no-news-day">Haber verisi hatalı formatta.</div>`; return; }
    if (newsData.length === 0) { console.warn("No news days for", symbol); timeline.innerHTML = `<div class="no-news-day">${symbol} için kayıtlı şirket bildirimi bulunamadı.</div>`; return; }

    timeline.innerHTML = '';
    const todaySortable = getTodaySortableDate();

    newsData.forEach((day) => {
        if (!day || typeof day.date !== 'string' || !Array.isArray(day.items)) return;
        const isToday = day.sortable_date === todaySortable;
        const dayMarker = document.createElement('div');
        dayMarker.className = 'day-marker';
        const dotClass = isToday ? 'day-dot today-dot' : 'day-dot past-dot';
        const dateClass = isToday ? 'day-date today-date' : 'day-date';
        const dateText = isToday ? `${day.date} - Bugün` : day.date;
        dayMarker.innerHTML = `<div class="${dotClass}"></div><div class="${dateClass}">${dateText}</div>`;
        timeline.appendChild(dayMarker);

        if (day.items.length > 0) {
            const newsItemsContainer = document.createElement('div');
            newsItemsContainer.className = 'news-items';
            day.items.forEach(item => {
                if (!item || typeof item.title !== 'string') return;
                const newsItem = document.createElement('div');
                newsItem.className = 'news-item';
                newsItem.setAttribute('data-category-value', item.category || 'Diğer');
                let linkHTML = (item.url && item.url.startsWith('http')) ? `<div class="file-link" style="margin-top: 15px; text-align: left;"><a href="${item.url}" target="_blank" class="file-button" style="padding: 8px 16px; font-size: 13px;">Kaynağa Git</a></div>` : '';
                newsItem.innerHTML = `
                    <div class="news-item-header" style="cursor: pointer;">
                        <div class="news-time">${item.time || ''}</div>
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
        }
    });

    setupNewsItemExpansion();
    filterNewsByCategory('all');
}

// --- Haber başlığına tıklayınca genişlemesini sağlayan fonksiyon ---
function toggleExpansion(item, forceExpand = false) {
    const content = item.querySelector('.news-content-expandable');
    if (!content) return;
    const isExpanded = item.classList.contains('expanded');

    if (forceExpand && !isExpanded) {
        item.classList.add('expanded');
        content.style.display = 'block';
    } else if (!forceExpand && isExpanded) {
        item.classList.remove('expanded');
        content.style.display = 'none';
    } else if (!forceExpand && !isExpanded) {
        document.querySelectorAll('.news-item.expanded').forEach(expandedItem => {
            if (expandedItem !== item) toggleExpansion(expandedItem, false);
        });
        item.classList.add('expanded');
        content.style.display = 'block';
    }
}

// --- Haberlere tıklama olayını yöneten fonksiyon ---
function setupNewsItemExpansion() {
    const timeline = document.querySelector('.timeline');
    if (!timeline) return;
    timeline.addEventListener('click', function(e) {
        const header = e.target.closest('.news-item-header');
        if (header) {
            const newsItem = header.closest('.news-item');
            if (newsItem) toggleExpansion(newsItem);
        }
    });
}

// --- Yatırım planlarını yükleyen fonksiyon ---
async function loadInvestmentPlans(symbol) {
  console.log("Loading investment plans for:", symbol);
  const plansContainer = document.querySelector('.investment-plans');
  if (!plansContainer) { return; }
  plansContainer.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-lighter);">Yatırım planları yükleniyor...</div>`;
  plansContainer.style.display = 'none';

  try {
      const response = await fetch(`../data/${symbol.toLowerCase()}_investment_plans.json`);
      if (!response.ok) {
          console.log(`No investment plans file for ${symbol}.`);
          plansContainer.innerHTML = '';
          return;
      }
      const plans = await response.json();
      if (plans && plans.length > 0) {
          plansContainer.style.display = '';
          plansContainer.innerHTML = `<h2 class="section-title">Yatırım Planları & Projeler</h2><div class="plans-list"></div>`;
          const plansList = plansContainer.querySelector('.plans-list');
          plans.forEach(plan => {
              const planCard = document.createElement('div');
              planCard.className = 'plan-card widget-card';
              // Plan kart içeriğini oluşturma... (Bu kısım aynı kalabilir)
              plansList.appendChild(planCard);
          });
      } else {
          plansContainer.innerHTML = '';
      }
  } catch (error) {
      console.error(`Error loading investment plans for ${symbol}:`, error);
      plansContainer.innerHTML = '';
  }
}

// --- Bildirim bulunamadığında mesaj gösteren fonksiyon ---
function displayNoNewsMessage(symbol, timelineContainer) {
    const message = `<div style="text-align: center; padding: 40px 20px; color: var(--text-light);"><div style="font-size: 18px; font-weight: 600; margin-bottom: 12px;">Bildirim Bulunamadı</div><p style="color: var(--text-lighter);">${symbol} için şirket bildirimi bulunamadı.</p></div>`;
    if (timelineContainer) timelineContainer.innerHTML = message;
}

// --- Anasayfa için son haberleri yükleyen fonksiyon ---
function loadLatestNews() {
    const newsContainer = document.querySelector('.news-feed');
    if (!newsContainer || typeof stocksData === 'undefined') {
        if(newsContainer) newsContainer.innerHTML = '<p>Haberler yüklenemedi.</p>';
        return;
    }

    let allNews = [];
    const todayDateStr = getTodayTurkishDate();
    console.log("Loading news for index page for date:", todayDateStr);

    for (const symbol in stocksData) {
        const stock = stocksData[symbol];
        if (stock.news && Array.isArray(stock.news)) {
            stock.news.forEach(dayNews => {
                if (dayNews.date === todayDateStr) {
                    if (dayNews.items && Array.isArray(dayNews.items)) {
                        dayNews.items.forEach(item => {
                            if (item.title && item.content) {
                                let desc = item.content.replace(/<[^>]*>/g, '').substring(0, 150).trim() + (item.content.length > 150 ? '...' : '');
                                allNews.push({
                                    date: dayNews.date || "Tarih Yok",
                                    time: item.time || "Saat Yok",
                                    title: item.title,
                                    desc: desc,
                                    symbol: stock.symbol
                                });
                            }
                        });
                    }
                }
            });
        }
    }

    allNews.sort((a, b) => (b.time || '00:00').localeCompare(a.time || '00:00'));

    newsContainer.innerHTML = `<h2 class="section-title">Günün Şirket Haberleri<span class="update-schedule">Günlük Güncellenir</span></h2>`;
    if (allNews.length > 0) {
        allNews.forEach(news => {
            const newsCard = document.createElement('div');
            newsCard.className = 'news-card';
            const stockPageUrl = `stocks/${news.symbol.toLowerCase()}.html`;
            newsCard.innerHTML = `
                <div class="news-content">
                    <div class="news-meta">
                        <span class="news-time">${news.date} - ${news.time}</span>
                        <span class="news-source">BORSA</span>
                    </div>
                    <h3 class="news-title">${news.title}</h3>
                    <p class="news-desc">${news.desc}</p>
                    <div class="related-tickers">
                        <a href="${stockPageUrl}" class="ticker-link"><div class="ticker">${news.symbol}</div></a>
                    </div>
                </div>`;
            newsContainer.appendChild(newsCard);
        });
    } else {
        newsContainer.innerHTML += `<p style="text-align: center; padding: 20px; color: var(--text-lighter);">Bugün için şirket bildirimi bulunamadı.</p>`;
    }
}

// --- Anasayfa için popüler hisseleri yükleyen fonksiyon ---
function loadPopularStocks() {
    const stocksContainer = document.querySelector('.stock-list-simple');
    if (!stocksContainer || typeof stocksData === 'undefined') {
        return;
    }

    const popularSymbols = [ "THYAO", "ASELS", "EREGL", "SISE", "GARAN", "KCHOL", "EKGYO", "AKBNK", "FROTO", "KOZAL", "TAVHL", "ISCTR", "ENKAI", "MGROS", "SAHOL", "YKBNK", "ULKER", "TCELL", "AEFES", "CIMSA", "TUPRS", "BIMAS", "PGSUS", "TOASO", "TTKOM", "ASTOR" ];

    stocksContainer.innerHTML = '';
    popularSymbols.forEach(symbol => {
        if (stocksData[symbol]) {
            const link = document.createElement('a');
            link.href = `stocks/${symbol.toLowerCase()}.html`;
            link.className = 'stock-link';
            link.textContent = symbol;
            stocksContainer.appendChild(link);
        }
    });
     const scheduleSpan = document.querySelector('.sidebar .widget-card:nth-child(2) .section-title .update-schedule');
     if(scheduleSpan) scheduleSpan.textContent = `${Object.keys(stocksData).length} Hisse`;
}

// --- Hisse senedi sayfasındaki sekmeleri (filtreleri) ayarlayan fonksiyon ---
function setupFilterTabs(symbol) {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const newsTimelineContainer = document.querySelector('.news-timeline');
    const investmentPlansContainer = document.querySelector('.investment-plans');
    const analystRatingsContainer = document.querySelector('.analyst-ratings');

    if (!filterTabs.length || !newsTimelineContainer) return;

    const hasInvestmentPlans = investmentPlansContainer?.querySelector('.plans-list');
    const hasAnalystRatings = analystRatingsContainer?.querySelector('.analyst-ratings-list');

    filterTabs.forEach(tab => {
        const category = tab.getAttribute('data-category');
        if (category === 'investment' && !hasInvestmentPlans) tab.style.display = 'none';
        if (category === 'analyst' && !hasAnalystRatings) tab.style.display = 'none';

        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const currentCategory = this.getAttribute('data-category');

            investmentPlansContainer.classList.remove('visible');
            analystRatingsContainer.classList.remove('visible');
            newsTimelineContainer.classList.remove('compressed');

            if (currentCategory === 'investment' && hasInvestmentPlans) {
                investmentPlansContainer.classList.add('visible');
                newsTimelineContainer.classList.add('compressed');
            } else if (currentCategory === 'analyst' && hasAnalystRatings) {
                analystRatingsContainer.classList.add('visible');
                newsTimelineContainer.classList.add('compressed');
            }
            filterNewsByCategory(currentCategory);
        });
    });

    if (!document.querySelector('.filter-tab.active')) {
        const allTab = document.querySelector('.filter-tab[data-category="all"]');
        if (allTab) allTab.click();
    }
}

// --- Haberleri kategoriye göre filtreleyen fonksiyon ---
function filterNewsByCategory(category) {
    // ... Bu fonksiyon aynı kalabilir ...
}

// --- Analist tavsiyelerini yükleyen fonksiyon ---
// --- Analist tavsiyelerini yükleyen fonksiyon (Özet Hesaplama Eklendi) ---
async function loadAnalystRatings(symbol) {
  console.log("Loading analyst ratings for:", symbol);
  const ratingsContainer = document.querySelector('.analyst-ratings');
  if (!ratingsContainer) {
    console.warn("Analyst ratings container not found for", symbol);
    return;
  }
  
  ratingsContainer.innerHTML = `<div style="padding: 15px; text-align: center; color: var(--text-lighter);">Analist tavsiyeleri yükleniyor...</div>`;
  ratingsContainer.style.display = 'none';

  try {
    const response = await fetch('../data/analyst_ratings.json');
    if (!response.ok) {
      console.log(`Analist tavsiye dosyası bulunamadı. Bölüm gizli kalacak.`);
      ratingsContainer.innerHTML = '';
      return;
    }
    
    const allRatings = await response.json();
    const stockRatings = allRatings.results.filter(r => r.code === symbol);

    // Tüm tavsiyeleri tarihe göre yeniden eskiye doğru sıralıyoruz
    stockRatings.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

    console.log(`Found ${stockRatings.length} ratings for ${symbol}`);
    
    if (stockRatings && stockRatings.length > 0) {
      ratingsContainer.style.display = '';
      ratingsContainer.innerHTML = `<h2 class="section-title">Analist Tavsiyeleri</h2><div class="analyst-ratings-list"></div>`;
      const ratingsList = ratingsContainer.querySelector('.analyst-ratings-list');
      
      // --- YENİ BÖLÜM: Son 6 Ayın Özetini Hesaplama ---
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);
      
      const recentRatings = stockRatings.filter(r => new Date(r.published_at) >= sixMonthsAgo);
      
      if (recentRatings.length > 0) {
        // Al/Sat sayılarını hesapla
        const alCount = recentRatings.filter(r => r.type === 'al').length;
        const satCount = recentRatings.filter(r => r.type === 'sat').length;
        
        // Ortalama hedef fiyatı hesapla
        const totalTargetPrice = recentRatings.reduce((sum, r) => sum + r.price_target, 0);
        const averagePrice = totalTargetPrice / recentRatings.length;
        
        // Özet kartı için HTML oluştur
        const summaryCard = document.createElement('div');
        summaryCard.className = 'ratings-summary-card';
        summaryCard.innerHTML = `
          <h4>Son 6 Ayın Özeti</h4>
          <div class="summary-stats">
              <div class="stat-item">
                  <span class="stat-value al-color">${alCount}</span>
                  <span class="stat-label">"Al" Tavsiyesi</span>
              </div>
              <div class="stat-item">
                  <span class="stat-value">${averagePrice.toFixed(2)} TL</span>
                  <span class="stat-label">Hedef Fiyat Ort.</span>
              </div>
              <div class="stat-item">
                  <span class="stat-value sat-color">${satCount}</span>
                  <span class="stat-label">"Sat" Tavsiyesi</span>
              </div>
          </div>
        `;
        // Özet kartını listenin en başına ekle
        ratingsList.appendChild(summaryCard);
      }
      // --- YENİ BÖLÜM SONU ---
      
      const recommendationMap = { 'al': 'Al', 'tut': 'Tut', 'sat': 'Sat', 'endeks_ustu':'Endeks Üstü','endekse_paralel':'Endekse Paralel','endeks_alti':'Endeks Altı' ,'endekse paralel getiri': 'Endekse Paralel', 'endeksin üzerinde getiri': 'Endeksin Üzerinde', 'endeksin altında getiri': 'Endeksin Altında' };

      // Tüm tavsiyeleri listelemeye devam et
      stockRatings.forEach(rating => {
        const ratingCard = document.createElement('div');
        ratingCard.className = 'rating-card';
        const publishedDate = new Date(rating.published_at).toLocaleDateString('tr-TR', { day: '2-digit', month: '2-digit', year: 'numeric' });
        const type = rating.type || '';
        const recommendationText = recommendationMap[type.toLowerCase()] || type;
        const recommendationClass = `rating-type-${type.toLowerCase().substring(0,3)}`;
        const logoUrl = rating.brokerage.logo || '';
        const extension = logoUrl.split('.').pop() || 'png';
        const localLogoPath = `../data/analist_tavsiye_logo/${rating.brokerage.code}.${extension}`;

        ratingCard.innerHTML = `
          <div class="rating-card-header">
            <img src="${localLogoPath}" alt="${rating.brokerage.title}" class="rating-brokerage-logo">
            <span class="rating-brokerage-title">${rating.brokerage.title}</span>
          </div>
          <div class="rating-details">
            <div class="rating-target-price">
              <span class="label">Hedef Fiyat</span>
              ${rating.price_target.toFixed(2)} TL
            </div>
            <div class="rating-type ${recommendationClass}">
              ${recommendationText}
            </div>
          </div>
          <div class="rating-date">Yayınlanma: ${publishedDate}</div>
        `;
        ratingsList.appendChild(ratingCard);
      });
    } else {
      console.log(`No ratings found for ${symbol}. Section will remain hidden.`);
      ratingsContainer.innerHTML = '';
    }
  } catch (error) {
    console.error(`Error loading analyst ratings for ${symbol}:`, error);
    ratingsContainer.innerHTML = '';
    ratingsContainer.style.display = 'none';
  }
}