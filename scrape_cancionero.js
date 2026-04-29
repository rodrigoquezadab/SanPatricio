/**
 * Scraper para cancionerocatolico.cl
 * Extrae canciones con acordes, letras y clasificación por categorías.
 * Salida: cancionero_data.json
 */

const https = require('https');
const http = require('http');

const BASE = 'https://cancionerocatolico.cl';

// ── Categorías: Momentos de la Misa ──
const MOMENTOS_MISA = {
  'Entrada':            '01 Entrada.html',
  'Perdón':             '02 Perdón.html',
  'Gloria':             '03 Gloria.html',
  'Salmos':             '04 Salmos.html',
  'Aleluya':            '05 Aleluya.html',
  'Leccionales':        '06 Leccionales.html',
  'Ofertorio':          '07 Ofertorio.html',
  'Santo':              '08 Santo.html',
  'Padrenuestro':       '09 Padrenuestro.html',
  'Paz':                '10 Paz.html',
  'Cordero':            '11 Cordero.html',
  'Comunión':           '12 Comunión.html',
  'Espíritu Santo':     '13 Espíritu Santo.html',
  'Salida':             '14 Salida.html',
  'Marianos':           '15 Marianos.html',
  'Rosario':            '16 Rosario.html',
  'Matrimonio':         '17 Matrimonio.html',
  'Liturgias Especiales':'18 Liturgias especiales.html',
  'Agustinianos':       '19 Agustinianos.html',
  'Villancicos':        '20 Villancicos.html',
  'Varios':             '21 Varios.html',
};

// ── Categorías: Tiempos Litúrgicos ──
const TIEMPOS_LITURGICOS = {
  'Adviento':           '31 Adviento.html',
  'Navidad':            '32 Navidad.html',
  'Cuaresma':           '33 Cuaresma.html',
  'Pascua':             '34 Pascua.html',
};

// ── Misa a la Chilena ──
const MISA_CHILENA = {
  'Misa a la Chilena':  '35 Misa a la chilena.html',
};

// ── Utilidades ──
function fetchUrl(url) {
  return new Promise((resolve, reject) => {
    const client = url.startsWith('https') ? https : http;
    client.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
      if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
        return fetchUrl(res.headers.location).then(resolve, reject);
      }
      let data = '';
      res.setEncoding('utf8');
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve(data));
      res.on('error', reject);
    }).on('error', reject);
  });
}

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms));
}

/**
 * Extrae links de canciones de una página de categoría.
 * Cada página de categoría tiene <a href="...">Título</a>
 */
function extractSongLinks(html, categoryFile) {
  const links = [];
  // Determinar la carpeta base de la categoría
  // Las URLs de las canciones son relativas como: Entrada/cancion.html
  const regex = /<a[^>]+href="([^"]+)"[^>]*>([^<]+)<\/a>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    const title = match[2].trim();
    // Filtrar links que no son canciones (como nav links, index, etc.)
    if (href.includes('index.html') || href.includes('crear-programa')) continue;
    // Filtrar links a category pages (start with numbers like 01, 02, etc.)
    if (/^\d{2}\s/.test(decodeURIComponent(href))) continue;
    // Build full URL
    let fullUrl;
    if (href.startsWith('http')) {
      fullUrl = href;
    } else if (href.startsWith('/')) {
      fullUrl = BASE + href;
    } else {
      fullUrl = BASE + '/' + href;
    }
    links.push({ title, url: fullUrl });
  }
  return links;
}

/**
 * Extrae el contenido <pre> de una página de canción.
 * El formato usa <pre> con acordes posicionados sobre las letras.
 */
function extractSongContent(html) {
  // Try to get content from <pre> tags
  const preMatch = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
  if (preMatch) {
    return preMatch[1];
  }
  
  // Some pages might use <div class="song"> or similar
  // Try body content after <h1> or <h2>
  const bodyMatch = html.match(/<body[^>]*>([\s\S]*?)<\/body>/i);
  if (!bodyMatch) return null;
  
  let body = bodyMatch[1];
  // Remove scripts and styles
  body = body.replace(/<script[\s\S]*?<\/script>/gi, '');
  body = body.replace(/<style[\s\S]*?<\/style>/gi, '');
  body = body.replace(/<nav[\s\S]*?<\/nav>/gi, '');
  // Remove HTML tags but preserve line breaks
  body = body.replace(/<br\s*\/?>/gi, '\n');
  body = body.replace(/<\/p>/gi, '\n');
  body = body.replace(/<\/div>/gi, '\n');
  body = body.replace(/<[^>]+>/g, '');
  body = body.replace(/&nbsp;/g, ' ');
  body = body.replace(/&amp;/g, '&');
  body = body.replace(/&lt;/g, '<');
  body = body.replace(/&gt;/g, '>');
  
  return body.trim() || null;
}

