// generate-stock-pages.js
// Generate pages for all stocks with data

const fs = require('fs');
const path = require('path');

// Make sure the stocks directory exists
const stocksDir = path.join(__dirname, 'stocks');
if (!fs.existsSync(stocksDir)) {
  fs.mkdirSync(stocksDir);
}

// Read the stock template
const templatePath = path.join(__dirname, 'stocks', 'thyao.html');
if (!fs.existsSync(templatePath)) {
  console.error(`Template file not found: ${templatePath}`);
  process.exit(1);
}

const template = fs.readFileSync(templatePath, 'utf8');

// Get all stock codes from data directory
const dataDir = path.join(__dirname, 'data');
const newsFiles = fs.readdirSync(dataDir).filter(file => file.endsWith('_news.json'));
const symbols = [...new Set(newsFiles.map(file => file.replace('_news.json', '').toUpperCase()))];

console.log(`Found ${symbols.length} stocks with data files`);

// Create a page for each stock
let createdCount = 0;
let skippedCount = 0;

symbols.forEach(symbol => {
  const outputPath = path.join(stocksDir, `${symbol.toLowerCase()}.html`);
  
  // Skip if the file already exists
  if (fs.existsSync(outputPath)) {
    console.log(`Skipping existing file: ${outputPath}`);
    skippedCount++;
    return;
  }
  
  // Modify the template for this stock
  let content = template;
  
  // Replace the symbol in title
  content = content.replace(/THYAO - .*?<\/title>/, `${symbol} - Stock | Kap Raporu</title>`);
  
  // Replace the symbol in header
  content = content.replace(/<div class="stock-symbol">THYAO<\/div>/, `<div class="stock-symbol">${symbol}</div>`);
  
  // Replace the symbol in news header
  content = content.replace(/Haber Akışı \(THYAO\)/, `Haber Akışı (${symbol})`);
  
  // Add investment plans section
  if (!content.includes('<div class="investment-plans">')) {
    content = content.replace(
      /<\/div>\s*<\/div>\s*<div class="stock-sidebar">/,
      '</div></div>\n\n        <div class="investment-plans">\n          <!-- Investment plans will be loaded here -->\n        </div>\n\n        <div class="stock-sidebar">'
    );
  }
  
  // Write the file
  fs.writeFileSync(outputPath, content);
  console.log(`Created stock page: ${outputPath}`);
  createdCount++;
});

console.log(`\nStock page generation complete!`);
console.log(`Created: ${createdCount}, Skipped: ${skippedCount}`);