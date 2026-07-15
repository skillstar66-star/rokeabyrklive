  // Product Schema & Breadcrumbs JSON-LD
  
  const productUrl = p.slug ? `https://rokeabyrk.com/product/${p.slug}` : `https://rokeabyrk.com/product-details?id=${p.id}`;
  
  // Strict Real values only. No Placeholders.
  let productName = p.name;
  if (!productName && p.slug) {
    productName = p.slug.replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase());
  }
  if (!productName) productName = p.id;
  
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
    
  let schemaScript = document.getElementById('productSchema');
  
  if (schemaScript) {
    // If it exists, replace its content (NEVER leave it empty)
    schemaScript.textContent = JSON.stringify(productSchemaData);
  } else {
    // Otherwise Create it dynamically. Append into document.head
    schemaScript = document.createElement('script');
    schemaScript.type = 'application/ld+json';
    schemaScript.id = 'productSchema';
    schemaScript.textContent = JSON.stringify(productSchemaData);
    document.head.appendChild(schemaScript);
  }
  
  // Remove duplicate Product schemas to ensure exactly ONE Product schema
  document.querySelectorAll('script[type="application/ld+json"]').forEach(tag => {
    if (tag.id !== 'productSchema') {
      try {
        const content = JSON.parse(tag.textContent);
        if (content['@type'] === 'Product') {
          tag.remove();
        }
      } catch (e) {
        // ignore parse errors for other tags
      }
    }
  });

  // Validation & Logs
  try {
    const parsedSchema = JSON.parse(schemaScript.textContent);
    console.log("Firebase Product Loaded", p);
    console.log("Generated Product Schema", parsedSchema);
    console.log("Schema Inserted Successfully");
    console.log("Current Schema:", schemaScript.textContent);
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
  
  // Populate Elements (similar to old openProductDetail logic but for static page)
  const mainImg = document.getElementById('detailMainImg');
  const name = document.getElementById('detailName');
  const price = document.getElementById('detailPrice');
  const desc = document.getElementById('descBody');
  const care = document.getElementById('careBody');
  const stock = document.getElementById('detailStockStatus');
  const btn = document.getElementById('detailAddToCartBtn');
  const buyBtn = document.getElementById('detailBuyNowBtn');
  const thumbs = document.getElementById('detailThumbnails');
  const qtyVal = document.getElementById('detailQtyVal');
  const qtyMinus = document.getElementById('detailQtyMinus');
  const qtyPlus = document.getElementById('detailQtyPlus');
  const breadCat = document.getElementById('breadcrumb-cat');
  const breadName = document.getElementById('breadcrumb-name');

  if (!name) return; // Not on product page

  let currentQty = 1;
  if (qtyVal) qtyVal.innerText = currentQty;
  if (qtyMinus) qtyMinus.onclick = () => { if (currentQty > 1) { currentQty--; qtyVal.innerText = currentQty; } };
  if (qtyPlus) qtyPlus.onclick = () => { currentQty++; qtyVal.innerText = currentQty; };

  // Set the real image and hide skeleton when loaded
  if (mainImg) {
    const skeleton = document.getElementById('imgSkeleton');
    const imgSrc = p.image || p.img || '';

    // SEO: descriptive alt text with product name, category, brand
    const altText = p.name
      ? `${p.name} - ${p.category || 'Luxury Saree'} | ROKEA by RK`
      : 'Luxury Handwoven Saree | ROKEA by RK';
    mainImg.alt = altText;
    mainImg.setAttribute('fetchpriority', 'high'); // LCP image — load first
    mainImg.setAttribute('decoding', 'async');

    if (imgSrc) {
      mainImg.onload = () => {
        mainImg.classList.add('img-loaded');   // fade in
        if (skeleton) skeleton.classList.add('hide');  // hide shimmer
      };
      mainImg.src = imgSrc;
    } else {
      // No image URL — show branded gradient placeholder
      if (skeleton) skeleton.classList.add('hide');
      mainImg.classList.add('img-loaded');
      mainImg.src = 'data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7'; // transparent
      mainImg.style.background = 'linear-gradient(135deg, #f0e6d3, #faf6ef)';
    }
  }
  if (name) name.innerText = p.name;
  if (breadName) breadName.innerText = p.name;
  if (breadCat) {
    breadCat.innerText = p.category;
    breadCat.href = `/collections`;
    breadCat.onclick = () => { localStorage.setItem('rokea_selected_category', p.category); };
  }
  if (price) price.innerText = `₹${(extractPriceFromDesc(p.description) || p.price || 0).toLocaleString('en-IN')}`;

  if (desc) {
    const descText = p.description || "Exquisite premium collection from ROKEA by RK.";
    const descLines = descText.split('\n').filter(line => line.trim().length > 0);
    desc.innerHTML = `<div style="display: flex; flex-direction: column; gap: 15px;">` + descLines.map(line => `
      <div style="background: rgba(255,255,255,0.7); border-left: 3px solid var(--gold); padding: 15px 20px; border-radius: 0 8px 8px 0; font-size: 14px; line-height: 1.7; color: var(--text); box-shadow: 0 2px 10px rgba(0,0,0,0.02); transition: transform 0.3s; cursor: default;" onmouseover="this.style.transform='translateX(3px)';" onmouseout="this.style.transform='translateX(0)';">
        ${line.replace(/^[✦•\-\*]\s*/, '').trim()}
      </div>
    `).join('') + `</div>`;
  }

  if (care) {
    const careText = p.productCare || "Handle with care to maintain the longevity of this premium piece.";
    const items = careText.split('\n').filter(line => line.trim().length > 0);

    let html = `<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(260px, 1fr)); gap: 15px; margin-top: 10px;">`;

    items.forEach(item => {
      const text = item.replace(/^[✦•\-\*]\s*/, '').trim();
      if (text === "CARE & SAFETY") return;

      let title = "Care Tip";
      let descText = text;

      if (text.includes(':')) {
        const parts = text.split(':');
        title = parts[0].trim();
        descText = parts.slice(1).join(':').trim();
      }

      let iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px;"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>`;
      if (title.toLowerCase().includes('clean')) iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px;"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path></svg>`;
      if (title.toLowerCase().includes('water') || title.toLowerCase().includes('moisture')) iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px;"><path d="M12 2.69l5.66 5.66a8 8 0 1 1-11.31 0z"/></svg>`;
      if (title.toLowerCase().includes('stor')) iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px;"><rect x="3" y="3" width="18" height="18" rx="2" ry="2"></rect><line x1="9" y1="3" x2="9" y2="21"></line></svg>`;
      if (title.toLowerCase().includes('perfume') || title.toLowerCase().includes('chemical')) iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px;"><path d="M10 2v4M14 2v4M6 10v10a2 2 0 002 2h8a2 2 0 002-2V10a2 2 0 00-2-2H8a2 2 0 00-2 2z"/></svg>`;
      if (title.toLowerCase().includes('handl')) iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px;"><path d="M18 8h1a4 4 0 0 1 0 8h-1"></path><path d="M2 8h16v9a4 4 0 0 1-4 4H6a4 4 0 0 1-4-4V8z"></path><line x1="6" y1="1" x2="6" y2="4"></line><line x1="10" y1="1" x2="10" y2="4"></line><line x1="14" y1="1" x2="14" y2="4"></line></svg>`;
      if (title.toLowerCase().includes('longevity') || title.toLowerCase().includes('tip')) iconSvg = `<svg viewBox="0 0 24 24" fill="none" stroke="var(--gold)" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round" style="width:18px; height:18px;"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="16" x2="12" y2="12"></line><line x1="12" y1="8" x2="12.01" y2="8"></line></svg>`;

      html += `
        <div style="background: rgba(255,255,255,0.7); border: 1px solid rgba(201,168,76,0.15); border-radius: 8px; padding: 18px; display: flex; flex-direction: column; gap: 10px; transition: transform 0.3s, box-shadow 0.3s; cursor: default;" onmouseover="this.style.transform='translateY(-3px)'; this.style.boxShadow='0 5px 15px rgba(201,168,76,0.1)';" onmouseout="this.style.transform='translateY(0)'; this.style.boxShadow='none';">
          <div style="display: flex; align-items: center; gap: 12px; margin-bottom: 2px;">
            <div style="background: rgba(201,168,76,0.1); width: 36px; height: 36px; border-radius: 50%; display: flex; align-items: center; justify-content: center; flex-shrink: 0; box-shadow: inset 0 0 10px rgba(201,168,76,0.05);">
               ${iconSvg}
            </div>
            <div style="font-family: 'Playfair Display', serif; font-weight: 600; font-size: 15px; color: var(--dark); letter-spacing: 0.3px;">${title}</div>
          </div>
          <div style="font-size: 13px; line-height: 1.6; color: var(--text);">${descText}</div>
        </div>
      `;
    });

    html += `</div>`;
    care.innerHTML = html;
  }

  if (stock) {
    const isOut = p.stock === 'Out of Stock';
    stock.innerHTML = `<span style="width: 8px; height: 8px; border-radius: 50%; background: ${isOut ? '#D93025' : '#4CAF50'};"></span> Availability: ${isOut ? 'Sold Out' : 'In Stock'}`;
  }

  if (p.stock === 'Out of Stock') {
    if (btn) { btn.innerText = 'Sold Out'; btn.disabled = true; }
    if (buyBtn) { buyBtn.disabled = true; }
  } else {
    if (btn) {
      btn.disabled = false;
      btn.innerText = 'Add to Cart';
      btn.onclick = () => {
        if (!currentUser) { openAuth(); return; }
        for (let i = 0; i < currentQty; i++) cart.push(p);
        localStorage.setItem('saforio_cart', JSON.stringify(cart));
        updateCartIcon();

        // Amazon-style button change
        const originalText = btn.innerHTML;
        btn.classList.add('added');
        btn.innerHTML = 'Added to Cart';

        showSideNotification(p);

        setTimeout(() => {
          btn.classList.remove('added');
          btn.innerHTML = originalText;
        }, 3000);
      };
    }
    if (buyBtn) {
      buyBtn.disabled = false;
      buyBtn.onclick = () => {
        if (!currentUser) { openAuth(); return; }
        for (let i = 0; i < currentQty; i++) cart.push(p);
        localStorage.setItem('saforio_cart', JSON.stringify(cart));
        updateCartIcon();
        showToast("Preparing Checkout...", "info", p.name);
        openCheckout();
      };
    }
  }

  // Thumbs — filter out empty/undefined values
  const rawImages = [
    p.image || p.img,
    p.imageHover || p.imgHover || p.image || p.img,
    ...(p.extraImages || [])
  ];
  currentDetailImages = [...new Set(rawImages.filter(u => u && u.trim && u.trim() !== ''))];
  currentDetailIndex = 0;

  if (thumbs) {
    thumbs.innerHTML = currentDetailImages.map((img, i) => {
      const thumbAlt = i === 0
        ? `${p.name} - Front View | ROKEA by RK`
        : `${p.name} - View ${i + 1} | ROKEA by RK`;
      return `<img src="${img}" class="thumb-item ${i === 0 ? 'active' : ''}" ${getSEOAttributes({name: thumbAlt})} onclick="switchDetailImage(${i})" onerror="this.style.display='none'">`;
    }).join('');
  }

  // Swipe Logic
  const visualCont = document.getElementById('mainVisualCont');
  if (visualCont) {
    visualCont.addEventListener('touchstart', e => {
      touchstartX = e.changedTouches[0].screenX;
    }, { passive: true });

    visualCont.addEventListener('touchend', e => {
      touchendX = e.changedTouches[0].screenX;
      handleSwipe();
    }, { passive: true });

    // Premium Interactive Pan-Zoom (Cursor tracking to prevent image cut-off on zoom)
    if (mainImg) {
      visualCont.addEventListener('mousemove', (e) => {
        const rect = visualCont.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;
        mainImg.style.transformOrigin = `${x}% ${y}%`;
      });

      visualCont.addEventListener('mouseleave', () => {
        // Reset to original focus position
        mainImg.style.transformOrigin = 'center 10%';
      });

      // Mobile Touch Move Zoom support
      visualCont.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
          const rect = visualCont.getBoundingClientRect();
          const touch = e.touches[0];
          const x = ((touch.clientX - rect.left) / rect.width) * 100;
          const y = ((touch.clientY - rect.top) / rect.height) * 100;
          mainImg.style.transformOrigin = `${x}% ${y}%`;
        }
      }, { passive: true });
    }
  }

  renderRelatedProducts(p.category, p.id);

  // Update page title
  if (p.name) document.title = p.name + ' — ROKEA by RK';
}

