const fs = require('fs');

function escapeXml(unsafe) {
  return unsafe.replace(/[<>&'"]/g, c => {
    switch (c) {
      case '<': return '&lt;';
      case '>': return '&gt;';
      case '&': return '&amp;';
      case '\'': return '&apos;';
      case '"': return '&quot;';
    }
  });
}

async function fetchAllProducts() {
  const products = [];
  let pageToken = '';
  
  do {
    const url = `https://firestore.googleapis.com/v1/projects/rokeya-3ccaa/databases/(default)/documents/products?pageSize=300${pageToken ? '&pageToken=' + pageToken : ''}`;
    const res = await fetch(url);
    if (!res.ok) break;
    const data = await res.json();
    if (data.documents) {
      products.push(...data.documents);
    }
    pageToken = data.nextPageToken || '';
  } while (pageToken);

  return products;
}

async function generateSitemap() {
  const baseUrl = "https://rokeabyrk.com";
  const currentDate = new Date().toISOString().split('T')[0];
  const addedUrls = new Set();
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>\n`;
  xml += `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n`;
  
  // Static pages
  const staticPages = [
    { path: "/", priority: "1.0", changefreq: "daily" },
    { path: "/collections", priority: "0.9", changefreq: "daily" },
    { path: "/about", priority: "0.8", changefreq: "monthly" },
    { path: "/contact", priority: "0.8", changefreq: "monthly" },
    { path: "/ai-stylist", priority: "0.8", changefreq: "weekly" },
    { path: "/blouse-designs", priority: "0.8", changefreq: "weekly" },
    { path: "/custom-blouse-order", priority: "0.8", changefreq: "weekly" }
  ];
  
  for (const page of staticPages) {
    const fullUrl = `${baseUrl}${page.path}`;
    if (!addedUrls.has(fullUrl)) {
      addedUrls.add(fullUrl);
      xml += `  <url>\n`;
      xml += `    <loc>${escapeXml(fullUrl)}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>${page.changefreq}</changefreq>\n`;
      xml += `    <priority>${page.priority}</priority>\n`;
      xml += `  </url>\n`;
    }
  }
  
  // Fetch live Firestore products
  try {
    const documents = await fetchAllProducts();
    let productCount = 0;
    
    for (const doc of documents) {
      const fields = doc.fields || {};
      const slug = fields.slug && fields.slug.stringValue ? fields.slug.stringValue.trim() : '';
      const id = doc.name.split('/').pop();
      
      const path = slug ? `/product/${slug}` : `/product/${id}`;
      const fullUrl = `${baseUrl}${path}`;
      
      if (!addedUrls.has(fullUrl)) {
        addedUrls.add(fullUrl);
        productCount++;
        xml += `  <url>\n`;
        xml += `    <loc>${escapeXml(fullUrl)}</loc>\n`;
        xml += `    <lastmod>${currentDate}</lastmod>\n`;
        xml += `    <changefreq>weekly</changefreq>\n`;
        xml += `    <priority>0.9</priority>\n`;
        xml += `  </url>\n`;
      }
    }
    
    xml += `</urlset>\n`;
    
    fs.writeFileSync('sitemap.xml', xml, 'utf8');
    console.log(`✅ Sitemap successfully generated with ${staticPages.length} static pages and ${productCount} unique products.`);
  } catch (err) {
    console.error("❌ Failed to generate sitemap:", err);
  }
}

generateSitemap();
