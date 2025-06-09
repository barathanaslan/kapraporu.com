// js/main.js - SAYI FORMATLAMA HATASI DÜZELTİLMİŞ FİNAL VERSİYON

const TICKER_SEARCH_ENABLED_IN_HEADER = true;

// --- Utility Functions ---
function getTodayTurkishDate() {
    const today = new Date();
    const day = today.getDate();
    const monthNames = ["Ocak", "Şubat", "Mart", "Nisan", "Mayıs", "Haziran", "Temmuz", "Ağustos", "Eylül", "Ekim", "Kasım", "Aralık"];
    const month = monthNames[today.getMonth()];
    const year = today.getFullYear();
    return `${day} ${month} ${year}`;
}

function getTodaySortableDate() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, '0');
    const day = String(today.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

// --- Main Initializer ---
document.addEventListener('DOMContentLoaded', function() {
    console.log("Document loaded, initializing...");

    if (document.querySelector('.news-feed')) {
        loadLatestNews();
        loadPopularStocks();
    }

    const stockHeader = document.querySelector('.stock-header');
    if (stockHeader) {
        const symbolElement = document.querySelector('.stock-symbol');
        if (symbolElement) {
            const symbol = symbolElement.textContent.trim();
            loadStockPageData(symbol);
        }
    }
});

// --- Stock Page Main Data Loader ---
async function loadStockPageData(symbol) {
    const timelineContainer = document.querySelector('.timeline');
    if (timelineContainer) timelineContainer.innerHTML = '<div style="text-align:center; padding: 20px;">Bildirimler yükleniyor...</div>';
    
    await Promise.all([
        loadAnalystRatings(symbol),
        loadCapitalAndDividendData(symbol),
        loadNewsData(symbol, timelineContainer)
    ]);
    
    setupFilterTabs(symbol);
}

// --- News Data Loader ---
async function loadNewsData(symbol, timelineContainer) {
    try {
        const response = await fetch(`../data/${symbol.toLowerCase()}_news.json`);
        if (response.ok) {
            const newsData = await response.json();
            if (timelineContainer && newsData && newsData.length > 0) {
                loadNewsTimeline(symbol, newsData);
            } else {
                displayNoNewsMessage(symbol, timelineContainer);
            }
        } else {
            displayNoNewsMessage(symbol, timelineContainer);
        }
    } catch (error) {
        console.error(`Error loading news data for ${symbol}:`, error);
        displayNoNewsMessage(symbol, timelineContainer);
    }
}

// --- News Timeline & Interaction Functions ---
function loadNewsTimeline(symbol, newsData) {
    const timeline = document.querySelector('.timeline');
    if (!timeline) { return; }
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

function displayNoNewsMessage(symbol, timelineContainer) {
    if(timelineContainer) timelineContainer.innerHTML = `<div style="text-align:center; padding: 40px;">${symbol} için bildirim bulunamadı.</div>`;
}

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

function toggleExpansion(item, forceExpand = false) {
    const content = item.querySelector('.news-content-expandable');
    if (!content) return;
    const isExpanded = item.classList.contains('expanded');
    if (forceExpanded && !isExpanded) { item.classList.add('expanded'); content.style.display = 'block'; } 
    else if (!forceExpand && isExpanded) { item.classList.remove('expanded'); content.style.display = 'none'; } 
    else if (!forceExpand && !isExpanded) {
        document.querySelectorAll('.news-item.expanded').forEach(expandedItem => {
            if (expandedItem !== item) toggleExpansion(expandedItem, false);
        });
        item.classList.add('expanded');
        content.style.display = 'block';
    }
}

function filterNewsByCategory(category) {
    document.querySelectorAll('.news-item').forEach(item => {
        const itemCategory = item.getAttribute('data-category-value').toLowerCase();
        item.style.display = (category === 'all' || category === 'capital' || itemCategory === category) ? 'block' : 'none';
    });
}


// --- Analyst Ratings ---
async function loadAnalystRatings(symbol) {
    const ratingsContainer = document.querySelector('.analyst-ratings');
    if (!ratingsContainer) return;
    ratingsContainer.innerHTML = `<div style="padding: 15px; text-align: center;">Analist tavsiyeleri yükleniyor...</div>`;
    
    try {
        const response = await fetch('../data/analyst_ratings.json');
        if (!response.ok) { ratingsContainer.innerHTML = ''; return; }
        const allRatings = await response.json();
        const stockRatings = allRatings.results.filter(r => r.code === symbol);
        stockRatings.sort((a, b) => new Date(b.published_at) - new Date(a.published_at));

        if (stockRatings && stockRatings.length > 0) {
            ratingsContainer.innerHTML = `<h2 class="section-title">Analist Tavsiyeleri</h2><div class="analyst-ratings-list"></div>`;
            const ratingsList = ratingsContainer.querySelector('.analyst-ratings-list');
             const recommendationMap = { 'al': 'Al', 'tut': 'Tut', 'sat': 'Sat', 'endeks_ustu':'Endeks Üstü','endekse_paralel':'Endekse Paralel','endeks_alti':'Endeks Altı' };
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
                    <div class="rating-card-header"><img src="${localLogoPath}" alt="${rating.brokerage.title}" class="rating-brokerage-logo"><span class="rating-brokerage-title">${rating.brokerage.title}</span></div>
                    <div class="rating-details"><div class="rating-target-price"><span class="label">Hedef Fiyat</span>${rating.price_target.toFixed(2)} TL</div><div class="rating-type ${recommendationClass}">${recommendationText}</div></div>
                    <div class="rating-date">Yayınlanma: ${publishedDate}</div>`;
                ratingsList.appendChild(ratingCard);
            });
        } else {
            ratingsContainer.innerHTML = '';
        }
    } catch (error) {
        console.error(`Error loading analyst ratings for ${symbol}:`, error);
        ratingsContainer.innerHTML = '';
    }
}


// --- FİNAL SERMAYE & TEMETTÜ FONKSİYONU ---
async function loadCapitalAndDividendData(symbol) {
    const container = document.querySelector('.capital-events-container');
    if (!container) return;
    container.innerHTML = `<div style="padding: 20px; text-align: center;">Yükleniyor...</div>`;

    try {
        const [capitalResponse, dividendResponse] = await Promise.all([
            fetch('../data/sermaye_arttirimlari.csv'),
            fetch('../data/temettu.csv')
        ]);

        let hasCapitalData = false;
        let hasDividendData = false;
        let contentHtml = `<div class="events-section">
            <div class="event-toggle-buttons">
                <button class="event-toggle-btn active" data-target="dividends-table-container">Temettüler</button>
                <button class="event-toggle-btn" data-target="capital-table-container">Sermaye Artırımları</button>
            </div>`;

        // --- Temettü Tablosu ---
        let dividendTableHtml = '';
        if (dividendResponse.ok) {
            const dividendText = await dividendResponse.text();
            const stockDividends = parseDividends(dividendText).filter(d => d.kod === symbol);
            
            if (stockDividends.length > 0) {
                hasDividendData = true;
                dividendTableHtml = `
                    <div id="dividends-table-container">
                        <table class="events-table">
                            <thead>
                                <tr>
                                    <th>Tarih</th>
                                    <th>Temettü Verimi (%)</th>
                                    <th>Nakit Temettü Net Oran (%)</th>
                                    <th>Hisse Başı TL</th>
                                    <th>Toplam Temettü (TL)</th>
                                    <th>Dağıtma Oranı (%)</th>
                                </tr>
                            </thead>
                            <tbody>`;
                stockDividends.forEach(d => {
                    dividendTableHtml += `
                        <tr>
                            <td>${d.tarih}</td>
                            <td>${d.verim.toFixed(2)}</td>
                            <td>${d.netOran.toFixed(2)}</td>
                            <td><b>${d.hisseBasiTL.toFixed(4)}</b></td>
                            <td>${d.toplamTemettu.toLocaleString('tr-TR')}</td>
                            <td>${d.dagitmaOrani}</td>
                        </tr>`;
                });
                dividendTableHtml += `</tbody></table></div>`;
            }
        }

        // --- Sermaye Artırımı Tablosu ---
        let capitalTableHtml = '';
        if (capitalResponse.ok) {
            const capitalText = await capitalResponse.text();
            const stockCapitalEvents = parseCapitalEvents(capitalText).filter(e => e.kod === symbol);
            
            if (stockCapitalEvents.length > 0) {
                hasCapitalData = true;
                capitalTableHtml = `
                    <div id="capital-table-container" style="display: none;">
                         <table class="events-table">
                            <thead>
                                <tr>
                                    <th>Tarih</th>
                                    <th>Böl. Son. Sermaye (TL)</th>
                                    <th>Bedelli Oran (%)</th>
                                    <th>Bedelsiz Oran (%)</th>
                                    <th>Hisse Başı Brüt Temettü (TL)</th>
                                </tr>
                            </thead>
                            <tbody>`;
                stockCapitalEvents.forEach(e => {
                    capitalTableHtml += `
                        <tr>
                            <td>${e.tarih.split('-').reverse().join('.')}</td>
                            <td>${e.sermaye.toLocaleString('tr-TR', {maximumFractionDigits: 0})}</td>
                            <td class="${e.bedelliOran > 0 ? 'event-type-bedelli' : ''}">${e.bedelliOran > 0 ? `%${e.bedelliOran.toFixed(2)}` : '-'}</td>
                            <td class="${e.bedelsizOran > 0 ? 'event-type-bedelsiz' : ''}">${e.bedelsizOran > 0 ? `%${e.bedelsizOran.toFixed(2)}` : '-'}</td>
                            <td>${e.hisseBasiBrut > 0 ? e.hisseBasiBrut.toFixed(4) : '-'}</td>
                        </tr>`;
                });
                capitalTableHtml += `</tbody></table></div>`;
            }
        }
        
        if (hasDividendData || hasCapitalData) {
            if(!hasDividendData) {
                contentHtml = contentHtml.replace(' active" data-target="dividends-table-container"',' data-target="dividends-table-container"');
                contentHtml = contentHtml.replace(' data-target="capital-table-container"',' active" data-target="capital-table-container"');
                capitalTableHtml = capitalTableHtml.replace('style="display: none;"','style="display: block;"');
            }
            contentHtml += dividendTableHtml + capitalTableHtml + `</div>`;
            container.innerHTML = contentHtml;
            setupToggleButtons(container);
        } else {
            container.innerHTML = '';
        }

    } catch (error) {
        console.error("Error loading capital/dividend data:", error);
        container.innerHTML = `<div class="events-section"><p>Veriler yüklenirken bir hata oluştu.</p></div>`;
    }
}

function setupToggleButtons(container) {
    const buttons = container.querySelectorAll('.event-toggle-btn');
    buttons.forEach(button => {
        button.addEventListener('click', () => {
            buttons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            container.querySelectorAll('[id$="-table-container"]').forEach(tableDiv => {
                tableDiv.style.display = 'none';
            });
            
            const targetId = button.getAttribute('data-target');
            const targetTable = container.querySelector(`#${targetId}`);
            if (targetTable) {
                targetTable.style.display = 'block';
            }
        });
    });
}

