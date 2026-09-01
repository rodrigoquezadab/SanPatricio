const fs = require('fs');
const path = require('path');

// Load scraped data
const songs = JSON.parse(fs.readFileSync(path.join(__dirname, '..', 'data', 'cancionero_data.json'), 'utf8'));

// "Abre tu jardín" PROTECTED content from our current cancionero (REGLA DE ORO)
const ABRE_TU_JARDIN_CONTENT = `<c>MI</c>         <c>FA#m</c> <c>SOL#m</c>         <c>FA#m</c>
Abre tu jardín, traigo una buena noticia;
<c>MI</c>          <c>FA#m</c> <c>SOL#m</c>      <c>FA#m</c>
Novedad sin fin, corramos a recibirla,
<c>LA</c>      <c>SI7</c>  <c>MI</c>
¡ven, levántate!

<c>MI7</c>        <c>LA</c>
Abre tu jardín,
<c>MI</c>                  <c>LA</c> 
pon flores en tu ventana,
<c>MI</c>           <c>LA</c>
Canta una canción,
<c>MI</c>                  <c>LA</c> 
hoy día se murió la muerte;
<c>FA#m</c>       <c>SOL#m</c>   <c>FA#m</c>      <c>SI7</c>
¡es día de fiesta, es día de vida!

<c>MI</c>           <c>LA</c>
No te quedes hoy
<c>MI</c>                  <c>LA</c>
encerrado en tus costumbres,
<c>MI</c>           <c>LA</c>
como en el sillón
<c>MI</c>                 <c>LA</c>
de las antiguas verdades;
<c>FA#m</c>      <c>SOL#m</c>  <c>FA#m</c>      <c>SI7</c>
vive la palabra, luego vivirás.

<c>MI</c>         <c>LA</c>
Vamos por ahí
<c>MI</c>                <c>LA</c>
cantando la buena nueva:
<c>MI</c>        <c>LA</c>
ama de verdad
<c>MI</c>                  <c>LA</c>
como a ti te están amando; 
<c>FA#m</c>          <c>SOL#m</c> <c>FA#m</c>      <c>SI7</c>
nace un nuevo día, ¡ven a renacer!.`;

