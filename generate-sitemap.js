// Run this script in the browser console when logged in as an Admin to download sitemap.xml
async function generateAndDownloadSitemap() {
  if (!window.db) {
    console.error("Firestore DB not found. Run this on a page where db is initialized (e.g. /).");
    return;
  }

  console.log("Generating sitemap...");
  const baseUrl = "https://rokeabyrk.com";
  
  // Static pages
  const staticPages = [
    "/",
    "/",
    "/collections",
    "/about",
    "/ai-stylist",
    "/blouse-designs"
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
    if (page === "/" || page === "/") {
      xml += `    <priority>1.0</priority>\n`;
    } else {
      xml += `    <priority>0.8</priority>\n`;
    }
    xml += `  </url>\n`;
  }
  
  // Fetch products and add to sitemap
  try {
    const snapshot = await db.collection("products").get();
    
    snapshot.forEach(doc => {
      const data = doc.data();
      const identifier = data.slug || doc.id;
      
      xml += `  <url>\n`;
      xml += `    <loc>${baseUrl}${data.slug ? '/product/' + data.slug : '/product-details?id=' + doc.id}</loc>\n`;
      xml += `    <lastmod>${currentDate}</lastmod>\n`;
      xml += `    <changefreq>weekly</changefreq>\n`;
      xml += `    <priority>0.9</priority>\n`;
      xml += `  </url>\n`;
    });
    
    xml += `</urlset>`;
    
    // Create a blob and trigger download
    const blob = new Blob([xml], { type: 'application/xml' });
    const url = URL.createObjectURL(blob);
    
    const a = document.createElement('a');
    a.href = url;
    a.download = 'sitemap.xml';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    
    console.log("Sitemap successfully generated and downloaded!");
    alert("Sitemap successfully generated and downloaded!");
    
  } catch (error) {
    console.error("Error generating sitemap:", error);
    alert("Error generating sitemap. Check console for details.");
  }
}

// Automatically expose it to window so user can call it
window.generateAndDownloadSitemap = generateAndDownloadSitemap;
console.log("Sitemap generator script loaded. Type generateAndDownloadSitemap() and hit enter to start.");
