// js/main.js

document.addEventListener('DOMContentLoaded', function() {
  console.log("Document loaded, initializing...");

  // Load stock data for index page
  if (document.querySelector('.news-feed')) {
    loadLatestNews();
    loadMarketSummary();
  }

  // Load stock specific data for stock pages
  const stockHeader = document.querySelector('.stock-header');
  if (stockHeader) {
    const symbol = document.querySelector('.stock-symbol').textContent;
    console.log("Loading data for stock:", symbol);
    loadStockData(symbol);
  }
});

function loadLatestNews() {
  // Get most recent news from all stocks for the homepage
  const newsContainer = document.querySelector('.news-feed');
  if (!newsContainer) return;
  
  // Start with simulated data from stocksData
  let allNews = [];
  
  // Collect news from all stocks in stocksData
  for (const symbol in stocksData) {
    const stock = stocksData[symbol];
    
    if (stock.news && stock.news.length > 0) {
      stock.news.forEach(dayNews => {
        dayNews.items.forEach(item => {
          allNews.push({
            date: dayNews.date,
            time: item.time,
            title: item.title,
            desc: item.content.replace(/<\/?p>/g, '').substring(0, 100) + '...',
            symbol: stock.symbol
          });
        });
      });
    }
  }
  
  // Sort by date (newest first) using sortable_date if available
  allNews.sort((a, b) => {
    // First try using the sortable_date field
    if (a.sortable_date && b.sortable_date) {
      return b.sortable_date.localeCompare(a.sortable_date);
    }
    
    // Fall back to parsing the display date
    const dateA = new Date(a.date.split(' ')[2], getMonthNumber(a.date.split(' ')[1]), a.date.split(' ')[0]);
    const dateB = new Date(b.date.split(' ')[2], getMonthNumber(b.date.split(' ')[1]), b.date.split(' ')[0]);
    return dateB - dateA;
  });
  
  // Take only the first 5 news
  allNews = allNews.slice(0, 5);
  
  // Clear existing placeholder content
  newsContainer.innerHTML = `
    <h2 class="section-title">
      Son KAP Bildirimleri
      <span class="update-schedule">Günlük Güncellenir</span>
    </h2>
  `;
  
  // Add news to the container
  allNews.forEach(news => {
    const newsCard = document.createElement('div');
    newsCard.className = 'news-card';
    newsCard.innerHTML = `
      <div class="news-content">
        <div class="news-meta">
          <span class="news-time">${news.date} - ${news.time}</span>
          <span class="news-source">KAP</span>
        </div>
        <h3 class="news-title">${news.title}</h3>
        <p class="news-desc">${news.desc}</p>
        <div class="related-tickers">
          <a href="stocks/${news.symbol.toLowerCase()}.html" class="ticker-link">
            <div class="ticker">${news.symbol}</div>
          </a>
        </div>
      </div>
    `;
    
    newsContainer.appendChild(newsCard);
  });
}

function loadMarketSummary() {
  // Update market summary in sidebar
  const marketList = document.querySelector('.market-list');
  if (!marketList) return;
  
  // Sample data - in a real app, you would fetch this from an API
  marketList.innerHTML = `
    <li class="market-item">
      <span class="market-name">BIST 100</span>
      <span class="market-value">10,245.67</span>
    </li>
    <li class="market-item">
      <span class="market-name">Dolar/TL</span>
      <span class="market-value">32.45</span>
    </li>
    <li class="market-item">
      <span class="market-name">Euro/TL</span>
      <span class="market-value">35.20</span>
    </li>
  `;
}

