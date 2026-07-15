const fs = require('fs');
const cheerio = require('cheerio');

function updateFile(filename, updater) {
    if (!fs.existsSync(filename)) return;
    const html = fs.readFileSync(filename, 'utf8');
    const $ = cheerio.load(html, { decodeEntities: false });
    updater($);
    fs.writeFileSync(filename, $.html());
    console.log(`Updated ${filename}`);
}

// 1. about.html (Add meta description)
updateFile('about.html', ($) => {
    if ($('meta[name="description"]').length === 0) {
        $('head').append('<meta name="description" content="Explore the heritage and craftsmanship of ROKEA by RK. We offer premium luxury sarees, handpicked imitation jewellery, and personalized styling services.">\n');
    }
});

// 2. collections.html (Add meta desc, change H2 to H1)
updateFile('collections.html', ($) => {
    if ($('meta[name="description"]').length === 0) {
        $('head').append('<meta name="description" content="Shop our exclusive collections of premium luxury sarees and heritage imitation jewellery at ROKEA by RK. Handpicked for every occasion.">\n');
    }
    // Change <h2 class="section-title"> to <h1>
    $('h2.section-title').each((i, el) => {
        if ($(el).text().includes('Boutique')) {
            $(el).replaceWith(`<h1 class="section-title">${$(el).html()}</h1>`);
        }
    });
});

// 3. contact.html (Add meta desc, fix H1 text)
updateFile('contact.html', ($) => {
    if ($('meta[name="description"]').length === 0) {
        $('head').append('<meta name="description" content="Get in touch with ROKEA by RK. Visit our boutique in Coimbatore or contact us for luxury sarees, heritage jewellery, and custom styling.">\n');
    }
    // Fix H1
    $('h1').each((i, el) => {
        if ($(el).text().includes('Our Story')) {
            $(el).html('Contact <span class="ash-script">Us</span>');
        }
    });
});

// 4. ai-stylist.html (Add meta desc)
updateFile('ai-stylist.html', ($) => {
    if ($('meta[name="description"]').length === 0) {
        $('head').append('<meta name="description" content="Meet your AI Virtual Stylist at ROKEA by RK. Upload your photo for personalized luxury saree and jewellery recommendations tailored to your look.">\n');
    }
});

// 5. custom-blouse-order.html (Add twitter cards)
updateFile('custom-blouse-order.html', ($) => {
    const head = $('head');
    if ($('meta[name="twitter:card"]').length === 0) {
        head.append('<meta name="twitter:card" content="summary_large_image">\n');
        head.append('<meta name="twitter:title" content="Custom Blouse Order | ROKEA by RK">\n');
        head.append('<meta name="twitter:description" content="Order a premium custom-tailored blouse online with ROKEA by RK. Choose your design, submit measurements, and get the perfect fit.">\n');
        head.append('<meta name="twitter:image" content="https://rokeabyrk.com/assets/og-image.jpg">\n');
        head.append('<meta name="twitter:url" content="https://rokeabyrk.com/custom-blouse-order">\n');
    }
});

// 6. middle.html (Add noindex, nofollow)
updateFile('middle.html', ($) => {
    if ($('head').length === 0) {
        $('html').prepend('<head></head>');
    }
    if ($('meta[name="robots"]').length === 0) {
        $('head').append('<meta name="robots" content="noindex,nofollow">\n');
    }
});

// Global fixes for all files (Performance & deduplication)
const allFiles = [
    'index.html', 'about.html', 'contact.html', 'collections.html',
    'blouse-designs.html', 'custom-blouse-order.html', 'ai-stylist.html', 'product-details.html', 'middle.html'
];

allFiles.forEach(file => {
    updateFile(file, ($) => {
        // Ensure scripts have defer
        $('script[src]').each((i, el) => {
            if (!$(el).attr('defer') && !$(el).attr('async')) {
                $(el).attr('defer', '');
            }
        });
        
        // Remove duplicate preload links
        const preloads = new Set();
        $('link[rel="preload"]').each((i, el) => {
            const href = $(el).attr('href');
            if (preloads.has(href)) {
                $(el).remove();
            } else {
                preloads.add(href);
            }
        });
        
        // Add ARIA labels to forms if missing (Basic enhancement)
        $('input, select, textarea').each((i, el) => {
            if (!$(el).attr('aria-label') && !$(el).attr('id')) {
                $(el).attr('aria-label', $(el).attr('placeholder') || 'Input field');
            }
        });
    });
});
