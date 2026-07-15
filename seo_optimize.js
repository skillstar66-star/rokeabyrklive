const fs = require('fs');
const path = require('path');

const files = [
    'index.html', 'about.html', 'contact.html', 'collections.html',
    'blouse-designs.html', 'custom-blouse-order.html', 'ai-stylist.html', 'product-details.html'
];

const ogDefaults = {
    'about.html': { title: 'About Us', type: 'website', schema: 'AboutPage' },
    'contact.html': { title: 'Contact Us', type: 'website', schema: 'ContactPage' },
    'collections.html': { title: 'Our Collections', type: 'website', schema: 'CollectionPage' },
    'blouse-designs.html': { title: 'Blouse Designs', type: 'website', schema: 'WebPage' },
    'custom-blouse-order.html': { title: 'Custom Blouse Order', type: 'website', schema: 'WebPage' },
    'ai-stylist.html': { title: 'AI Stylist', type: 'website', schema: 'WebPage' }
};

function addPreconnect(content) {
    if (!content.includes('rel="preconnect"')) {
        return content.replace(/<link rel="stylesheet" href="\/style.css">/, 
        `<link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link rel="stylesheet" href="/style.css">`);
    }
    return content;
}

function addMissingOgTags(content, filename) {
    if (filename === 'index.html' || filename === 'product-details.html') return content;
    
    let info = ogDefaults[filename] || { title: 'ROKEA by RK', type: 'website', schema: 'WebPage' };
    
    let newContent = content;
    
    // Add canonical if missing
    if (!newContent.includes('rel="canonical"')) {
        newContent = newContent.replace(/<\/head>/, `  <link rel="canonical" href="https://rokeabyrk.com/${filename.replace('.html', '')}">\n</head>`);
    }
    
    // Add OG tags if missing
    if (!newContent.includes('og:title')) {
        const ogTags = `  <!-- OPEN GRAPH & TWITTER CARDS -->
  <meta property="og:title" content="${info.title} | ROKEA by RK">
  <meta property="og:description" content="Explore premium luxury sarees and heritage jewellery at ROKEA by RK.">
  <meta property="og:image" content="https://rokeabyrk.com/assets/og-image.jpg">
  <meta property="og:url" content="https://rokeabyrk.com/${filename.replace('.html', '')}">
  <meta property="og:type" content="${info.type}">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${info.title} | ROKEA by RK">
  <meta name="twitter:description" content="Explore premium luxury sarees and heritage jewellery at ROKEA by RK.">
  <meta name="twitter:image" content="https://rokeabyrk.com/assets/og-image.jpg">
  
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "${info.schema}",
    "name": "${info.title}",
    "url": "https://rokeabyrk.com/${filename.replace('.html', '')}"
  }
  </script>\n`;
        newContent = newContent.replace(/<\/head>/, ogTags + '</head>');
    }
    return newContent;
}

function optimizeImages(content) {
    return content.replace(/<img([^>]*)>/gi, (match, attrs) => {
        let newAttrs = attrs;
        if (!newAttrs.includes('loading=')) {
            newAttrs += ' loading="lazy"';
        }
        if (!newAttrs.includes('decoding=')) {
            newAttrs += ' decoding="async"';
        }
        if (!newAttrs.includes('alt=')) {
            newAttrs += ' alt="ROKEA by RK Image"';
        }
        // Exclude logo images from lazy loading (LCP optimization)
        if (newAttrs.includes('navLogoImg') || newAttrs.includes('splashLogo')) {
            newAttrs = newAttrs.replace('loading="lazy"', 'loading="eager" fetchpriority="high"');
        }
        return `<img${newAttrs}>`;
    });
}

function deferScripts(content) {
    return content.replace(/<script([^>]*)><\/script>/gi, (match, attrs) => {
        if (attrs.includes('src=') && !attrs.includes('defer') && !attrs.includes('firebase')) {
            return `<script${attrs} defer></script>`;
        }
        return match;
    });
}

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = addPreconnect(content);
        content = addMissingOgTags(content, file);
        content = optimizeImages(content);
        content = deferScripts(content);
        fs.writeFileSync(file, content);
        console.log(`Optimized ${file}`);
    } else {
        console.log(`File not found: ${file}`);
    }
}