window.switchDetailImage = (index) => {
  currentDetailIndex = index;
  const mainImg = document.getElementById('detailMainImg');
  if (mainImg) {
    mainImg.style.opacity = '0';
    setTimeout(() => {
      mainImg.src = currentDetailImages[currentDetailIndex];
      mainImg.style.opacity = '1';
    }, 200);
  }

  // Update thumbs
  document.querySelectorAll('.thumb-item').forEach((thumb, i) => {
    thumb.classList.toggle('active', i === index);
  });
}

function handleSwipe() {
  if (touchendX < touchstartX - 50) {
    // Swipe Left -> Next Image
    if (currentDetailIndex < currentDetailImages.length - 1) {
      switchDetailImage(currentDetailIndex + 1);
    } else {
      switchDetailImage(0);
    }
  }
  if (touchendX > touchstartX + 50) {
    // Swipe Right -> Prev Image
    if (currentDetailIndex > 0) {
      switchDetailImage(currentDetailIndex - 1);
    } else {
      switchDetailImage(currentDetailImages.length - 1);
    }
  }
}

// Initial Render
renderAll();
updateCartIcon();
updateWishlistIcon();
updateUserUI();

// =============================================
// SPLASH SCREEN LOGIC
// =============================================
document.addEventListener('DOMContentLoaded', () => {
  if (sessionStorage.getItem('openAdmin') === 'true') {
    sessionStorage.removeItem('openAdmin');
    const adminModal = document.getElementById('adminModal');
    if (adminModal) {
      adminModal.style.display = 'flex';
      renderAll();
    }
  }

  const splashScreen = document.getElementById('splashScreen');
  const splashLogo = document.getElementById('splashLogo');
  const navLogoImg = document.getElementById('navLogoImg');

  if (splashScreen && splashLogo && navLogoImg) {
    const hasSplashPlayed = sessionStorage.getItem('splashPlayed') === 'true';

    if (document.getElementById('home') && !hasSplashPlayed) {
      sessionStorage.setItem('splashPlayed', 'true');
      navLogoImg.style.opacity = '0';
      navLogoImg.style.transition = 'opacity 0.5s ease';

      // Strictly prevent scrolling before and during animation
      document.documentElement.style.overflow = 'hidden';
      document.body.style.overflow = 'hidden';

      let splashDone = false;

      const preventScroll = (e) => {
        if (!splashDone) e.preventDefault();
      };

      window.addEventListener('wheel', preventScroll, { passive: false });
      window.addEventListener('touchmove', preventScroll, { passive: false });

      const handleSplash = (e) => {
        if (splashDone) return;

        if (e.type === 'wheel' && e.deltaY <= 0) return;

        splashDone = true;

        // Hide scroll indicator immediately
        const scrollInd = splashScreen.querySelector('.splash-scroll-indicator');
        if (scrollInd) scrollInd.style.opacity = '0';

        const navRect = navLogoImg.getBoundingClientRect();
        const logoRect = splashLogo.getBoundingClientRect();

        const xTranslate = navRect.left + (navRect.width / 2) - (logoRect.left + logoRect.width / 2);
        const yTranslate = navRect.top + (navRect.height / 2) - (logoRect.top + logoRect.height / 2);
        const scale = navRect.width / logoRect.width;

        splashLogo.style.transform = `translate(${xTranslate}px, ${yTranslate}px) scale(${Math.max(scale, 0.2)})`;

        // Wait for the logo to reach the destination
        setTimeout(() => {
          splashLogo.style.opacity = '0';
          navLogoImg.style.transition = 'opacity 0.5s ease';
          navLogoImg.style.opacity = '1';
          splashScreen.classList.add('scrolled');

          // Restore scrolling only after the splash background is gone
          setTimeout(() => {
            document.documentElement.style.overflow = '';
            document.body.style.overflow = '';
            window.removeEventListener('wheel', preventScroll);
            window.removeEventListener('touchmove', preventScroll);
          }, 800);
        }, 950);

        window.removeEventListener('wheel', handleSplash);
        window.removeEventListener('touchmove', handleSplash);
        window.removeEventListener('touchstart', handleSplash);
      };

      window.addEventListener('wheel', handleSplash, { passive: false });
      window.addEventListener('touchmove', handleSplash, { passive: false });
      window.addEventListener('touchstart', handleSplash, { passive: false });
    } else {
      splashScreen.style.display = 'none';
      navLogoImg.style.opacity = '1';
    }
  }
});