async function loadStockData(symbol) {
  console.log("Loading stock data for:", symbol);
  
  // Clear any previous loading indicator
  document.getElementById('loading-indicator')?.textContent = "Bildirimler yükleniyor...";
  document.getElementById('detail-loading')?.textContent = "Bildirim detayı yükleniyor...";
  
  // Load data for specific stock page
  const stock = stocksData[symbol];
  if (!stock) {
    console.error("Stock not found in stocksData:", symbol);
    return;
  }
  
  // Update stock header information
  document.querySelector('.stock-name').textContent = stock.name;
  document.querySelector('.stock-sector').textContent = stock.sector;
  document.querySelector('.stock-description').textContent = stock.description;
  document.querySelector('.current-price').textContent = stock.price;
  
  const priceChange = document.querySelector('.price-change');
  priceChange.innerHTML = `<span>${stock.change}</span> <span>(${stock.changePercent})</span>`;
  priceChange.className = stock.isPositive ? 'price-change price-up' : 'price-change price-down';
  
  document.querySelector('.update-time').textContent = stock.lastUpdate;
  
  // Load investment plans if present
  loadInvestmentPlans(symbol);
  
  // Try to load real news data from JSON file
  try {
    console.log("Attempting to load news data from JSON file");
    const newsFile = `../data/${symbol.toLowerCase()}_news.json`;
    console.log("Fetching:", newsFile);
    
    const response = await fetch(newsFile);
    console.log("Fetch response status:", response.status);
    
    if (response.ok) {
      const newsData = await response.json();
      console.log("News data loaded successfully:", newsData.length, "days of news");
      
      if (newsData && newsData.length > 0) {
        loadNewsTimeline(symbol, newsData); // Pass real data
        
        // Set active news in detail view
        const activeNews = findActiveNews(newsData);
        if (activeNews) {
          updateNewsDetail(activeNews, symbol);
        } else {
          console.warn("No active news found in data");
          // Display a placeholder message if no active news
          updateNewsDetail({
            dayDate: "Bilgi yok",
            time: "-",
            title: "Bildirim detayı bulunamadı",
            content: "<p>Lütfen sol taraftaki listeden bir bildirim seçiniz.</p>",
            file_name: null
          }, symbol);
        }
      } else {
        console.warn("News data is empty for", symbol);
        displayNoNewsMessage(symbol);
      }
    } else {
      // Fall back to dummy data or show error
      console.warn(`News data for ${symbol} not found (status: ${response.status})`);
      displayNoNewsMessage(symbol);
    }
  } catch (error) {
    console.error("Error loading news data:", error);
    displayNoNewsMessage(symbol);
  }
  
  // Add click handlers to news items after timeline is loaded
  setTimeout(() => {
    const newsItems = document.querySelectorAll('.news-item');
    console.log(`Found ${newsItems.length} news items to attach handlers to`);
    
    newsItems.forEach(item => {
      item.addEventListener('click', function() {
        console.log("News item clicked");
        
        // Remove active class from all items
        document.querySelectorAll('.news-item').forEach(i => i.classList.remove('active'));
        
        // Add active class to clicked item
        this.classList.add('active');
        
        // Find the news data
        const date = this.closest('.news-items').previousElementSibling.querySelector('.day-date').textContent;
        const time = this.querySelector('.news-time').textContent;
        const title = this.querySelector('.news-title-timeline').textContent;
        
        // Get the file name if available
        const fileName = this.getAttribute('data-file');
        
        // Use custom news data to update the detail view
        const customNewsData = {
          dayDate: date.split(' - ')[0], // Remove "- Bugün" if present
          time: time,
          title: title,
          content: this.getAttribute('data-content') || "<p>Detaylı bilgi mevcut değil.</p>",
          file_name: fileName
        };
        
        updateNewsDetail(customNewsData, symbol);
      });
    });
  }, 500);
}

