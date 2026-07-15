const fs = require('fs');

const files = [
    'index.html', 'about.html', 'contact.html', 'collections.html',
    'blouse-designs.html', 'custom-blouse-order.html', 'ai-stylist.html', 'product-details.html'
];

const robotsMeta = '<meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">';

function addRobots(content) {
    let newContent = content;
    
    // Remove existing basic robots tags
    newContent = newContent.replace(/<meta name="robots"[^>]*>/g, '');
    
    // Inject advanced robots meta tag
    newContent = newContent.replace(/<\/head>/, `  ${robotsMeta}\n</head>`);
    
    return newContent;
}

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = addRobots(content);
        fs.writeFileSync(file, content);
    }
}
console.log("Robots tags updated.");