// --- FAB INJECTION ---
function injectFABs() {
  if (!document.querySelector('.whatsapp-fab')) {
    const waFAB = document.createElement('a');
    waFAB.href = "https://wa.me/917010394051";
    waFAB.className = "whatsapp-fab";
    waFAB.target = "_blank";
    waFAB.setAttribute('aria-label', 'Chat on WhatsApp');
    waFAB.innerHTML = `
      <svg viewBox="0 0 24 24">
        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
      </svg>
      <div class="whatsapp-tooltip">Chat with us</div>
    `;
    document.body.appendChild(waFAB);
  }
  if (!document.querySelector('.ai-fab')) {
    const aiFAB = document.createElement('a');
    aiFAB.href = "/ai-stylist";
    aiFAB.className = "ai-fab";
    aiFAB.innerHTML = `
      <div class="ai-fab-icon">✦<span class="ai-fab-badge">New</span></div>
      <span class="ai-fab-text">AI Virtual Stylist is Here</span>
    `;
    document.body.appendChild(aiFAB);
  }
}
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectFABs);
} else {
  injectFABs();
}

// Disable right-click & drag on all images to prevent opening them in a new tab (which triggers free-hosting ads)
document.addEventListener('contextmenu', function (e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});
document.addEventListener('dragstart', function (e) {
  if (e.target.tagName === 'IMG') {
    e.preventDefault();
  }
});