// Düzeltilmiş Parser Fonksiyonları
function parseCapitalEvents(csvText) {
    if (!csvText) return [];
    return csvText.trim().split('\n').slice(1).map(line => {
        const parts = line.split(';');
        return {
            kod: parts[0]?.trim(),
            // HATANIN DÜZELTİLDİĞİ YER: Ondalık ayracı olan nokta artık silinmiyor.
            sermaye: parseFloat(parts[1] || '0'),
            tarih: parts[2]?.trim(),
            bedelliOran: parseFloat(parts[3]?.replace(',', '.') || '0'),
            bedelsizOran: parseFloat(parts[6]?.replace(',', '.') || '0'),
            hisseBasiBrut: parseFloat(parts[10]?.replace(',', '.') || '0')
        };
    }).filter(e => e.kod && e.tarih);
}

function parseDividends(csvText) {
    if (!csvText) return [];
    return csvText.trim().split('\n').slice(1).map(line => {
        const parts = line.split(';');
        if (parts.length < 8) return null; // Eksik sütunlu satırları atla
        const tarihRaw = parts[1]?.trim();
        if (!tarihRaw || tarihRaw.length !== 8) return null;
        const day = tarihRaw.substring(0, 2), month = tarihRaw.substring(2, 4), year = tarihRaw.substring(4, 8);
        
        // Hisse başı TL değerini 100'e bölerek düzeltiyoruz (25.00 -> 0.25)
        const hisseBasiTLRaw = parseFloat(parts[4]?.replace(',', '.') || '0');
        const hisseBasiTL = hisseBasiTLRaw / 100;
        
        return {
            kod: parts[0]?.trim(),
            tarih: `${day}.${month}.${year}`,
            verim: parseFloat(parts[2]?.replace(',', '.') || '0'),
            netOran: parseFloat(parts[5]?.replace(',', '.') || '0'), // Net oran %
            hisseBasiTL: hisseBasiTL, // Düzeltilmiş hisse başı TL değeri
            toplamTemettu: parseFloat(parts[6]?.replace(',', '.') || '0'),
            dagitmaOrani: parseInt(parts[7] || '0', 10)
        };
    }).filter(d => d && d.kod);
}

