const fs = require('fs');
const cheerio = require('cheerio');

const files = [
    'index.html', 'about.html', 'contact.html', 'collections.html',
    'blouse-designs.html', 'custom-blouse-order.html', 'ai-stylist.html', 'product-details.html', 'middle.html'
];

files.forEach(file => {
    if (!fs.existsSync(file)) return;
    const html = fs.readFileSync(file, 'utf8');
    const $ = cheerio.load(html);
    console.log(`\n--- ${file} ---`);
    console.log('Title:', $('title').text());
    console.log('Desc:', $('meta[name="description"]').attr('content'));
    console.log('Canonical:', $('link[rel="canonical"]').attr('href'));
    console.log('OG Title:', $('meta[property="og:title"]').attr('content'));
    console.log('Twitter Card:', $('meta[name="twitter:card"]').attr('content'));
    console.log('Robots:', $('meta[name="robots"]').attr('content'));
    console.log('H1 Count:', $('h1').length);
    console.log('H1 Text:', $('h1').text().trim().substring(0, 50));
    const schema = $('script[type="application/ld+json"]').html();
    console.log('Schema:', schema ? 'Yes' : 'No');
});
