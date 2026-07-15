const fs = require('fs');

async function generateSitemap() {
  const baseUrl = "https://rokeabyrk.com";
  
  // Static pages
  const staticPages = [
    "/",
    "/collections",
    "/about",
    "/contact",
    "/ai-stylist",
    "/blouse-designs",
    "/custom-blouse-order"
  ];
  
  const currentDate = new Date().toISOString().split('T')[0];
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // Add static pages
  for (const page of staticPages) {
    xml += `  <url>\n`;
    xml += `    <loc>${baseUrl}${page}</loc>\n`;
    xml += `    <lastmod>${currentDate}</lastmod>\n`;
    xml += `    <changefreq>weekly</changefreq>\n`;
    if (page === "/") {
      xml += `    <priority>1.0</priority>\n`;
    } else {
      xml += `    <priority>0.8</priority>\n`;
    }
    xml += `  </url>\n`;
  }
  
  // Fetch products
  try {
    const response = await fetch('https://firestore.googleapis.com/v1/projects/rokeya-3ccaa/databases/(default)/documents/products?pageSize=200');
    const data = await response.json();
    
    if (data.documents) {
      for (const doc of data.documents) {
        // Extract fields from Firestore REST format
        const fields = doc.fields || {};
        const slug = fields.slug && fields.slug.stringValue ? fields.slug.stringValue : '';
        const id = doc.name.split('/').pop();
        
        let path = slug ? '/product/' + slug : '/product-details?id=' + id;
        
        xml += `  <url>\n`;
        xml += `    <loc>${baseUrl}${path}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
      }
    }
    
    xml += `</urlset>`;
    
    fs.writeFileSync('sitemap.xml', xml);
    console.log("Sitemap successfully generated with " + (data.documents ? data.documents.length : 0) + " products.");
  } catch (err) {
    console.error("Failed to generate sitemap:", err);
  }
}

generateSitemap();