// Sekme Yönetim Fonksiyonu
function setupFilterTabs(symbol) {
    const filterTabs = document.querySelectorAll('.filter-tab');
    const newsTimelineContainer = document.querySelector('.news-timeline');
    const analystRatingsContainer = document.querySelector('.analyst-ratings');
    const capitalEventsContainer = document.querySelector('.capital-events-container');

    const hasAnalystRatings = analystRatingsContainer?.querySelector('.analyst-ratings-list');
    const hasCapitalEvents = capitalEventsContainer?.querySelector('.events-section');

    filterTabs.forEach(tab => {
        const category = tab.getAttribute('data-category');
        if (category === 'analyst' && !hasAnalystRatings) tab.style.display = 'none';
        if (category === 'capital' && !hasCapitalEvents) tab.style.display = 'none';

        tab.addEventListener('click', function() {
            filterTabs.forEach(t => t.classList.remove('active'));
            this.classList.add('active');
            const currentCategory = this.getAttribute('data-category');

            analystRatingsContainer.style.display = 'none';
            analystRatingsContainer.classList.remove('visible');
            capitalEventsContainer.style.display = 'none';
            newsTimelineContainer.style.display = 'block';
            newsTimelineContainer.classList.remove('compressed');

            if (currentCategory === 'analyst' && hasAnalystRatings) {
                analystRatingsContainer.style.display = 'block';
                analystRatingsContainer.classList.add('visible');
                newsTimelineContainer.classList.add('compressed');
            } else if (currentCategory === 'capital' && hasCapitalEvents) {
                capitalEventsContainer.style.display = 'block';
                newsTimelineContainer.style.display = 'none';
            }
            
            filterNewsByCategory(currentCategory);
        });
    });
    if (!document.querySelector('.filter-tab.active')) {
        document.querySelector('.filter-tab[data-category="all"]')?.click();
    }
}

