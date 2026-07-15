const fs = require('fs');

const jsFile = 'script.js';
if (fs.existsSync(jsFile)) {
    let jsContent = fs.readFileSync(jsFile, 'utf8');

    const startMarker = "// Product Schema & Breadcrumbs JSON-LD";
    const endMarker = "// Populate Elements (similar to old openProductDetail logic but for static page)";

    const startIdx = jsContent.indexOf(startMarker);
    const endIdx = jsContent.indexOf(endMarker, startIdx);

    if (startIdx !== -1 && endIdx !== -1) {
        const replaceBlock = `// Product Schema & Breadcrumbs JSON-LD
  
  // Remove ALL existing schema tags with Product to prevent duplicates
  document.querySelectorAll('script[type="application/ld+json"]').forEach(tag => {
    try {
      const content = JSON.parse(tag.textContent);
      if (content['@type'] === 'Product') {
        tag.remove();
      }
    } catch (e) {
      if (tag.id === 'productSchema') tag.remove();
    }
  });

  const newSchema = document.createElement('script');
  newSchema.type = 'application/ld+json';
  newSchema.id = 'productSchema';

  const productUrl = p.slug ? \`https://rokeabyrk.com/product/\${p.slug}\` : \`https://rokeabyrk.com/product-details?id=\${p.id}\`;
  
  // Strict Real values only. No Placeholders.
  let productName = p.name;
  if (!productName && p.slug) {
    productName = p.slug.replace(/-/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
  }
  if (!productName) productName = p.id; // fallback to ID, NEVER placeholder string
  
  const productSchemaData = {
    "@context": "https://schema.org/",
    "@type": "Product",
    "name": productName,
    "description": productDesc || productName,
    "image": productImg ? [productImg] : [],
    "brand": { "@type": "Brand", "name": "ROKEA by RK" },
    "category": p.category || "",
    "sku": p.id || p.slug,
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
    
  newSchema.textContent = JSON.stringify(productSchemaData);
  document.head.appendChild(newSchema);

  // Validation & Logs
  try {
    const parsedSchema = JSON.parse(newSchema.textContent);
    console.log("Firebase Product Loaded");
    console.log("Generated Product Schema", parsedSchema);
    console.log("Schema Inserted Successfully");
    console.log("Current Schema:", newSchema.textContent);
  } catch (error) {
    console.error("Any Errors: Invalid JSON-LD Schema", error);
  }
  
  // Verification
  const allSchemas = document.querySelectorAll('script[type="application/ld+json"]');
  let productSchemaExists = false;
  allSchemas.forEach(s => {
    try {
      if(JSON.parse(s.textContent)['@type'] === 'Product') productSchemaExists = true;
    } catch(e){}
  });
  if (!productSchemaExists) {
    console.error("Any Errors: Product Schema missing after injection!");
  }
  
  `;
        
        // Include the end marker which we matched against, but preserve everything else
        jsContent = jsContent.substring(0, startIdx) + replaceBlock + jsContent.substring(endIdx);
        fs.writeFileSync(jsFile, jsContent);
        console.log('Successfully replaced schema logic precisely using markers');
    } else {
        console.log('Could not find start or end index.');
    }
}