// =============================================
// TESTIMONIAL CAROUSEL LOGIC
// =============================================
let currentTestimonialIndex = 0;
let testimonialInterval;

function initTestimonialCarousel() {
  const slides = document.querySelectorAll('.nt-featured-card.slide');
  const dots = document.querySelectorAll('.nt-dot');
  if (slides.length === 0) return;

  function showTestimonial(index) {
    slides.forEach(slide => slide.classList.remove('active'));
    dots.forEach(dot => dot.classList.remove('active'));

    slides[index].classList.add('active');
    if (dots[index]) dots[index].classList.add('active');
    currentTestimonialIndex = index;
  }

  window.nextTestimonial = () => {
    let nextIndex = (currentTestimonialIndex + 1) % slides.length;
    showTestimonial(nextIndex);
    resetTestimonialInterval();
  };

  window.prevTestimonial = () => {
    let prevIndex = (currentTestimonialIndex - 1 + slides.length) % slides.length;
    showTestimonial(prevIndex);
    resetTestimonialInterval();
  };

  window.goToTestimonial = (index) => {
    showTestimonial(index);
    resetTestimonialInterval();
  };

  function resetTestimonialInterval() {
    clearInterval(testimonialInterval);
    testimonialInterval = setInterval(window.nextTestimonial, 5000);
  }

  // Start auto-play
  resetTestimonialInterval();
}

