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
    
    // Sort by date (newest first) - very basic implementation
    allNews.sort((a, b) => {
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
        
        loadNewsTimeline(symbol, newsData); // Pass real data
        
        // Set active news in detail view
        const activeNews = findActiveNews(newsData);
        if (activeNews) {
          updateNewsDetail(activeNews, symbol);
        } else {
          console.warn("No active news found in data");
        }
      } else {
        // Fall back to dummy data
        console.warn(`News data for ${symbol} not found (status: ${response.status}), using dummy data.`);
        loadNewsTimeline(symbol, stock.news);
        
        // Set active news in detail view
        const activeNews = findActiveNews(stock.news);
        if (activeNews) {
          updateNewsDetail(activeNews, symbol);
        }
      }
    } catch (error) {
      console.error("Error loading news data:", error);
      // Fall back to dummy data
      loadNewsTimeline(symbol, stock.news);
      
      // Set active news in detail view
      const activeNews = findActiveNews(stock.news);
      if (activeNews) {
        updateNewsDetail(activeNews, symbol);
      }
    }
    
    // Add click handlers to news items after timeline is loaded
    setTimeout(() => {
      document.querySelectorAll('.news-item').forEach(item => {
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
  
  function loadNewsTimeline(symbol, newsData) {
    console.log("Loading news timeline for", symbol);
    const timeline = document.querySelector('.timeline');
    if (!timeline || !newsData) {
      console.error("Timeline element not found or no news data:", timeline, newsData);
      return;
    }
    
    // Clear existing content
    timeline.innerHTML = '';
    
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