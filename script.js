document.addEventListener("DOMContentLoaded", () => {
    const splashScreen = document.getElementById("splashScreen");
    const splashLogo = document.getElementById("splashLogo");
    const navLogoImg = document.getElementById("navLogoImg");
    
    if (splashScreen && splashLogo && navLogoImg) {
        if (sessionStorage.getItem("splashPlayed") === "true") {
            splashScreen.style.display = "none";
            document.documentElement.style.overflow = "";
            document.body.style.overflow = "";
        } else {
            // Lock body scroll while splash is active and ensure we are at the top
            document.documentElement.style.overflow = "hidden";
            document.body.style.overflow = "hidden";
            window.scrollTo(0, 0);
            
            let hasAnimated = false;
            
            const triggerSplashAnimation = () => {
                if (hasAnimated) return;
                hasAnimated = true;
                
                // Keep the page at the very top during animation
                window.scrollTo(0, 0);
                
                // Get bounding rects
                const splashRect = splashLogo.getBoundingClientRect();
                const navRect = navLogoImg.getBoundingClientRect();
                
                // Calculate center differences
                const splashCenterX = splashRect.left + splashRect.width / 2;
                const splashCenterY = splashRect.top + splashRect.height / 2;
                const navCenterX = navRect.left + navRect.width / 2;
                const navCenterY = navRect.top + navRect.height / 2;
                
                const deltaX = navCenterX - splashCenterX;
                const deltaY = navCenterY - splashCenterY;
                
                const scale = navRect.width / splashRect.width;
                
                // Apply transform for smooth movement to navbar
                splashLogo.style.transform = `translate(${deltaX}px, ${deltaY}px) scale(${scale})`;
                
                // Wait for the logo to finish moving (1s) before revealing the home page
                setTimeout(() => {
                    splashScreen.classList.add("scrolled");
                    sessionStorage.setItem("splashPlayed", "true");
                    
                    // Re-enable scrolling
                    document.documentElement.style.overflow = ""; 
                    document.body.style.overflow = "";
                    
                    // Remove splash screen from DOM after fade out completes
                    setTimeout(() => {
                        splashScreen.style.display = "none";
                    }, 800); // 0.8s matches the CSS transition time for opacity
                }, 1000); 
            };
            
            // Listen to scroll attempts using the 'wheel' and 'touchmove' events 
            // since scrolling is disabled via overflow:hidden
            const handleInteraction = (e) => {
                triggerSplashAnimation();
            };
            
            window.addEventListener("wheel", handleInteraction, { passive: true });
            window.addEventListener("touchmove", handleInteraction, { passive: true });
            
            // Trigger animation on click as well
            splashScreen.addEventListener("click", handleInteraction);
        }
    }
});
