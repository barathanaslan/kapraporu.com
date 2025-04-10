// generate-stock-pages.js
const fs = require('fs');
const path = require('path');

// --- Load stocksData ---
// NOTE: This is a simplified way. If stocks.js is complex,
// you might need a more robust method like parsing or using a module.
// For this example, we'll read it as text and extract the object.
const stocksJSPath = path.join(__dirname, 'data', 'stocks.js');
let stocksData = {};
try {
    let stocksJSContent = fs.readFileSync(stocksJSPath, 'utf8');
    // Remove variable assignment and comments to make it JSON-like
    stocksJSContent = stocksJSContent.replace(/const stocksData =/g, '');
    stocksJSContent = stocksJSContent.replace(/;\s*$/g, ''); // Remove trailing semicolon
    // Warning: eval is generally unsafe, but used here for simplicity
    // assuming stocks.js ONLY contains the object definition.
    // A safer method would be needed for production (e.g., save as JSON).
    stocksData = eval('(' + stocksJSContent + ')');
    console.log("Successfully loaded stocksData object.");
} catch (e) {
    console.error("Error loading or parsing /data/stocks.js:", e);
    console.error("Please ensure /data/stocks.js defines the 'stocksData' object correctly.");
    process.exit(1);
}
// --- End Load stocksData ---


// Make sure the stocks directory exists
const stocksDir = path.join(__dirname, 'stocks');
if (!fs.existsSync(stocksDir)) {
    fs.mkdirSync(stocksDir);
}

// Read the stock template
// We're using the updated thyao.html with the new layout as our template
const templatePath = path.join(__dirname, 'stocks', 'thyao.html');
if (!fs.existsSync(templatePath)) {
    console.error(`Template file not found: ${templatePath}`);
    process.exit(1);
}

let template = fs.readFileSync(templatePath, 'utf8');

// --- IMPORTANT: Remove the script tag loading stocks.js from the template if it exists ---
template = template.replace(/<script src="..\/data\/stocks.js"><\/script>\s*/g, '');
// ---

// Get all stock codes from data directory (using news files as reference)
const dataDir = path.join(__dirname, 'data');
const newsFiles = fs.readdirSync(dataDir).filter(file => file.endsWith('_news.json'));
const symbols = [...new Set(newsFiles.map(file => file.replace('_news.json', '').toUpperCase()))];

console.log(`Found ${symbols.length} stocks with data files. Attempting to generate pages...`);

// Create a page for each stock
let createdCount = 0;
let skippedCount = 0;

symbols.forEach(symbol => {
    const outputPath = path.join(stocksDir, `${symbol.toLowerCase()}.html`);

    // Find the data for the current stock
    const stockInfo = stocksData[symbol];

    if (!stockInfo) {
        console.warn(`!!! Data for symbol ${symbol} not found in stocksData. Skipping page generation.`);
        skippedCount++;
        return;
    }

    // Modify the template for this stock
    let content = template;

    // Replace Title
    content = content.replace(/<title>.*?<\/title>/, `<title>${symbol} - ${stockInfo.name || 'Stock'} | Kap Raporu</title>`);

    // Replace Header Info
    content = content.replace(/<div class="stock-symbol">.*?<\/div>/, `<div class="stock-symbol">${symbol}</div>`);
    content = content.replace(/<div class="stock-name">.*?<\/div>/, `<div class="stock-name">${stockInfo.name || 'N/A'}</div>`);
    content = content.replace(/<div class="stock-sector">.*?<\/div>/, `<div class="stock-sector">${stockInfo.sector || 'N/A'}</div>`);
    content = content.replace(/<div class="stock-description">.*?<\/div>/gis, `<div class="stock-description">${stockInfo.description || 'KAP bildirimleri aşağıda listelenmiştir.'}</div>`); // Use /s flag for multiline

    // Replace Price Info
    content = content.replace(/<div class="current-price">.*?<\/div>/, `<div class="current-price">${stockInfo.price || 'N/A'}</div>`);
    const priceChangeClass = stockInfo.isPositive ? 'price-change price-up' : 'price-change price-down';
    content = content.replace(/<div class="price-change.*?>.*?<\/div>/gis, `<div class="${priceChangeClass}"><span>${stockInfo.change || ''}</span> <span>(${stockInfo.changePercent || ''})</span></div>`);
    content = content.replace(/<div class="update-time">.*?<\/div>/, `<div class="update-time">${stockInfo.lastUpdate || ''}</div>`);

    // Replace News Header Symbol
    content = content.replace(/Haber Akışı \(.*?\)/, `Haber Akışı (${symbol})`);

    // Ensure content-area has investment-plans div (for the new layout)
    if (!content.includes('<div class="investment-plans">')) {
        // Add investment plans section properly in the new layout
        content = content.replace(
            /(<div class="content-area">.*?<div class="news-timeline">.*?<\/div>\s*<\/div>\s*<\/div>)/s,
            '$1\n<div class="investment-plans">\n<!-- Investment plans will be loaded here -->\n</div>\n'
        );
    }

    // Write the file
    fs.writeFileSync(outputPath, content);
    console.log(`Generated/Updated stock page: ${outputPath}`);
    createdCount++;
});

console.log(`\nStock page generation complete!`);
console.log(`Generated/Updated: ${createdCount}, Skipped (No Data/Error): ${skippedCount}`);