// generate-stock-pages.js
const fs = require('fs');
const path = require('path');

// --- Load stocksData directly as a module ---
let stocksData = {};
try {
    // Simply require the stock data file directly
    // This takes advantage of the module.exports at the bottom of stocks.js
    const stocksModule = require('./data/stocks.js');
    stocksData = stocksModule.stocksData;
    console.log("Successfully loaded stocksData object.");
} catch (e) {
    console.error("Error loading stocks.js module:", e);
    process.exit(1);
}

// Make sure the stocks directory exists
const stocksDir = path.join(__dirname, 'stocks');
if (!fs.existsSync(stocksDir)) {
    fs.mkdirSync(stocksDir);
    console.log(`Created directory: ${stocksDir}`);
}

// Read the stock template (using thyao.html as the base)
const templatePath = path.join(__dirname, 'stocks', 'thyao.html');
if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    process.exit(1);
}
let templateHtml = fs.readFileSync(templatePath, 'utf8');

// --- IMPORTANT: Ensure template does NOT load stocks.js or have inline JS logic ---
// This is a safety check; ideally, the template is already clean.
templateHtml = templateHtml.replace(/<script src="..\/data\/stocks.js"><\/script>\s*/g, '');
// Remove the sample inline script from the template if it exists (main.js should handle this)
templateHtml = templateHtml.replace(/<script>\s*document\.addEventListener\('DOMContentLoaded', function\(\) {.*?}\);\s*<\/script>/s, '');
// Ensure it loads the main JS file (adjust path if necessary)
if (!templateHtml.includes('<script src="../js/main.js"></script>')) {
     // Add it before the closing body tag if missing
     templateHtml = templateHtml.replace('</body>', '    <script src="../js/main.js"></script>\n</body>');
     console.log("Added main.js script tag to template.");
}

// Get all stock symbols from the loaded stocksData
const symbols = Object.keys(stocksData);

console.log(`Found ${symbols.length} stocks in stocksData. Attempting to generate/update pages...`);

// Create/Update a page for each stock
let createdCount = 0;
let errorCount = 0;

symbols.forEach(symbol => {
    const outputPath = path.join(stocksDir, `${symbol.toLowerCase()}.html`);
    const stockInfo = stocksData[symbol]; // Get data for the current symbol

    if (!stockInfo) {
        console.warn(`!!! Data for symbol ${symbol} unexpectedly missing in stocksData object. Skipping.`);
        errorCount++;
        return;
    }

     // Start with a fresh copy of the template for each stock
     let content = templateHtml;

    try {
        // 1. Replace Title
        content = content.replace(/<title>.*?<\/title>/, `<title>${symbol} - ${stockInfo.name || symbol} | Finans Raporu</title>`);

        // 2. Replace Header Info (using more specific selectors if needed)
        content = content.replace(/(<div class="stock-symbol">).*?(<\/div>)/, `$1${symbol}$2`);
        content = content.replace(/(<div class="stock-name">).*?(<\/div>)/, `$1${stockInfo.name || 'N/A'}$2`);
        content = content.replace(/(<div class="stock-sector">).*?(<\/div>)/, `$1${stockInfo.sector || 'N/A'}$2`);
        // Use regex for description, handle potential multiline placeholders
        content = content.replace(/(<div class="stock-description">)[\s\S]*?(<\/div>)/, `$1${stockInfo.description || 'Şirket bildirimleri aşağıda listelenmiştir.'}$2`);

        // 3. Replace Price Info
        // For price, check if priceInfo exists and has price, otherwise use default "Yükleniyor..."
        content = content.replace(/(<div class="current-price">).*?(<\/div>)/, 
            `$1${stockInfo.priceInfo?.price || 'Yükleniyor...'}$2`);
        
        // Default to "price-up" class if isPositive not specified
        const priceChangeClass = (stockInfo.priceInfo?.isPositive === false) 
            ? 'price-change price-down' 
            : 'price-change price-up';
        
        // Use default values for change and percentage if not provided
        content = content.replace(/<div class="price-change.*?>[\s\S]*?<\/div>/, 
            `<div class="${priceChangeClass}"><span>${stockInfo.priceInfo?.change || '0,00'}</span> <span>(${stockInfo.priceInfo?.changePercent || '0,00%'})</span></div>`);
        
        // For last update, use priceInfo.lastUpdate or a default
        content = content.replace(/(<div class="update-time">).*?(<\/div>)/, 
            `$1${stockInfo.priceInfo?.lastUpdate || 'Yükleniyor...'}$2`);

        // 4. Replace News Header Symbol in H2
        content = content.replace(/(<h2 class="section-title">Haber Akışı \().*?(\))/, `$1${symbol}$2`);

        // 5. Remove placeholder timeline content (main.js will populate)
        // Find the timeline div and replace its *inner* content
        content = content.replace(/(<div class="timeline">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/div>\s*<div class="investment-plans">)/s, '$1$2');

        // 6. Replace any remaining "KAP" references with appropriate terms
        content = content.replace(/KAP bildirimleri/g, 'Şirket bildirimleri');
        content = content.replace(/KAP bildirim/g, 'Şirket bildirim');
        content = content.replace(/Kap Raporu/g, 'Finans Raporu');

        // 7. Write the file
        fs.writeFileSync(outputPath, content);
        console.log(`Generated/Updated stock page: ${symbol}`); // Show progress
        createdCount++;

    } catch (err) {
        console.error(`!!! Error processing page for ${symbol}: ${err.message}`);
        errorCount++;
    }
});

console.log(`\nStock page generation complete!`);
console.log(`Generated/Updated: ${createdCount}, Errors/Skipped: ${errorCount}`);