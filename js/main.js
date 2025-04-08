// js/main.js
document.addEventListener('DOMContentLoaded', function() {
    // Load stock data for index page
    if (document.querySelector('.news-feed')) {
      loadLatestNews();
      loadMarketSummary();
    }
  
    // Load stock specific data for stock pages
    const stockHeader = document.querySelector('.stock-header');
    if (stockHeader) {
      const symbol = document.querySelector('.stock-symbol').textContent;
      loadStockData(symbol);
    }
  });
  
  function loadLatestNews() {
    // Get most recent news from all stocks for the homepage
    const newsContainer = document.querySelector('.news-feed');
    if (!newsContainer) return;
    
    let allNews = [];
    
    // Collect news from all stocks
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
  
  function loadStockData(symbol) {
    // Load data for specific stock page
    const stock = stocksData[symbol];
    if (!stock) return;
    
    // Update stock header information
    document.querySelector('.stock-name').textContent = stock.name;
    document.querySelector('.stock-sector').textContent = stock.sector;
    document.querySelector('.stock-description').textContent = stock.description;
    document.querySelector('.current-price').textContent = stock.price;
    
    const priceChange = document.querySelector('.price-change');
    priceChange.innerHTML = `<span>${stock.change}</span> <span>(${stock.changePercent})</span>`;
    priceChange.className = stock.isPositive ? 'price-change price-up' : 'price-change price-down';
    
    document.querySelector('.update-time').textContent = stock.lastUpdate;
    
    // Load news timeline
    loadNewsTimeline(stock);
    
    // Set active news in detail view
    const activeNews = findActiveNews(stock);
    if (activeNews) {
      updateNewsDetail(activeNews);
    }
    
    // Add click handlers to news items
    document.querySelectorAll('.news-item').forEach(item => {
      item.addEventListener('click', function() {
        // Remove active class from all items
        document.querySelectorAll('.news-item').forEach(i => i.classList.remove('active'));
        
        // Add active class to clicked item
        this.classList.add('active');
        
        // Find the news data
        const date = this.closest('.news-items').previousElementSibling.querySelector('.day-date').textContent;
        const time = this.querySelector('.news-time').textContent;
        const title = this.querySelector('.news-title-timeline').textContent;
        
        // Find matching news data
        const newsData = findNewsItem(stock, date, time, title);
        if (newsData) {
          updateNewsDetail(newsData);
        }
      });
    });
  }
  
  function loadNewsTimeline(stock) {
    const timeline = document.querySelector('.timeline');
    if (!timeline || !stock.news) return;
    
    // Clear existing content
    timeline.innerHTML = '';
    
    // Add news by day
    stock.news.forEach(day => {
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
        noNews.textContent = `Bu tarihte ${stock.symbol} için KAP bildirimi bulunmuyor.`;
        timeline.appendChild(noNews);
      }
    });
  }
  
  function updateNewsDetail(newsData) {
    const newsDetail = document.querySelector('.news-detail');
    if (!newsDetail) return;
    
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
      </div>
    `;
  }
  
  function findActiveNews(stock) {
    if (!stock.news) return null;
    
    for (const day of stock.news) {
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
    if (stock.news.length > 0 && stock.news[0].items.length > 0) {
      return {
        dayDate: stock.news[0].date,
        ...stock.news[0].items[0]
      };
    }
    
    return null;
  }
  
  function findNewsItem(stock, date, time, title) {
    if (!stock.news) return null;
    
    // Extract just the date part (remove "- Bugün" if present)
    const datePart = date.split(' - ')[0];
    
    for (const day of stock.news) {
      if (day.date === datePart) {
        for (const item of day.items) {
          if (item.time === time && item.title === title) {
            return {
              dayDate: day.date,
              ...item
            };
          }
        }
      }
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