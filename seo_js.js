const fs = require('fs');

const scriptFile = 'script.js';
let content = fs.readFileSync(scriptFile, 'utf8');

// Insert getSEOAttributes function
const seoFunc = `
function getSEOAttributes(product) {
  let name = product.name;
  if (!name && product.slug) {
    name = product.slug.replace(/-/g, ' ').replace(/\\b\\w/g, l => l.toUpperCase());
  }
  if (!name) name = "Rokea Premium Product";
  
  name = name.replace(/"/g, '&quot;');
  
  return \`alt="\${name}" title="\${name}" aria-label="\${name}" loading="lazy" decoding="async" width="800" height="1000"\`;
}
`;

if (!content.includes('function getSEOAttributes')) {
    content = content.replace('// --- SEO Helpers ---', '// --- SEO Helpers ---\n' + seoFunc);
}

// 1. side-notification
content = content.replace(
    /<img src="\${product\.image \|\| product\.img}" class="side-notification-img">/g,
    '<img src="${product.image || product.img}" class="side-notification-img" ${getSEOAttributes(product)}>'
);

// 2. cart & wishlist items
content = content.replace(
    /<img src="\${item\.image \|\| item\.img}" style="width:50px">/g,
    '<img src="${item.image || item.img}" style="width:50px" ${getSEOAttributes(item)}>'
);

// 3. Main img in renderGrid
content = content.replace(
    /alt="\${p\.name}.*?" class="img-main" loading="lazy" decoding="async"/g,
    'class="img-main" ${getSEOAttributes(p)}'
);

// 4. Hover img in renderGrid
content = content.replace(
    /class="img-hover" alt="\${p\.name}.*?" loading="lazy" decoding="async"/g,
    'class="img-hover" ${getSEOAttributes(p)}'
);

// 5. Another img-main pattern
content = content.replace(
    /class="img-main" alt="\${p\.name}.*?" loading="lazy" decoding="async"/g,
    'class="img-main" ${getSEOAttributes(p)}'
);

// 6. Another img-hover pattern
content = content.replace(
    /class="img-hover" alt="\${p\.name}.*?" loading="lazy" decoding="async"/g,
    'class="img-hover" ${getSEOAttributes(p)}'
);

// 7. Product details modal / carousel
content = content.replace(
    /alt="\${p\.name}" style="width: 100%; height: 100%; object-fit: cover;"/g,
    'style="width: 100%; height: 100%; object-fit: cover;" ${getSEOAttributes(p)}'
);

// 8. Thumbnails
content = content.replace(
    /class="thumb-item \${i === 0 \? 'active' : ''}" alt="\${thumbAlt}" loading="lazy" decoding="async"/g,
    'class="thumb-item ${i === 0 ? \'active\' : \'\'}" ${getSEOAttributes({name: thumbAlt})}'
);

fs.writeFileSync(scriptFile, content);
console.log('Processed Image SEO for script.js');
