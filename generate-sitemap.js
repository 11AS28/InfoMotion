import fs from 'fs';
import { lessonsData } from './src/lessonsData.js'; 

// 1. Rutele tale statice pe care le dorești indexate
const staticRoutes = [
  '/',
  '/despre',
  '/contact',
  '/lectii',

  // Nu adăugăm rute gen '/auth' sau '/admin' pentru a nu fi indexate de Google
];

// 2. Extragem rutele dinamice din proprietatea "id" a fiecărei lecții
const dynamicRoutes = lessonsData.map(lectie => `/lectie/${lectie.id}`);

// 3. Combinăm toate rutele
const allRoutes = [...staticRoutes, ...dynamicRoutes];

// 4. Construim structura XML pentru Sitemap
const sitemapContent = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${allRoutes.map(url => `
  <url>
    <loc>https://info-motion.vercel.app${url}</loc>
    <changefreq>weekly</changefreq>
    <priority>${url === '/' ? '1.0' : '0.8'}</priority>
  </url>`).join('')}
</urlset>`;

// 5. Salvăm fișierul generat direct în folderul public (de unde Vercel îl va prelua)
try {
  fs.writeFileSync('./public/sitemap.xml', sitemapContent);
  console.log(`✅ Sitemap generat cu succes! Au fost adăugate ${allRoutes.length} pagini (inclusiv ${dynamicRoutes.length} lecții).`);
} catch (error) {
  console.error("❌ A apărut o eroare la salvarea sitemap-ului:", error);
  process.exit(1);
}