/**
 * Extrae el título de la página
 */
function extractTitle(html) {
  const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
  if (titleMatch) return titleMatch[1].trim();
  const h1Match = html.match(/<h1[^>]*>([^<]+)<\/h1>/i);
  if (h1Match) return h1Match[1].trim();
  return null;
}

// ── Main ──
async function main() {
  console.log('🎵 Iniciando scraping de cancionerocatolico.cl...\n');
  
  // Map: songTitle (normalized) -> { title, content, momentos:[], tiempos:[], misaChilena: bool }
  const songMap = new Map();
  
  function normalizeTitle(t) {
    return t.toLowerCase()
      .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9\s]/g, '')
      .trim();
  }
  
  async function processCategory(categoryName, fileName, tagField) {
    const url = `${BASE}/${encodeURIComponent(fileName).replace(/%20/g, '%20')}`;
    // The filenames have spaces, need proper encoding
    const encodedUrl = `${BASE}/${fileName.split('/').map(p => encodeURIComponent(p)).join('/')}`;
    
    console.log(`📂 Procesando categoría: ${categoryName}`);
    let html;
    try {
      html = await fetchUrl(encodedUrl);
    } catch (e) {
      console.error(`   ❌ Error fetching category ${categoryName}: ${e.message}`);
      return;
    }
    
    const songLinks = extractSongLinks(html, fileName);
    console.log(`   Encontradas ${songLinks.length} canciones`);
    
    for (let i = 0; i < songLinks.length; i++) {
      const { title, url: songUrl } = songLinks[i];
      const key = normalizeTitle(title);
      
      // If we already have this song, just add the category tag
      if (songMap.has(key)) {
        const existing = songMap.get(key);
        if (tagField === 'momentos' && !existing.momentos.includes(categoryName)) {
          existing.momentos.push(categoryName);
        } else if (tagField === 'tiempos' && !existing.tiempos.includes(categoryName)) {
          existing.tiempos.push(categoryName);
        } else if (tagField === 'misaChilena') {
          existing.misaChilena = true;
        }
        continue;
      }
      
      // Fetch the song page
      await sleep(150); // Be respectful
      let songHtml;
      try {
        songHtml = await fetchUrl(songUrl);
      } catch (e) {
        console.error(`   ❌ Error fetching song "${title}": ${e.message}`);
        continue;
      }
      
      const content = extractSongContent(songHtml);
      const pageTitle = extractTitle(songHtml) || title;
      
      if (!content) {
        console.warn(`   ⚠️ No content found for "${title}"`);
        continue;
      }
      
      const songData = {
        title: pageTitle,
        content: content,
        momentos: tagField === 'momentos' ? [categoryName] : [],
        tiempos: tagField === 'tiempos' ? [categoryName] : [],
        misaChilena: tagField === 'misaChilena' ? true : false,
      };
      
      songMap.set(key, songData);
      
      if ((i + 1) % 10 === 0) {
        console.log(`   ... ${i + 1}/${songLinks.length} canciones procesadas`);
      }
    }
  }
  
  // Process all Momentos de la Misa categories
  for (const [name, file] of Object.entries(MOMENTOS_MISA)) {
    await processCategory(name, file, 'momentos');
    await sleep(300);
  }
  
  // Process Tiempos Litúrgicos
  for (const [name, file] of Object.entries(TIEMPOS_LITURGICOS)) {
    await processCategory(name, file, 'tiempos');
    await sleep(300);
  }
  
  // Process Misa a la Chilena
  for (const [name, file] of Object.entries(MISA_CHILENA)) {
    await processCategory(name, file, 'misaChilena');
    await sleep(300);
  }
  
  // Convert to array and sort
  const songs = Array.from(songMap.values()).sort((a, b) => 
    a.title.localeCompare(b.title, 'es')
  );
  
  console.log(`\n✅ Total canciones extraídas: ${songs.length}`);
  
  // Write JSON output
  const fs = require('fs');
  const outputPath = require('path').join(__dirname, 'cancionero_data.json');
  fs.writeFileSync(outputPath, JSON.stringify(songs, null, 2), 'utf8');
  console.log(`📄 Datos guardados en: ${outputPath}`);
}

main().catch(err => {
  console.error('Error fatal:', err);
  process.exit(1);
});
