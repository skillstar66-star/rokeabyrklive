const fs = require('fs');
const cheerio = require('cheerio');

// Fix product-details.html
const htmlFile = 'product-details.html';
if (fs.existsSync(htmlFile)) {
    let htmlContent = fs.readFileSync(htmlFile, 'utf8');
    // Using regex to clear the contents of the script tag safely
    htmlContent = htmlContent.replace(
        /<script type="application\/ld\+json" id="productSchema">[\s\S]*?<\/script>/,
        '<script type="application/ld+json" id="productSchema"></script>'
    );
    fs.writeFileSync(htmlFile, htmlContent);
    console.log('Fixed product-details.html');
}

// Fix script.js
const jsFile = 'script.js';
if (fs.existsSync(jsFile)) {
    let jsContent = fs.readFileSync(jsFile, 'utf8');

    // The old logic we want to replace
    const oldLogicRegex = /const productSchemaData = \{\s*"@context": "https:\/\/schema\.org\/",\s*"@graph": \[\s*\{\s*"@type": "Product",[\s\S]*?\]\s*\};\s*schema\.textContent = JSON\.stringify\(productSchemaData\);/;
    
    // Fallback if the strict regex doesn't match
    const fallbackRegex = /const productSchemaData = \{[\s\S]*?schema\.textContent = JSON\.stringify\(productSchemaData\);/;

    let nameLogic = `let productName = p.name;
    if (!productName && p.slug) {
      productName = p.slug.replace(/-/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
    }
    if (!productName) productName = "ROKEA Premium Product";`;

    let newLogic = `${nameLogic}
    const productSchemaData = {
      "@context": "https://schema.org/",
      "@type": "Product",
      "name": productName,
      "description": productDesc || productName,
      "image": productImg ? [productImg] : [],
      "brand": { "@type": "Brand", "name": "ROKEA by RK" },
      "category": p.category || "",
      "sku": p.id || p.slug || "ROKEA-PROD",
      "url": window.location.href,
      "offers": {
        "@type": "Offer",
        "priceCurrency": "INR",
        "price": productPrice,
        "url": window.location.href,
        "availability": p.stock === 'Out of Stock' ? "https://schema.org/OutOfStock" : "https://schema.org/InStock",
        "itemCondition": "https://schema.org/NewCondition",
        "seller": { "@type": "Organization", "name": "ROKEA by RK" }
      }
    };
    schema.textContent = JSON.stringify(productSchemaData);`;

    if (oldLogicRegex.test(jsContent)) {
        jsContent = jsContent.replace(oldLogicRegex, newLogic);
        fs.writeFileSync(jsFile, jsContent);
        console.log('Fixed script.js (Primary Regex)');
    } else if (fallbackRegex.test(jsContent)) {
        jsContent = jsContent.replace(fallbackRegex, newLogic);
        fs.writeFileSync(jsFile, jsContent);
        console.log('Fixed script.js (Fallback Regex)');
    } else {
        console.log('Could not find schema logic in script.js to replace.');
    }
}
