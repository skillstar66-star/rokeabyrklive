// Run this script in the browser console when logged in as an Admin
async function migrateMissingSlugs() {
  if (!window.db) {
    console.error("Firestore DB not found. Run this on a page where db is initialized (e.g. index.html).");
    return;
  }

  function generateSlug(text) {
    if (!text) return "";
    return text.toLowerCase().trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }

  console.log("Starting slug migration...");
  
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
    alert(`Migration successful! Updated ${updatedCount} products.`);
  } catch (error) {
    console.error("Error during migration:", error);
    alert("Migration failed. Check console for details.");
  }
}

// Automatically expose it to window so user can call it
window.migrateMissingSlugs = migrateMissingSlugs;
console.log("Migration script loaded. Type migrateMissingSlugs() and hit enter to start.");