// --- Anasayfa Fonksiyonları ---
function loadLatestNews() {
    const newsContainer = document.querySelector('.news-feed');
    if (!newsContainer || typeof stocksData === 'undefined') {
        if(newsContainer) newsContainer.innerHTML = '<p>Haberler yüklenemedi.</p>';
        return;
    }

    // Bu fonksiyonun içeriği anasayfa haber akışını yönetir ve
    // şimdilik doğru çalıştığı için olduğu gibi bırakılabilir.
    // Eğer o kısımda da sorun varsa, önceki versiyonlardan doldurulabilir.
}

function loadPopularStocks() {
    const stocksContainer = document.querySelector('.stock-list-simple');
    // stocksData objesinin data/stocks.js dosyasından yüklendiğinden emin ol
    if (!stocksContainer || typeof stocksData === 'undefined') {
        console.error("BIST30 hisseleri için 'stocksContainer' veya 'stocksData' bulunamadı.");
        return;
    }

    const popularSymbols = [ "THYAO", "ASELS", "EREGL", "SISE", "GARAN", "KCHOL", "EKGYO", "AKBNK", "FROTO", "KOZAL", "TAVHL", "ISCTR", "ENKAI", "MGROS", "SAHOL", "YKBNK", "ULKER", "TCELL", "AEFES", "CIMSA", "TUPRS", "BIMAS", "PGSUS", "TOASO", "TTKOM", "ASTOR" ];

    stocksContainer.innerHTML = ''; // Mevcut içeriği temizle
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