// js/price-updater.js - ÖNBELLEK SORUNU DÜZELTİLMİŞ FİNAL VERSİYON

(function() {
    // Google Sheet CSV dosyasının URL'si
    const sheetUrl = 'https://docs.google.com/spreadsheets/d/e/2PACX-1vSbBuHlsiyx5ObmgnvuoXKsxqrC7CCat5Qa1a4BDBCDX6tU55Dohuc6BrFOBcVFpiccdvOrXVxzD5Ul/pub?gid=0&single=true&output=csv';

    /**
     * CSV verisini satır satır işleyerek yapılandırılmış bir objeye dönüştürür.
     * @param {string} csvText - CSV formatındaki metin.
     * @returns {object} - Hisse kodları veya piyasa verisi adlarıyla anahtarlanmış veri objesi.
     */
    function parsePriceData(csvText) {
        const data = {};
        const lines = csvText.trim().split('\n');

        const stockRegex = /^([^,]+),[^,]+,"([^"]+)","([^"]+)","([^"]+)",(.+)$/;
        const indexQuotedRegex = /^([^,]+),[^,]+,"([^"]+)",.*$/;
        const indexUnquotedRegex = /^([^,]+),[^,]+,([^,]+),.*$/;

        lines.forEach(line => {
            const trimmedLine = line.trim();
            if (!trimmedLine || trimmedLine.startsWith(',,,')) return;

            let match = trimmedLine.match(stockRegex);
            if (match) {
                const ticker = match[1].trim();
                data[ticker] = {
                    price: match[2].replace(',', '.').trim(),
                    change: match[3].replace(',', '.').trim(),
                    changePercent: match[4].replace(',', '.').trim(),
                    timestamp: match[5].trim()
                };
            } else {
                match = trimmedLine.match(indexQuotedRegex);
                if (match) {
                    const name = match[1].trim();
                    data[name] = {
                        price: match[2].replace(',', '.').trim(),
                        change: null,
                        changePercent: null,
                        timestamp: null
                    };
                } else {
                    match = trimmedLine.match(indexUnquotedRegex);
                    if (match) {
                        const name = match[1].trim();
                        const priceRaw = match[2] || '';
                        const priceCleaned = priceRaw.replace('$', '').replace(',', '.').trim();
                        data[name] = {
                            price: priceCleaned,
                            change: null,
                            changePercent: null,
                            timestamp: null
                        };
                    } else {
                        console.warn("Bu satır işlenemedi:", trimmedLine);
                    }
                }
            }
        });
        return data;
    }

    /**
     * Anasayfadaki "Piyasa Özeti" widget'ını günceller.
     * @param {object} priceData - İşlenmiş fiyat verileri.
     */
    function updateIndexPage(priceData) {
        const marketMap = {
            'BIST 100': '#bist100-value',
            'BIST 30': '#bist30-value',
            'Dolar/TL': '#usd-tl-value',
            'Euro/TL': '#eur-tl-value',
            'Altın (ONS)': '#gold-ons-value',
            'Brent Petrol': '#brent-oil-value'
        };

        for (const name in marketMap) {
            if (priceData[name]) {
                const element = document.querySelector(marketMap[name]);
                if (element) {
                    element.textContent = priceData[name].price;
                }
            }
        }
        
        const scheduleSpan = document.querySelector('.sidebar .widget-card:nth-child(1) .section-title .update-schedule');
        if(scheduleSpan) scheduleSpan.textContent = "Canlı Veri";
    }

    /**
     * Hisse senedi detay sayfalarındaki fiyat bilgilerini günceller.
     * @param {object} priceData - İşlenmiş fiyat verileri.
     * @param {string} symbol - Güncellenecek hisse senedinin sembolü.
     */
    function updateStockPage(priceData, symbol) {
        const stock = priceData[symbol];
        if (!stock) return;

        const priceEl = document.querySelector('.current-price');
        const changeEl = document.querySelector('.price-change');
        const timeEl = document.querySelector('.update-time');

        if (priceEl) priceEl.textContent = stock.price;
        if (timeEl) timeEl.textContent = stock.timestamp || 'Az önce güncellendi';
        
        if (changeEl) {
            const changeValue = parseFloat(stock.change);
            changeEl.innerHTML = `<span>${stock.change}</span> <span>(${stock.changePercent}%)</span>`;
            changeEl.classList.remove('price-up', 'price-down');
            if (changeValue > 0) {
                changeEl.classList.add('price-up');
            } else if (changeValue < 0) {
                changeEl.classList.add('price-down');
            }
        }
    }

    /**
     * Ana fonksiyon: Veriyi çeker ve ilgili sayfa güncelleme fonksiyonlarını çağırır.
     */
    async function init() {
        try {
            // DEĞİŞİKLİK BURADA: { cache: "no-store" } parametresi eklendi.
            // Bu, tarayıcının veriyi önbellekten okumasını engeller ve her zaman en güncel veriyi çeker.
            const response = await fetch(sheetUrl, { cache: "no-store" });
            if (!response.ok) return;

            const csvText = await response.text();
            const priceData = parsePriceData(csvText);

            if (document.querySelector('.news-feed')) {
                updateIndexPage(priceData);
            }

            if (document.querySelector('.stock-header')) {
                const symbol = document.querySelector('.stock-symbol')?.textContent.trim();
                if (symbol) {
                    updateStockPage(priceData, symbol);
                }
            }
        } catch (error) {
            console.error('Fiyat verileri işlenirken hata oluştu:', error);
        }
    }

    document.addEventListener('DOMContentLoaded', init);

})(); 