// Process scraped songs: convert plain-text chord lines to <c> tag format
function processContent(rawContent) {
  const chordPattern = /^[\s]*(([A-G][#b]?(m|maj|min|dim|aug|sus|add|7|9|11|13|\d)*[\/]?[A-G]?[#b]?|DO[#b]?|RE[#b]?|MI[#b]?|FA[#b]?|SOL[#b]?|LA[#b]?|SI[#b]?)(m|M|maj|min|dim|aug|sus|add|7|9|11|13|\d|\/[A-G]|\/DO|\/RE|\/MI|\/FA|\/SOL|\/LA|\/SI)*[\s\-]*)+$/i;
  
  // More precise: a line is "chords only" if every non-whitespace token looks like a chord
  function isChordLine(line) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.length === 0) return false;
    // Remove common non-chord markers
    if (trimmed.startsWith('//') && !trimmed.match(/^\/\/\s*[A-G]/)) return false;
    
    const tokens = trimmed.replace(/\/\//g, ' ').split(/[\s\-]+/).filter(t => t.length > 0);
    if (tokens.length === 0) return false;
    
    const chordRegex = /^(DO|RE|MI|FA|SOL|LA|SI|[A-G])(#|b)?(m|M|maj|min|dim|aug|sus2|sus4|sus|add9|add|7|9|11|13|6|\d)*(\/((DO|RE|MI|FA|SOL|LA|SI|[A-G])(#|b)?))?$/i;
    const nonChordAllowed = ['Intro:', 'intro:', 'Intro', '(', ')', '//', '|', 'x2', 'x3', 'x4', 'bis'];
    
    let chordCount = 0;
    for (const token of tokens) {
      if (nonChordAllowed.includes(token)) continue;
      if (chordRegex.test(token)) {
        chordCount++;
      } else {
        return false;
      }
    }
    return chordCount > 0;
  }

  // Split content into lines, process each
  const lines = rawContent.split('\n');
  const result = [];
  
  for (const line of lines) {
    if (isChordLine(line)) {
      // Convert each chord token to <c> tag, preserving spacing
      let processed = line.replace(/\S+/g, (match) => {
        const chordRegex = /^(DO|RE|MI|FA|SOL|LA|SI|[A-G])(#|b)?(m|M|maj|min|dim|aug|sus2|sus4|sus|add9|add|7|9|11|13|6|\d)*(\/((DO|RE|MI|FA|SOL|LA|SI|[A-G])(#|b)?))?$/i;
        if (chordRegex.test(match)) {
          return `<c>${match}</c>`;
        }
        return match;
      });
      result.push(processed);
    } else {
      // Clean any remaining HTML tags except <b> and </b>
      let cleaned = line.replace(/<(?!\/?b\b)[^>]+>/g, '');
      result.push(cleaned);
    }
  }
  
  return result.join('\n');
}

function slugify(title) {
  return title.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Build song entries - Abre tu jardín first (PROTECTED), then rest alphabetically
const abreIdx = songs.findIndex(s => s.title === 'Abre tu jardín');

// Build final song list
const finalSongs = [];

// #1: Abre tu jardín (PROTECTED - use our version)
const abreData = abreIdx >= 0 ? songs[abreIdx] : { momentos: ['Entrada'], tiempos: [], misaChilena: false };
finalSongs.push({
  title: 'Abre tu jardín',
  slug: 'abre-tu-jardin',
  content: ABRE_TU_JARDIN_CONTENT,
  momentos: abreData.momentos,
  tiempos: abreData.tiempos,
  misaChilena: abreData.misaChilena,
  isProtected: true
});

// Rest of songs (sorted alphabetically, skip "Abre tu jardín")
const rest = songs.filter((_, i) => i !== abreIdx)
  .sort((a, b) => a.title.localeCompare(b.title, 'es'));

for (const song of rest) {
  finalSongs.push({
    title: song.title,
    slug: slugify(song.title),
    content: processContent(song.content),
    momentos: song.momentos,
    tiempos: song.tiempos,
    misaChilena: song.misaChilena,
    isProtected: false
  });
}

console.log(`Total songs for cantos.html: ${finalSongs.length}`);

// Collect all unique category values, ordered by liturgical sequence
const ordenMisa = [
  'Entrada', 'Perdón', 'Gloria', 'Salmos', 'Aleluya', 'Leccionales',
  'Ofertorio', 'Santo', 'Padrenuestro', 'Paz', 'Cordero', 'Comunión',
  'Espíritu Santo', 'Salida',
  // Non-Mass categories at the end
  'Marianos', 'Rosario', 'Matrimonio', 'Liturgias Especiales',
  'Agustinianos', 'Villancicos', 'Varios'
];
const rawMomentos = [...new Set(finalSongs.flatMap(s => s.momentos))];
const allMomentos = rawMomentos.sort((a, b) => {
  const ia = ordenMisa.indexOf(a), ib = ordenMisa.indexOf(b);
  return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
});

const ordenTiempos = ['Adviento', 'Navidad', 'Cuaresma', 'Pascua'];
const rawTiempos = [...new Set(finalSongs.flatMap(s => s.tiempos))];
const allTiempos = rawTiempos.sort((a, b) => {
  const ia = ordenTiempos.indexOf(a), ib = ordenTiempos.indexOf(b);
  return (ia === -1 ? 999 : ia) - (ib === -1 ? 999 : ib);
});

// Read components
const menuHtml = fs.readFileSync(path.join(__dirname, '..', 'components', 'menu.html'), 'utf8');
const footerHtml = fs.readFileSync(path.join(__dirname, '..', 'components', 'footer.html'), 'utf8');

// Build HTML
const html = `<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parroquia San Patricio - Cancionero</title>
    <meta name="description" content="Cancionero litúrgico de la Parroquia San Patricio con acordes y letras. Filtrado por momentos de la misa y tiempos litúrgicos.">
    <link rel="canonical" href="https://rodrigoquezadab.github.io/SanPatricio/cantos.html">
    <meta property="og:title" content="Parroquia San Patricio - Cancionero">
    <meta property="og:description" content="Cancionero litúrgico de la Parroquia San Patricio con acordes y letras. Filtrado por momentos de la misa y tiempos litúrgicos.">
    <meta property="og:type" content="website">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>tailwind.config = { theme: { extend: { colors: { arena: '#F3E5DC', verdeSanPatricio: '#16A34A', negro: '#000000' } } } }</script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <link rel="stylesheet" href="styles.css">
</head>
<body>
<div id="menu-container">
${menuHtml}
</div>

<main class="container mx-auto px-4 py-8 space-y-6">
    <h2 class="text-3xl mb-2 text-center"><i class="fas fa-music mr-2"></i>Cancionero</h2>
    <p class="text-center text-gray-600 text-sm mb-4">${finalSongs.length}     <!-- Sticky Search Bar -->
    <div id="sticky-search-container" class="sticky top-[58px] z-40 bg-[#F3E5DC]/95 backdrop-blur-md py-3 -mx-4 px-4 shadow-sm border-b border-stone-300 mb-4 transition-all">
        <div class="relative max-w-xl mx-auto">
            <div class="relative">
                <i class="fas fa-search absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 text-base pointer-events-none"></i>
                <input type="text" id="search-input" class="w-full pl-11 pr-10 py-2.5 rounded-xl border border-gray-300 bg-white shadow-sm focus:outline-none focus:ring-2 focus:ring-verdeSanPatricio focus:border-transparent text-base" placeholder="Buscar por título o fragmento de la letra..." autocomplete="off">
                <button id="clear-search-btn" onclick="clearSearchInput()" class="hidden absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-700 p-1 transition-colors" title="Borrar búsqueda">
                    <i class="fas fa-times-circle text-lg"></i>
                </button>
            </div>
            <!-- Dynamic Suggestions Dropdown -->
            <div id="search-suggestions" class="hidden absolute left-0 right-0 top-full mt-1.5 bg-white rounded-xl shadow-2xl border border-gray-200 overflow-hidden z-50 max-h-80 overflow-y-auto divide-y divide-gray-100">
            </div>
        </div>
    </div>

    <!-- Filters -->
    <div id="filters-panel" class="card mb-4 space-y-3">
        <div class="flex items-center justify-between mb-2">
            <h3 class="text-lg"><i class="fas fa-filter mr-1"></i>Filtros</h3>
            <button onclick="clearFilters()" class="text-sm text-red-500 hover:underline">Limpiar filtros</button>
        </div>
        <details open>
            <summary class="filter-label cursor-pointer mb-1"><i class="fas fa-church mr-1"></i>Momentos de la Misa</summary>
            <div class="filter-section mt-1" id="filter-momentos">
${allMomentos.map(m => `                <button class="filter-btn" data-type="momento" data-value="${m}">${m}</button>`).join('\n')}
            </div>
        </details>
        <details>
            <summary class="filter-label cursor-pointer mb-1"><i class="fas fa-calendar-alt mr-1"></i>Tiempos Litúrgicos</summary>
            <div class="filter-section mt-1" id="filter-tiempos">
${allTiempos.map(t => `                <button class="filter-btn" data-type="tiempo" data-value="${t}">${t}</button>`).join('\n')}
            </div>
        </details>
        <details>
            <summary class="filter-label cursor-pointer mb-1"><i class="fas fa-flag mr-1"></i>Misa a la Chilena</summary>
            <div class="filter-section mt-1">
                <button class="filter-btn" data-type="chilena" data-value="1">Misa a la Chilena</button>
            </div>
        </details>
    </div>

    <!-- Song Index -->
    <div id="indice" class="card mb-6">
        <h3 class="text-xl mb-3 border-b pb-2"><i class="fas fa-list-ol mr-2 text-verdeSanPatricio"></i>Índice de Canciones <span id="song-count" class="text-sm font-normal text-gray-500"></span></h3>
        <div class="index-grid" id="index-grid">
${finalSongs.map(s => `            <a href="#${s.slug}" class="index-link" data-slug="${s.slug}" onclick="showSingleSong(event, '${s.slug}')">
                <span class="index-title font-medium">${s.title}</span>
                <span class="index-snippet hidden text-xs text-gray-500 italic block mt-0.5"></span>
            </a>`).join('\n')}
        </div>
    </div>

    <!-- Welcome message (shown when no filter active) -->
    <div id="welcome-msg" class="card mb-6 text-center py-10">
        <i class="fas fa-hand-pointer text-5xl text-verdeSanPatricio mb-4 block"></i>
        <h3 class="text-xl mb-2">Selecciona una canción o filtro</h3>
        <p class="text-gray-500">Usa los <strong>filtros</strong> de arriba, la <strong>barra de búsqueda</strong>, o haz clic en una canción del <strong>índice</strong> para comenzar.</p>
    </div>

    <!-- Songs -->
${finalSongs.map(s => {
  const cats = JSON.stringify({m: s.momentos, l: s.tiempos, ch: s.misaChilena ? 1 : 0}).replace(/"/g, '&quot;');
  return `    <div class="card mb-6 song-card hidden-filter" id="${s.slug}" data-cats='${JSON.stringify({m:s.momentos,l:s.tiempos,ch:s.misaChilena?1:0})}' data-title="${s.title.replace(/"/g, '&quot;').toLowerCase()}">
        <div class="flex items-center justify-between border-b pb-2 mb-3 gap-2 flex-wrap">
            <h3 class="text-xl text-verdeSanPatricio font-bold">${s.title}</h3>
            <button onclick="closeSong()" class="text-xs bg-stone-100 hover:bg-stone-200 text-stone-700 px-3 py-1.5 rounded-lg border border-stone-300 transition-colors flex items-center gap-1.5 shadow-sm font-medium cursor-pointer" title="Cerrar y volver al buscador">
                <i class="fas fa-search text-verdeSanPatricio"></i> <span>Buscar otra canción</span>
            </button>
        </div>
        <div class="flex flex-wrap gap-2 mb-3 text-sm text-gray-700">
            <button onclick="toggleChords(this)" class="bg-arena hover:bg-gray-200 px-3 py-1 rounded border border-gray-300 transition-colors flex items-center">
                <i class="fas fa-eye-slash mr-1"></i> <span class="btn-text">Ocultar Acordes</span>
            </button>
            <button onclick="toggleNotation(this)" class="bg-arena hover:bg-gray-200 px-3 py-1 rounded border border-gray-300 transition-colors flex items-center">
                <i class="fas fa-music mr-1"></i> <span class="btn-text">Do / C</span>
            </button>
            <div class="flex items-center bg-arena rounded border border-gray-300 overflow-hidden">
                <button onclick="transpose(this, -1)" class="hover:bg-gray-200 px-3 py-1 font-bold border-r border-gray-300">-</button>
                <span class="tono-display px-2 font-semibold cursor-pointer" title="Clic para volver al tono original" onclick="resetTranspose(this)">Tono</span>
                <button onclick="transpose(this, 1)" class="hover:bg-gray-200 px-3 py-1 font-bold border-l border-gray-300">+</button>
            </div>
        </div>
${s.momentos.length || s.tiempos.length || s.misaChilena ? `        <div class="flex flex-wrap gap-1 mb-3">${s.momentos.map(m=>`<span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full font-medium">${m}</span>`).join('')}${s.tiempos.map(t=>`<span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full font-medium">${t}</span>`).join('')}${s.misaChilena?'<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full font-medium">Misa a la Chilena</span>':''}</div>` : ''}
        <pre class="song-pre">${s.content}</pre>
        <div class="mt-4 pt-3 border-t border-stone-200 flex items-center justify-between text-xs text-gray-500 flex-wrap gap-2">
            <button onclick="closeSong()" class="bg-verdeSanPatricio/10 hover:bg-verdeSanPatricio/20 text-verdeSanPatricio font-semibold px-3.5 py-2 rounded-xl transition flex items-center gap-1.5 cursor-pointer">
                <i class="fas fa-search"></i> <span>Buscar otra canción</span>
            </button>
            <button onclick="window.scrollTo({top: 0, behavior: 'smooth'})" class="text-stone-500 hover:text-stone-800 hover:underline flex items-center gap-1 cursor-pointer">
                <i class="fas fa-arrow-up"></i> <span>Volver arriba</span>
            </button>
        </div>
    </div>`;
}).join('\n')}
</main>

<div id="footer-container">
${footerHtml}
</div>
<script src="components.js?v=4"></script>
<script>
// ── Audio ──
let audioCtx;
function initAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();}
function playChord(cs){initAudio();let m=cs.match(/^(Do|Re|Mi|Fa|Sol|La|Si|C|D|E|F|G|A|B)(#|b)?(.*)/i);if(!m)return;let nn=m[1],ac=m[2]||'',mo=m[3]||'';const nsL={'do':60,'re':62,'mi':64,'fa':65,'sol':67,'la':69,'si':71};const nsA={'c':60,'d':62,'e':64,'f':65,'g':67,'a':69,'b':71};let mi=nsL[nn.toLowerCase()]||nsA[nn.toLowerCase()];if(!mi)return;if(ac==='#')mi+=1;if(ac==='b')mi-=1;let iv=[0,4,7];let md=mo.toLowerCase();if(md.includes('m')&&!md.includes('maj'))iv[1]=3;if(md.includes('dim')){iv[1]=3;iv[2]=6;}else if(md.includes('aug'))iv[2]=8;if(md.includes('maj7'))iv.push(11);else if(md.includes('7'))iv.push(10);const t=audioCtx.currentTime;iv.forEach((interval,idx)=>{let f=Math.pow(2,(mi+interval-69)/12)*440;let o1=audioCtx.createOscillator(),o2=audioCtx.createOscillator(),g=audioCtx.createGain();o1.type='triangle';o2.type='sine';o1.frequency.setValueAtTime(f,t);o2.frequency.setValueAtTime(f*1.002,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.12,t+0.05);g.gain.exponentialRampToValueAtTime(0.001,t+2);o1.connect(g);o2.connect(g);g.connect(audioCtx.destination);let d=idx*0.03;o1.start(t+d);o2.start(t+d);o1.stop(t+d+2);o2.stop(t+d+2);});}

// ── Process <c> tags for click-to-play ──
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('c').forEach(ct=>{if(ct.dataset.p)return;ct.dataset.p="1";const ws=ct.textContent.split(/(\\s+)/);ct.innerHTML='';ws.forEach(w=>{if(!w.trim()){ct.appendChild(document.createTextNode(w));}else{const sp=document.createElement('span');sp.textContent=w;sp.style.cursor='pointer';sp.title='Toca para escuchar';sp.className='hover:text-red-400 hover:underline transition-colors';sp.onclick=function(){playChord(this.innerText)};ct.appendChild(sp);}});});});

// ── Notation ──
const nL=['Do','Do#','Re','Re#','Mi','Fa','Fa#','Sol','Sol#','La','La#','Si'];
const nA=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const eq={'Dob':'Si','Reb':'Do#','Mib':'Re#','Fab':'Mi','Solb':'Fa#','Lab':'Sol#','Sib':'La#','Cb':'B','Db':'C#','Eb':'D#','Fb':'E','Gb':'F#','Ab':'G#','Bb':'A#'};
function pN(s){
  let slashIdx = s.indexOf('/');
  let main = slashIdx > 0 ? s.substring(0, slashIdx) : s;
  let bass = slashIdx > 0 ? s.substring(slashIdx + 1) : null;
  let m = main.match(/^(Do|Re|Mi|Fa|Sol|La|Si|C|D|E|F|G|A|B)(#|b)?(.*)/i);
  if(!m) return null;
  let b = m[1].charAt(0).toUpperCase() + m[1].slice(1).toLowerCase();
  let fn = b + (m[2]||'');
  if(eq[fn]) fn = eq[fn];
  let i = nL.indexOf(fn), tp = 'lat';
  if(i === -1){ i = nA.indexOf(fn); tp = 'ang'; }
  let bassIdx = -1;
  if(bass){
    let bm = bass.match(/^(Do|Re|Mi|Fa|Sol|La|Si|C|D|E|F|G|A|B)(#|b)?/i);
    if(bm){
      let bb = bm[1].charAt(0).toUpperCase() + bm[1].slice(1).toLowerCase();
      let bfn = bb + (bm[2]||'');
      if(eq[bfn]) bfn = eq[bfn];
      bassIdx = nL.indexOf(bfn);
      if(bassIdx === -1) bassIdx = nA.indexOf(bfn);
    }
  }
  return {idx: i, type: tp, mod: m[3]||'', bassIdx: bassIdx, hasBass: bass !== null};
}
function fN(i, tp, mo, bassIdx){
  i = (i % 12 + 12) % 12;
  let result = (tp === 'ang' ? nA[i] : nL[i]) + mo;
  if(bassIdx !== undefined && bassIdx !== -1){
    bassIdx = (bassIdx % 12 + 12) % 12;
    result += '/' + (tp === 'ang' ? nA[bassIdx] : nL[bassIdx]);
  }
  return result;
}
function toggleChords(b){let c=b.closest('.card'),p=c.querySelector('pre'),bt=b.querySelector('.btn-text'),ic=b.querySelector('i');if(p.classList.contains('acordes-ocultos')){p.classList.remove('acordes-ocultos');bt.innerText='Ocultar Acordes';ic.className='fas fa-eye-slash mr-1';c.querySelectorAll('c').forEach(x=>x.style.display='');}else{p.classList.add('acordes-ocultos');bt.innerText='Mostrar Acordes';ic.className='fas fa-eye mr-1';c.querySelectorAll('c').forEach(x=>x.style.display='none');}}
function toggleNotation(b){let c=b.closest('.card'),sp=c.querySelectorAll('c span'),isA=c.dataset.notation==='anglo',tt=isA?'lat':'ang';c.dataset.notation=tt==='ang'?'anglo':'latina';b.querySelector('.btn-text').innerText=isA?'Do / C':'C / Do';sp.forEach(s=>{let p=pN(s.innerText);if(p&&p.idx!==-1)s.innerText=fN(p.idx,tt,p.mod,p.hasBass?p.bassIdx:undefined);});}
function transpose(b,st){let c=b.closest('.card');let cur=parseInt(c.dataset.transSteps||'0');cur+=st;c.dataset.transSteps=cur;let disp=c.querySelector('.tono-display');if(disp){if(cur===0){disp.textContent='Tono';disp.style.color='';}else{disp.textContent=(cur>0?'+':'')+cur;disp.style.color=cur!==0?'#dc2626':'';}}c.querySelectorAll('c span').forEach(s=>{let p=pN(s.innerText);if(p&&p.idx!==-1)s.innerText=fN(p.idx+st,p.type,p.mod,p.hasBass?p.bassIdx+st:undefined);});}
function resetTranspose(b){let c=b.closest('.card');let cur=parseInt(c.dataset.transSteps||'0');if(cur===0)return;let rev=-cur;c.dataset.transSteps='0';b.textContent='Tono';b.style.color='';c.querySelectorAll('c span').forEach(s=>{let p=pN(s.innerText);if(p&&p.idx!==-1)s.innerText=fN(p.idx+rev,p.type,p.mod,p.hasBass?p.bassIdx+rev:undefined);});}

// ── Filtering & Advanced Search ──
let activeFilters = { momento: null, tiempo: null, chilena: null };

document.querySelectorAll('.filter-btn').forEach(btn => {
    btn.addEventListener('click', () => {
        const type = btn.dataset.type;
        const value = btn.dataset.value;
        const wasActive = activeFilters[type] === value;
        // Deselect ALL filters across all categories
        activeFilters = { momento: null, tiempo: null, chilena: null };
        document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
        // If it wasn't already active, activate this one
        if (!wasActive) {
            activeFilters[type] = value;
            btn.classList.add('active');
        }
        applyFilters();
    });
});

let songIndexCache = [];
let focusedSuggestionIndex = -1;

function normalizeText(str) {
    return (str || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\\u0300-\\u036f]/g, '')
        .replace(/[^a-z0-9\\s]/g, ' ')
        .replace(/\\s+/g, ' ')
        .trim();
}

function phoneticClean(str) {
    return (str || '')
        .replace(/h/g, '')
        .replace(/v/g, 'b')
        .replace(/z/g, 's')
        .replace(/c(?=[ei])/g, 's')
        .replace(/qu(?=[ei])/g, 'k')
        .replace(/c(?=[aou])/g, 'k')
        .replace(/g(?=[ei])/g, 'j')
        .replace(/ll/g, 'y')
        .replace(/(.)\\1+/g, '$1');
}

function levenshtein(a, b) {
    if (a === b) return 0;
    const la = a.length, lb = b.length;
    if (la === 0) return lb;
    if (lb === 0) return la;
    let prev = new Array(lb + 1);
    let curr = new Array(lb + 1);
    for (let j = 0; j <= lb; j++) prev[j] = j;
    for (let i = 1; i <= la; i++) {
        curr[0] = i;
        const ca = a.charCodeAt(i - 1);
        for (let j = 1; j <= lb; j++) {
            const cost = ca === b.charCodeAt(j - 1) ? 0 : 1;
            curr[j] = Math.min(prev[j] + 1, curr[j - 1] + 1, prev[j - 1] + cost);
        }
        for (let j = 0; j <= lb; j++) prev[j] = curr[j];
    }
    return curr[lb];
}

function fastWordSimilarity(qToken, tToken) {
    if (qToken.norm === tToken.norm) return 1.0;
    if (tToken.norm.startsWith(qToken.norm) && qToken.norm.length >= 3) {
        return (qToken.norm.length / tToken.norm.length) * 0.95;
    }
    if (qToken.phon === tToken.phon) return 0.92;
    if (tToken.phon.startsWith(qToken.phon) && qToken.phon.length >= 3) return 0.88;
    
    if (Math.abs(qToken.norm.length - tToken.norm.length) > 2) return 0.0;
    
    const maxLen = Math.max(qToken.norm.length, tToken.norm.length);
    const maxAllowedDist = maxLen <= 3 ? 0 : (maxLen <= 6 ? 1 : 2);
    const d = levenshtein(qToken.norm, tToken.norm);
    if (d <= maxAllowedDist) {
        return 1.0 - (d / (maxLen + 1));
    }
    return 0.0;
}

function escapeHtml(str) {
    if (!str) return '';
    return str
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#039;');
}

function highlightFuzzyMatch(rawText, queryTokens) {
    if (!rawText || !queryTokens || queryTokens.length === 0) return escapeHtml(rawText);
    
    const tokens = rawText.split(/([\\s,.;:!?¡¿()"\-]+)/);
    const matchedTokens = new Set();
    
    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (!token.trim() || token.match(/^[\\s,.;:!?¡¿()"\-]+$/)) continue;
        const normToken = normalizeText(token);
        if (!normToken) continue;
        const tTok = { norm: normToken, phon: phoneticClean(normToken) };
        
        for (let q = 0; q < queryTokens.length; q++) {
            if (fastWordSimilarity(queryTokens[q], tTok) >= 0.70) {
                matchedTokens.add(i);
                break;
            }
        }
    }
    
    let result = '';
    let inMark = false;
    
    for (let i = 0; i < tokens.length; i++) {
        const isMatch = matchedTokens.has(i);
        const token = tokens[i];
        
        if (isMatch) {
            if (!inMark) {
                result += '<mark class="bg-amber-200 text-amber-950 px-1 py-0.5 rounded font-semibold">';
                inMark = true;
            }
            result += escapeHtml(token);
        } else {
            if (inMark) {
                if (token.match(/^\\s+$/) && i + 1 < tokens.length && matchedTokens.has(i + 1)) {
                    result += escapeHtml(token);
                    continue;
                }
                result += '</mark>';
                inMark = false;
            }
            result += escapeHtml(token);
        }
    }
    if (inMark) result += '</mark>';
    return result;
}

function initSearchIndex() {
    songIndexCache = [];
    document.querySelectorAll('.song-card').forEach(card => {
        const slug = card.id;
        const rawTitle = card.querySelector('h3') ? card.querySelector('h3').textContent.trim() : (card.dataset.title || '');
        const titleNorm = normalizeText(rawTitle);
        const titleTokens = titleNorm.split(' ').filter(Boolean).map(w => ({
            norm: w,
            phon: phoneticClean(w),
            len: w.length
        }));
        
        const pre = card.querySelector('.song-pre');
        let rawLines = [];
        if (pre) {
            const clone = pre.cloneNode(true);
            clone.querySelectorAll('c').forEach(c => c.remove());
            const cleanText = clone.textContent || '';
            rawLines = cleanText.split('\\n')
                .map(l => l.replace(/\\/\\//g, '').replace(/x\\d+/gi, '').replace(/\\bbis\\b/gi, '').trim())
                .filter(l => l.length > 0 && !l.match(/^(intro:|estrofa|coro|final:|puente:)/i));
        }

        const linesNorm = rawLines.map(l => normalizeText(l));
        const linesTokens = linesNorm.map(l => l.split(' ').filter(Boolean).map(w => ({
            norm: w,
            phon: phoneticClean(w),
            len: w.length
        })));
        const fullLyricsNorm = linesNorm.join(' ');
        
        let cats = { m: [], l: [], ch: 0 };
        try { cats = JSON.parse(card.dataset.cats); } catch(e) {}
        
        songIndexCache.push({
            slug: slug,
            rawTitle: rawTitle,
            titleNorm: titleNorm,
            titleTokens: titleTokens,
            rawLines: rawLines,
            linesNorm: linesNorm,
            linesTokens: linesTokens,
            fullLyricsNorm: fullLyricsNorm,
            cats: cats
        });
    });
}

function clearSearchInput() {
    const input = document.getElementById('search-input');
    input.value = '';
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) clearBtn.classList.add('hidden');
    hideSuggestions();
    input.focus();
    applyFilters();
}

function clearFilters() {
    activeFilters = { momento: null, tiempo: null, chilena: null };
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    const input = document.getElementById('search-input');
    input.value = '';
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) clearBtn.classList.add('hidden');
    hideSuggestions();
    applyFilters();
}

function hasActiveFilter() {
    const input = document.getElementById('search-input');
    const search = input ? input.value.trim() : '';
    return search.length > 0 || activeFilters.momento || activeFilters.tiempo || activeFilters.chilena;
}

function hideSuggestions() {
    const container = document.getElementById('search-suggestions');
    if (container) {
        container.classList.add('hidden');
        container.innerHTML = '';
        focusedSuggestionIndex = -1;
    }
}

function renderSuggestions(queryTokens, matches) {
    const container = document.getElementById('search-suggestions');
    if (!container) return;

    if (!queryTokens || queryTokens.length === 0 || matches.length === 0) {
        hideSuggestions();
        return;
    }

    focusedSuggestionIndex = -1;
    const topMatches = matches.slice(0, 7);
    
    let html = '';
    topMatches.forEach((item, idx) => {
        const highlightedTitle = highlightFuzzyMatch(item.rawTitle, queryTokens);
        let badgeHtml = '';
        if (item.cats.m && item.cats.m.length > 0) {
            badgeHtml += \`<span class="text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded-full font-medium">\${escapeHtml(item.cats.m[0])}</span>\`;
        } else if (item.cats.l && item.cats.l.length > 0) {
            badgeHtml += \`<span class="text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded-full font-medium">\${escapeHtml(item.cats.l[0])}</span>\`;
        }

        let snippetHtml = '';
        if (item.matchedLine) {
            snippetHtml = highlightFuzzyMatch(item.matchedLine, queryTokens);
        }

        html += \`
        <div class="suggestion-item px-4 py-2.5 hover:bg-emerald-50 cursor-pointer transition-colors flex flex-col gap-0.5 select-none \${idx === 0 ? 'bg-stone-50/50' : ''}" data-slug="\${item.slug}" onclick="selectSuggestion('\${item.slug}')">
            <div class="flex items-center justify-between">
                <div class="font-medium text-gray-900 text-sm flex items-center gap-2">
                    <i class="fas fa-music text-verdeSanPatricio text-xs"></i>
                    <span>\${highlightedTitle}</span>
                    \${item.matchType === 'title' ? '<span class="text-[10px] font-semibold text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded">Título</span>' : ''}
                </div>
                <div class="flex items-center gap-1">
                    \${badgeHtml}
                </div>
            </div>
            \${snippetHtml ? \`
            <div class="text-xs text-gray-500 pl-4 flex items-start gap-1.5 mt-0.5">
                <i class="fas fa-quote-left text-[9px] text-stone-400 mt-0.5 flex-shrink-0"></i>
                <span class="line-clamp-1 italic text-stone-600">\${snippetHtml}</span>
            </div>
            \` : ''}
        </div>\`;
    });

    if (matches.length > topMatches.length) {
        html += \`<div class="px-4 py-2 text-center text-xs text-gray-500 bg-gray-50 font-medium">Ver las \${matches.length} coincidencias en el índice abajo ↓</div>\`;
    }

    container.innerHTML = html;
    container.classList.remove('hidden');
}

function selectSuggestion(slug) {
    hideSuggestions();
    showSingleSong(null, slug);
}

function applyFilters() {
    const rawSearch = document.getElementById('search-input').value.trim();
    const clearBtn = document.getElementById('clear-search-btn');
    if (clearBtn) {
        if (rawSearch.length > 0) clearBtn.classList.remove('hidden');
        else clearBtn.classList.add('hidden');
    }

    const searchNorm = normalizeText(rawSearch);
    const searchWords = searchNorm ? searchNorm.split(' ').filter(Boolean) : [];
    const queryTokens = searchWords.map(w => ({
        norm: w,
        phon: phoneticClean(w),
        len: w.length
    }));

    const welcomeMsg = document.getElementById('welcome-msg');
    const filtersActive = hasActiveFilter();
    let visible = 0;
    
    if (welcomeMsg) welcomeMsg.style.display = filtersActive ? 'none' : '';
    
    document.querySelectorAll('.song-card').forEach((card) => card.classList.add('hidden-filter'));
    
    const matchingSlugsMap = new Map();
    const matchesForSuggestions = [];

    for (let i = 0; i < songIndexCache.length; i++) {
        const item = songIndexCache[i];
        let matches = true;
        
        if (filtersActive) {
            if (activeFilters.momento && !item.cats.m.includes(activeFilters.momento)) matches = false;
            if (matches && activeFilters.tiempo && !item.cats.l.includes(activeFilters.tiempo)) matches = false;
            if (matches && activeFilters.chilena && !item.cats.ch) matches = false;
            
            if (matches && searchNorm) {
                let matchScore = 0;
                let matchedLine = '';
                let matchType = 'lyrics';

                // 1. Exact Title match
                if (item.titleNorm.includes(searchNorm)) {
                    matchScore = 10.0 + (item.titleNorm === searchNorm ? 5 : 0);
                    matchType = 'title';
                }
                // 2. Exact Lyrics substring match
                else if (item.fullLyricsNorm.includes(searchNorm)) {
                    matchScore = 6.0;
                    for (let l = 0; l < item.linesNorm.length; l++) {
                        if (item.linesNorm[l].includes(searchNorm)) {
                            matchedLine = item.rawLines[l];
                            break;
                        }
                    }
                } else {
                    // 3. Fuzzy Title Match
                    let titleMatchCount = 0;
                    let titleScore = 0;
                    for (let q = 0; q < queryTokens.length; q++) {
                        const qw = queryTokens[q];
                        let bestSim = 0;
                        for (let t = 0; t < item.titleTokens.length; t++) {
                            const sim = fastWordSimilarity(qw, item.titleTokens[t]);
                            if (sim > bestSim) bestSim = sim;
                        }
                        if (bestSim >= 0.70) {
                            titleScore += bestSim;
                            titleMatchCount++;
                        }
                    }
                    const titleCoverage = titleMatchCount / queryTokens.length;
                    if (titleCoverage >= 0.60 && titleScore >= 0.70) {
                        matchScore = 4.0 + (titleScore / queryTokens.length) + titleCoverage;
                        matchType = 'title';
                    }

                    // 4. Fuzzy Lyrics Phrase Match (Phrase-level prioritizes overall sentence above minor letter typos)
                    let bestLineScore = 0;
                    let bestMatchedLine = '';
                    
                    for (let l = 0; l < item.linesTokens.length; l++) {
                        const lineTokens = item.linesTokens[l];
                        if (lineTokens.length === 0) continue;
                        
                        let lineMatchCount = 0;
                        let lineTotalSim = 0;
                        let matchedIndices = [];
                        
                        for (let q = 0; q < queryTokens.length; q++) {
                            const qw = queryTokens[q];
                            let bestSim = 0;
                            let bestIdx = -1;
                            for (let t = 0; t < lineTokens.length; t++) {
                                const sim = fastWordSimilarity(qw, lineTokens[t]);
                                if (sim > bestSim) {
                                    bestSim = sim;
                                    bestIdx = t;
                                }
                            }
                            if (bestSim >= 0.70) {
                                lineTotalSim += bestSim;
                                lineMatchCount++;
                                matchedIndices.push(bestIdx);
                            }
                        }
                        
                        const coverage = lineMatchCount / queryTokens.length;
                        if (coverage >= 0.50) {
                            let orderBonus = 0;
                            if (matchedIndices.length > 1) {
                                let inOrder = true;
                                for (let k = 1; k < matchedIndices.length; k++) {
                                    if (matchedIndices[k] <= matchedIndices[k - 1]) inOrder = false;
                                }
                                if (inOrder) orderBonus = 0.25;
                            }
                            
                            const currentScore = (lineTotalSim / queryTokens.length * 0.7) + (coverage * 0.3) + orderBonus;
                            if (currentScore > bestLineScore) {
                                bestLineScore = currentScore;
                                bestMatchedLine = item.rawLines[l];
                            }
                        }
                    }

                    if (bestLineScore > matchScore && bestLineScore >= 0.60) {
                        matchScore = bestLineScore;
                        matchedLine = bestMatchedLine;
                        matchType = 'lyrics';
                    }
                }

                if (matchScore <= 0) {
                    matches = false;
                } else {
                    const matchInfo = {
                        slug: item.slug,
                        rawTitle: item.rawTitle,
                        matchType: matchType,
                        matchedLine: matchedLine,
                        cats: item.cats,
                        score: matchScore
                    };
                    matchingSlugsMap.set(item.slug, matchInfo);
                    matchesForSuggestions.push(matchInfo);
                }
            }
        }
        
        if (matches && !searchNorm) {
            matchingSlugsMap.set(item.slug, { matchType: 'all', matchedLine: '' });
        }
    }

    if (searchNorm) {
        matchesForSuggestions.sort((a, b) => b.score - a.score || a.rawTitle.localeCompare(b.rawTitle, 'es'));
        renderSuggestions(queryTokens, matchesForSuggestions);
    } else {
        hideSuggestions();
    }
    
    // Filter the INDEX links and update snippets
    document.querySelectorAll('.index-link').forEach((link) => {
        const slug = link.dataset.slug;
        const matchInfo = matchingSlugsMap.get(slug);
        const matches = !filtersActive || !!matchInfo;
        link.style.display = matches ? '' : 'none';
        
        const snippetEl = link.querySelector('.index-snippet');
        if (snippetEl) {
            if (matches && searchNorm && matchInfo && matchInfo.matchedLine) {
                snippetEl.innerHTML = highlightFuzzyMatch(matchInfo.matchedLine, queryTokens);
                snippetEl.classList.remove('hidden');
            } else {
                snippetEl.classList.add('hidden');
                snippetEl.textContent = '';
            }
        }

        if (matches) visible++;
    });
    
    document.getElementById('song-count').textContent = filtersActive ? \`(\${visible} de ${finalSongs.length})\` : \`(${finalSongs.length})\`;
}

function showSingleSong(event, slug) {
    if (event && event.preventDefault) event.preventDefault();
    hideSuggestions();
    
    const welcomeMsg = document.getElementById('welcome-msg');
    if (welcomeMsg) welcomeMsg.style.display = 'none';
    
    // Explicitly hide ALL song cards so only the selected one is rendered
    document.querySelectorAll('.song-card').forEach(c => c.classList.add('hidden-filter'));
    const target = document.getElementById(slug);
    if (target) {
        target.classList.remove('hidden-filter');
        
        const headerOffset = 135;
        const elementPosition = target.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        window.scrollTo({
            top: offsetPosition,
            behavior: 'smooth'
        });
    }
}

function closeSong() {
    // Hide all song cards and return directly to search bar
    document.querySelectorAll('.song-card').forEach(c => c.classList.add('hidden-filter'));
    const welcomeMsg = document.getElementById('welcome-msg');
    if (welcomeMsg && !hasActiveFilter()) {
        welcomeMsg.style.display = '';
    }
    const input = document.getElementById('search-input');
    if (input) {
        const searchContainer = document.getElementById('sticky-search-container');
        if (searchContainer) {
            const elementPosition = searchContainer.getBoundingClientRect().top;
            const offsetPosition = elementPosition + window.pageYOffset - 70;
            window.scrollTo({ top: Math.max(0, offsetPosition), behavior: 'smooth' });
        }
        input.focus();
        input.select();
    }
}

window.addEventListener('hashchange', () => {
    const hash = window.location.hash.replace('#', '');
    if (hash) {
        showSingleSong(null, hash);
    }
});

// ── Search Input Listeners & Keyboard Nav ──
const searchInput = document.getElementById('search-input');

searchInput.addEventListener('input', applyFilters);

searchInput.addEventListener('focus', () => {
    if (searchInput.value.trim().length > 0) {
        applyFilters();
    }
});

searchInput.addEventListener('keydown', (e) => {
    const suggestionsContainer = document.getElementById('search-suggestions');
    const items = suggestionsContainer ? suggestionsContainer.querySelectorAll('.suggestion-item') : [];
    
    if (suggestionsContainer && !suggestionsContainer.classList.contains('hidden') && items.length > 0) {
        if (e.key === 'ArrowDown') {
            e.preventDefault();
            focusedSuggestionIndex = (focusedSuggestionIndex + 1) % items.length;
            updateFocusedSuggestion(items);
            return;
        }
        if (e.key === 'ArrowUp') {
            e.preventDefault();
            focusedSuggestionIndex = (focusedSuggestionIndex - 1 + items.length) % items.length;
            updateFocusedSuggestion(items);
            return;
        }
        if (e.key === 'Enter') {
            e.preventDefault();
            if (focusedSuggestionIndex >= 0 && focusedSuggestionIndex < items.length) {
                const slug = items[focusedSuggestionIndex].dataset.slug;
                selectSuggestion(slug);
            } else if (items.length > 0) {
                const slug = items[0].dataset.slug;
                selectSuggestion(slug);
            }
            return;
        }
        if (e.key === 'Escape') {
            hideSuggestions();
            return;
        }
    }
});

function updateFocusedSuggestion(items) {
    items.forEach((item, idx) => {
        if (idx === focusedSuggestionIndex) {
            item.classList.add('bg-emerald-100', 'ring-1', 'ring-emerald-300');
            item.scrollIntoView({ block: 'nearest' });
        } else {
            item.classList.remove('bg-emerald-100', 'ring-1', 'ring-emerald-300');
        }
    });
}

document.addEventListener('click', (e) => {
    const searchContainer = document.getElementById('sticky-search-container');
    if (searchContainer && !searchContainer.contains(e.target)) {
        hideSuggestions();
    }
});

initSearchIndex();
applyFilters();
</script>
</body>
</html>`;

const outputHtmlPath = path.join(__dirname, '..', 'cantos.html');
fs.writeFileSync(outputHtmlPath, html, 'utf8');
console.log(`✅ cantos.html generado: ${(html.length/1024).toFixed(0)} KB, ${finalSongs.length} canciones`);
