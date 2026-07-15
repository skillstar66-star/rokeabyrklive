const fs = require('fs');
const files = [
    'index.html', 'about.html', 'contact.html', 'collections.html',
    'blouse-designs.html', 'custom-blouse-order.html', 'ai-stylist.html', 'product-details.html'
];

function addAriaLabels(content) {
    let newContent = content;
    // Mobile menu toggle
    if (newContent.includes('class="menu-toggle"') && !newContent.includes('aria-label="Toggle mobile menu"')) {
        newContent = newContent.replace(/class="menu-toggle"/g, 'class="menu-toggle" aria-label="Toggle mobile menu" role="button" tabindex="0"');
    }
    // Wishlist trigger
    if (newContent.includes('class="wishlist-trigger"') && !newContent.includes('aria-label="View wishlist"')) {
        newContent = newContent.replace(/class="wishlist-trigger"/g, 'class="wishlist-trigger" aria-label="View wishlist" role="button" tabindex="0"');
    }
    // Cart trigger
    if (newContent.includes('class="cart-trigger"') && !newContent.includes('aria-label="View cart"')) {
        newContent = newContent.replace(/class="cart-trigger"/g, 'class="cart-trigger" aria-label="View cart" role="button" tabindex="0"');
    }
    // Nav logo
    if (newContent.includes('class="nav-logo"') && !newContent.includes('aria-label="ROKEA by RK Homepage"')) {
        newContent = newContent.replace(/class="nav-logo"/g, 'class="nav-logo" aria-label="ROKEA by RK Homepage"');
    }
    return newContent;
}

for (const file of files) {
    if (fs.existsSync(file)) {
        let content = fs.readFileSync(file, 'utf8');
        content = addAriaLabels(content);
        fs.writeFileSync(file, content);
        console.log(`Aria labels added to ${file}`);
    }
}