function loadInvestmentPlans(symbol) {
  console.log("Loading investment plans for:", symbol);
  
  // Look for investment plans container
  const plansContainer = document.querySelector('.investment-plans');
  if (!plansContainer) {
    console.warn("Investment plans container not found");
    return;
  }
  
  // Add loading indicator
  plansContainer.innerHTML = `<div id="plans-loading">Yatırım planları yükleniyor...</div>`;
  
  // Attempt to load investment plans from JSON file
  const plansFile = `../data/${symbol.toLowerCase()}_investment_plans.json`;
  
  fetch(plansFile)
    .then(response => {
      if (!response.ok) {
        throw new Error(`No investment plans found (${response.status})`);
      }
      return response.json();
    })
    .then(plans => {
      console.log(`Loaded ${plans.length} investment plans for ${symbol}`);
      
      if (plans && plans.length > 0) {
        // Clear loading indicator
        plansContainer.innerHTML = `
          <h2 class="section-title">
            Yatırım Planları
            <span class="update-schedule">Son Güncellemeler</span>
          </h2>
          <div class="plans-list"></div>
        `;
        
        const plansList = plansContainer.querySelector('.plans-list');
        
        // Add each plan to the list
        plans.forEach(plan => {
          const planCard = document.createElement('div');
          planCard.className = 'plan-card widget-card';
          
          // Generate updates HTML if there are updates
          let updatesHTML = '';
          if (plan.updates && plan.updates.length > 0) {
            updatesHTML = `
              <div class="plan-updates">
                <h4>Güncellemeler</h4>
                <ul>
                  ${plan.updates.map(update => `
                    <li>
                      <div class="update-date">${update.date}</div>
                      <div class="update-summary">${update.summary}</div>
                    </li>
                  `).join('')}
                </ul>
              </div>
            `;
          }
          
          // Generate the full plan card
          planCard.innerHTML = `
            <h3 class="plan-title">${plan.title}</h3>
            <div class="plan-meta">
              <span class="plan-category">${plan.category || 'Genel'}</span>
              <span class="plan-date">Açıklanma: ${plan.date_announced}</span>
            </div>
            <div class="plan-description">${plan.description}</div>
            <div class="plan-details">${plan.details}</div>
            ${updatesHTML}
          `;
          
          plansList.appendChild(planCard);
        });
      } else {
        // No plans found
        plansContainer.innerHTML = '';
      }
    })
    .catch(error => {
      console.warn(`No investment plans found for ${symbol}:`, error);
      plansContainer.innerHTML = '';
    });
}

function displayNoNewsMessage(symbol) {
  // Display a message when no news is available
  const timeline = document.querySelector('.timeline');
  if (timeline) {
    timeline.innerHTML = `
      <div style="text-align: center; padding: 40px 20px;">
        <div style="font-size: 18px; font-weight: 600; color: var(--text-light); margin-bottom: 12px;">
          Bildirim Bulunamadı
        </div>
        <p style="color: var(--text-lighter);">
          ${symbol} için KAP bildirimi bulunamadı veya veriler yüklenirken bir sorun oluştu.
        </p>
      </div>
    `;
  }
  
  // Also update the detail view
  const newsDetail = document.querySelector('.news-detail');
  if (newsDetail) {
    newsDetail.innerHTML = `
      <div style="text-align: center; padding: 20px;">
        <div style="font-size: 16px; font-weight: 600; color: var(--text-light); margin-bottom: 10px;">
          Bildirim Detayı Yok
        </div>
        <p style="color: var(--text-lighter);">
          Gösterilecek bildirim detayı bulunmamaktadır.
        </p>
      </div>
    `;
  }
}