document.addEventListener('DOMContentLoaded', initTestimonialCarousel);
// Custom Blouse Booking Logic
window.openBlouseBooking = () => {
  window.location.href = '/custom-blouse-order';
}

document.addEventListener('DOMContentLoaded', () => {
  const customForm = document.getElementById('customBlouseForm');
  if (customForm) {
    customForm.addEventListener('submit', (e) => {
      e.preventDefault();
      alert('Thank you! Your custom blouse order details have been received. We will contact you shortly on WhatsApp to confirm the order.');
      // Here you would typically send the data to your backend or Firebase
      window.location.href = '/';
    });
  }
});

// =============================================
// TEMPORARY SLUG MIGRATION FROM ADMIN DASHBOARD
// =============================================
window.executeSlugMigration = async () => {
  if (!db) {
    console.error("Firestore DB not found.");
    alert("Firestore DB not found.");
    return;
  }

  const btn = document.getElementById('generateSlugsBtn');
  if (btn) btn.innerText = "Generating...";

  console.log("Starting slug migration from Admin Dashboard...");

  try {
    const snapshot = await db.collection("products").get();
    let updatedCount = 0;
    let skippedCount = 0;

    for (let doc of snapshot.docs) {
      const data = doc.data();
      if (!data.slug) {
        const newSlug = generateSlug(data.name);
        if (newSlug) {
          console.log(`Updating product: ${data.name} -> ${newSlug}`);
          await db.collection("products").doc(doc.id).update({ slug: newSlug });
          updatedCount++;
        } else {
          console.warn(`Could not generate slug for product: ${doc.id}`);
          skippedCount++;
        }
      } else {
        skippedCount++;
      }
    }

    console.log(`Migration Complete! 🎉`);
    console.log(`Updated: ${updatedCount} products.`);
    console.log(`Skipped (already had slug or invalid name): ${skippedCount} products.`);
    alert(`Migration successful! Updated ${updatedCount} products. Check console for details.`);
  } catch (error) {
    console.error("Error during migration:", error);
    alert("Migration failed. Check console for details.");
  } finally {
    if (btn) btn.innerText = "Generate Slugs";
  }
};
