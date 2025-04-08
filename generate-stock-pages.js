// generate-stock-pages.js
// A simple Node.js script to generate all stock pages

const fs = require('fs');
const path = require('path');

// Make sure the stocks directory exists
const stocksDir = path.join(__dirname, 'stocks');
if (!fs.existsSync(stocksDir)) {
  fs.mkdirSync(stocksDir);
}

// Read the stock template
const templatePath = path.join(__dirname, 'stocks', 'thyao.html');
const template = fs.readFileSync(templatePath, 'utf8');

// Define which stocks to generate pages for
const symbols = ['GARAN', 'ASELS', 'EREGL', 'SISE'];

// Create a page for each stock
symbols.forEach(symbol => {
  const outputPath = path.join(__dirname, 'stocks', `${symbol.toLowerCase()}.html`);
  
  // Replace the symbol in the title and content
  let content = template
    .replace('THYAO - Türk Hava Yolları', `${symbol} - Stock Name`)
    .replace('<div class="stock-symbol">THYAO</div>', `<div class="stock-symbol">${symbol}</div>`)
    .replace('Haber Akışı (THYAO)', `Haber Akışı (${symbol})`);
  
  // Write the file
  fs.writeFileSync(outputPath, content);
  console.log(`Created stock page: ${outputPath}`);
});

console.log('All stock pages generated successfully!');