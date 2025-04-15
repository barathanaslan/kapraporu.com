// generate-stock-pages.js
const fs = require('fs');
const path = require('path');

// --- Load stocksData ---
const stocksJSPath = path.join(__dirname, 'data', 'stocks.js');
let stocksData = {};
try {
    let stocksJSContent = fs.readFileSync(stocksJSPath, 'utf8');
    // Basic cleaning - assumes stocks.js defines 'const stocksData = {...};'
    stocksJSContent = stocksJSContent.replace(/^const stocksData =/m, ''); // Match beginning of line
    stocksJSContent = stocksJSContent.replace(/;\s*$/g, ''); // Remove trailing semicolon

    // WARNING: eval is potentially unsafe. Use with caution.
    // Ensure stocks.js ONLY contains the object definition.
    // A safer approach is to store metadata as JSON.
    stocksData = eval('(' + stocksJSContent + ')');
    console.log("Successfully loaded stocksData object.");
} catch (e) {
    console.error("Error loading or parsing /data/stocks.js:", e);
    console.error("Ensure /data/stocks.js defines the 'stocksData' object correctly and ends with ';'.");
    process.exit(1);
}
// --- End Load stocksData ---


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
// ---

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
        content = content.replace(/<title>.*?<\/title>/, `<title>${symbol} - ${stockInfo.name || symbol} | Kap Raporu</title>`);

        // 2. Replace Header Info (using more specific selectors if needed)
        content = content.replace(/(<div class="stock-symbol">).*?(<\/div>)/, `$1${symbol}$2`);
        content = content.replace(/(<div class="stock-name">).*?(<\/div>)/, `$1${stockInfo.name || 'N/A'}$2`);
        content = content.replace(/(<div class="stock-sector">).*?(<\/div>)/, `$1${stockInfo.sector || 'N/A'}$2`);
        // Use regex for description, handle potential multiline placeholders
        content = content.replace(/(<div class="stock-description">)[\s\S]*?(<\/div>)/, `$1${stockInfo.description || 'KAP bildirimleri aşağıda listelenmiştir.'}$2`);

        // 3. Replace Price Info
        content = content.replace(/(<div class="current-price">).*?(<\/div>)/, `$1${stockInfo.price || 'N/A'}$2`);
        const priceChangeClass = stockInfo.isPositive ? 'price-change price-up' : 'price-change price-down';
        // Use regex for price change, handle potential multiline placeholders
        content = content.replace(/<div class="price-change.*?>[\s\S]*?<\/div>/, `<div class="${priceChangeClass}"><span>${stockInfo.change || ''}</span> <span>(${stockInfo.changePercent || ''})</span></div>`);
        content = content.replace(/(<div class="update-time">).*?(<\/div>)/, `$1${stockInfo.lastUpdate || new Date().toLocaleDateString('tr-TR') + ' (Veri Yok)'}$2`); // Add fallback

        // 4. Replace News Header Symbol in H2
        content = content.replace(/(<h2 class="section-title">Haber Akışı \().*?(\))/, `$1${symbol}$2`);

        // 5. Remove placeholder timeline content (main.js will populate)
        // Find the timeline div and replace its *inner* content
        content = content.replace(/(<div class="timeline">)[\s\S]*?(<\/div>\s*<\/div>\s*<\/div>\s*<div class="investment-plans">)/s, '$1$2');


        // 6. Write the file
        fs.writeFileSync(outputPath, content);
        // console.log(`Generated/Updated stock page: ${outputPath}`); // Keep console cleaner
        createdCount++;

    } catch (err) {
        console.error(`!!! Error processing page for ${symbol}: ${err.message}`);
        errorCount++;
    }
});

console.log(`\nStock page generation complete!`);
console.log(`Generated/Updated: ${createdCount}, Errors/Skipped: ${errorCount}`);