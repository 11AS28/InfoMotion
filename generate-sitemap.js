import fs from 'fs';
import dotenv from 'dotenv';

// Încărcăm variabilele din fișierul .env
dotenv.config();

// Luăm ID-ul proiectului Firebase din .env (ai definit VITE_FIREBASE_PROJECT_ID)
const FIREBASE_PROJECT_ID = process.env.VITE_FIREBASE_PROJECT_ID;

if (!FIREBASE_PROJECT_ID) {
  console.error("❌ Eroare: Nu a fost găsit VITE_FIREBASE_PROJECT_ID în fișierul .env!");
  process.exit(1);
}

// 1. Rutele tale statice
const staticRoutes = [
  '/',
  '/despre',
  '/contact',
  '/lectii',
];

async function generateSitemap() {
  let dynamicRoutes = [];

  try {
    console.log(`⏳ Se preiau lecțiile din baza de date Firebase (${FIREBASE_PROJECT_ID})...`);
    
    // Facem request HTTP către Firebase REST API pentru a lua documentele din colecția "lectii"
    const response = await fetch(`https://firestore.googleapis.com/v1/projects/${FIREBASE_PROJECT_ID}/databases/(default)/documents/lectii`);
    
    if (!response.ok) {
      throw new Error(`HTTP Error! Status: ${response.status}`);
    }

    const data = await response.json();
    
    if (data.documents) {
      dynamicRoutes = data.documents.map(doc => {
        // doc.name are formatul "projects/infomotion-fb819/databases/(default)/documents/lectii/NUME_LECTIE"
        const pathParts = doc.name.split('/');
        const lectieId = pathParts[pathParts.length - 1];
        return `/lectie/${lectieId}`;
      });
    }

    console.log(`✅ Am găsit ${dynamicRoutes.length} lecții în baza de date!`);

  } catch (error) {
    console.error("❌ Eroare la preluarea datelor din Firebase:", error.message);
    console.log("⚠️ Se va genera sitemap doar cu paginile statice.");
  }

  // 3. Combinăm toate rutele
  const allRoutes = [...staticRoutes, ...dynamicRoutes];

  // 4. Construim structura XML pentru Sitemap
  const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes.map(url => `
  <url>
    <loc>https://info-motion.space${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${url === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

  // 5. Salvăm fișierul generat direct în folderul public (de unde Vercel îl va prelua)
  try {
    fs.writeFileSync('./public/sitemap.xml', sitemapContent);
    console.log(`✅ Sitemap generat cu succes! Au fost adăugate ${allRoutes.length} pagini.`);
  } catch (error) {
    console.error("❌ A apărut o eroare la salvarea sitemap-ului:", error);
    process.exit(1);
  }
}

// Rulăm scriptul
generateSitemap();