function loadNewsTimeline(symbol, newsData) {
  console.log("Loading news timeline for", symbol);
  const timeline = document.querySelector('.timeline');
  if (!timeline) {
    console.error("Timeline element not found:", timeline);
    return;
  }
  
  if (!newsData || !Array.isArray(newsData) || newsData.length === 0) {
    console.error("No valid news data:", newsData);
    timeline.innerHTML = `
      <div class="no-news-day" style="margin: 40px 20px; text-align: center;">
        <div style="font-weight: 700; font-size: 16px; margin-bottom: 10px;">Veri Bulunamadı</div>
        <p>${symbol} için KAP bildirimi bulunamadı.</p>
      </div>
    `;
    return;
  }
  
  // Remove any loading indicator
  const loadingIndicator = document.getElementById('loading-indicator');
  if (loadingIndicator) {
    loadingIndicator.remove();
  }
  
  // Clear existing content
  timeline.innerHTML = '';
  
  console.log("Processing news data:", JSON.stringify(newsData, null, 2));
  
  // Add news by day
  newsData.forEach((day, index) => {
    console.log(`Adding day to timeline: ${day.date}, items: ${day.items?.length || 0}`);
    
    const dayMarker = document.createElement('div');
    dayMarker.className = 'day-marker';
    
    const dotClass = day.isToday ? 'day-dot today-dot' : 'day-dot past-dot';
    const dateClass = day.isToday ? 'day-date today-date' : 'day-date';
    const dateText = day.isToday ? `${day.date} - Bugün` : day.date;
    
    dayMarker.innerHTML = `
      <div class="${dotClass}"></div>
      <div class="${dateClass}">${dateText}</div>
    `;
    
    timeline.appendChild(dayMarker);
    
    // Add news items or "no news" message
    if (day.items && day.items.length > 0) {
      const newsItems = document.createElement('div');
      newsItems.className = 'news-items';
      
      day.items.forEach(item => {
        console.log("Creating news item:", item.title);
        
        const newsItem = document.createElement('div');
        newsItem.className = item.active ? 'news-item active' : 'news-item';
        
        // Store content and file name as data attributes for later use
        newsItem.setAttribute('data-content', item.content || '');
        if (item.file_name) {
          newsItem.setAttribute('data-file', item.file_name);
        }
        
        newsItem.innerHTML = `
          <div class="news-time">${item.time}</div>
          <div class="news-title-timeline">${item.title}</div>
          <div class="news-category">${item.category}</div>
        `;
        
        newsItems.appendChild(newsItem);
      });
      
      timeline.appendChild(newsItems);
    } else {
      const noNews = document.createElement('div');
      noNews.className = 'no-news-day';
      noNews.textContent = `Bu tarihte ${symbol} için KAP bildirimi bulunmuyor.`;
      timeline.appendChild(noNews);
    }
  });
  
  if (newsData.length === 0) {
    console.warn("No news days found for", symbol);
    timeline.innerHTML = `
      <div class="no-news-day" style="margin: 20px; text-align: center;">
        ${symbol} için KAP bildirimi bulunamadı.
      </div>
    `;
  }
}

function updateNewsDetail(newsData, symbol) {
  console.log("Updating news detail with:", newsData);
  const newsDetail = document.querySelector('.news-detail');
  if (!newsDetail) {
    console.error("News detail element not found");
    return;
  }
  
  // Remove any loading indicator
  const detailLoading = document.getElementById('detail-loading');
  if (detailLoading) {
    detailLoading.remove();
  }
  
  let fileLink = '';
  if (newsData.file_name) {
    fileLink = `
      <div class="file-link">
        <a href="../files/${symbol}/${newsData.file_name}" target="_blank" class="file-button">
          KAP Bildirimini Görüntüle
        </a>
      </div>
    `;
  }
  
  newsDetail.innerHTML = `
    <div class="news-detail-header">
      <div class="news-detail-meta">
        <div class="news-detail-time">${newsData.dayDate} - ${newsData.time}</div>
        <div class="news-detail-source">KAP</div>
      </div>
      <h3 class="news-detail-title">${newsData.title}</h3>
    </div>
    <div class="news-detail-content">
      ${newsData.content}
      ${fileLink}
    </div>
  `;
}

function findActiveNews(newsData) {
  if (!newsData || newsData.length === 0) {
    console.warn("No news data provided to findActiveNews");
    return null;
  }
  
  for (const day of newsData) {
    if (!day.items) continue;
    
    for (const item of day.items) {
      if (item.active) {
        return {
          dayDate: day.date,
          ...item
        };
      }
    }
  }
  
  // If no active news found, return the first news item
  if (newsData[0] && newsData[0].items && newsData[0].items.length > 0) {
    return {
      dayDate: newsData[0].date,
      ...newsData[0].items[0]
    };
  }
  
  return null;
}

function getMonthNumber(monthName) {
  const months = {
    'Ocak': 0, 'Şubat': 1, 'Mart': 2, 'Nisan': 3,
    'Mayıs': 4, 'Haziran': 5, 'Temmuz': 6, 'Ağustos': 7,
    'Eylül': 8, 'Ekim': 9, 'Kasım': 10, 'Aralık': 11
  };
  return months[monthName] || 0;
}