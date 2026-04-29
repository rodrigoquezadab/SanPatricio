const fs = require('fs');
const path = require('path');

// Load scraped data
const songs = JSON.parse(fs.readFileSync(path.join(__dirname, 'cancionero_data.json'), 'utf8'));

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

// Collect all unique category values
const allMomentos = [...new Set(finalSongs.flatMap(s => s.momentos))].sort((a,b) => a.localeCompare(b,'es'));
const allTiempos = [...new Set(finalSongs.flatMap(s => s.tiempos))].sort((a,b) => a.localeCompare(b,'es'));

// Build the JSON data to embed (compact: only metadata, content stored separately)
const songIndex = finalSongs.map((s, i) => ({
  i, t: s.title, s: s.slug,
  m: s.momentos, l: s.tiempos, ch: s.misaChilena ? 1 : 0
}));

// Build HTML
const html = `<!DOCTYPE html>
<html lang="es" class="scroll-smooth">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Parroquia San Patricio - Cancionero</title>
    <meta name="description" content="Cancionero litúrgico de la Parroquia San Patricio con acordes y letras. Filtrado por momentos de la misa y tiempos litúrgicos.">
    <script src="https://cdn.tailwindcss.com"></script>
    <script>tailwind.config = { theme: { extend: { colors: { arena: '#F3E5DC', verdeSanPatricio: '#16A34A', negro: '#000000' } } } }</script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        body { background-color: #F3E5DC; color: #000000; font-family: sans-serif; display: flex; flex-direction: column; min-height: 100vh; }
        main { flex-grow: 1; }
        h1, h2, h3, h4, h5, h6 { color: #16A34A; font-weight: bold; }
        .btn-flotante-container { position: fixed; bottom: 20px; right: 20px; display: flex; flex-direction: column; gap: 10px; z-index: 1000; }
        .btn-flotante { width: 50px; height: 50px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 6px rgba(0,0,0,0.3); transition: transform 0.2s; text-decoration: none; font-size: 24px; }
        .btn-flotante:hover { transform: scale(1.1); color: white; }
        .btn-subir { background-color: #16A34A; cursor: pointer; border: none; }
        .btn-whatsapp { background-color: #25D366; }
        .card { background: white; border-radius: 0.5rem; box-shadow: 0 4px 6px rgba(0,0,0,0.1); padding: 1.5rem; }
        .nav-link { color: white; padding: 0.5rem 1rem; border-radius: 0.25rem; }
        .nav-link:hover, .nav-link.active { background-color: rgba(255,255,255,0.2); }
        c { color: #dc2626; font-weight: bold; }
        pre.song-pre { font-family: 'Courier New', Courier, monospace; font-size: 0.85rem; white-space: pre; overflow-x: auto; margin: 0; line-height: 1.5; padding: 0.5rem; background: #fafaf8; border-radius: 0.25rem; }
        @media (max-width: 640px) { pre.song-pre { font-size: 0.75rem; } }
        .index-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(220px, 1fr)); gap: 6px; }
        .index-link { color: #16A34A; text-decoration: none; padding: 4px 0; display: block; font-size: 0.9rem; }
        .index-link:hover { text-decoration: underline; }
        .filter-btn { padding: 0.35rem 0.75rem; border-radius: 9999px; font-size: 0.8rem; border: 1px solid #d1d5db; background: white; cursor: pointer; transition: all 0.2s; white-space: nowrap; }
        .filter-btn:hover { border-color: #16A34A; color: #16A34A; }
        .filter-btn.active { background: #16A34A; color: white; border-color: #16A34A; }
        .filter-section { display: flex; flex-wrap: wrap; gap: 6px; align-items: center; }
        .filter-label { font-weight: 600; font-size: 0.8rem; color: #555; margin-right: 4px; }
        .song-card { transition: opacity 0.2s; }
        .song-card.hidden-filter { display: none; }
        #search-input { background: white; border: 1px solid #d1d5db; border-radius: 0.5rem; padding: 0.5rem 1rem 0.5rem 2.5rem; width: 100%; font-size: 0.95rem; }
        #search-input:focus { outline: none; border-color: #16A34A; box-shadow: 0 0 0 2px rgba(22,163,74,0.2); }
    </style>
</head>
<body>
<div id="menu-container"></div>

<main class="container mx-auto px-4 py-8 space-y-6">
    <h2 class="text-3xl mb-2 text-center"><i class="fas fa-music mr-2"></i>Cancionero</h2>
    <p class="text-center text-gray-600 text-sm mb-4">${finalSongs.length} canciones disponibles</p>

    <!-- Search Bar -->
    <div class="relative max-w-lg mx-auto mb-4">
        <i class="fas fa-search absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"></i>
        <input type="text" id="search-input" placeholder="Buscar canción..." autocomplete="off">
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
${finalSongs.map(s => `            <a href="#${s.slug}" class="index-link" data-slug="${s.slug}" onclick="showSingleSong(event, '${s.slug}')">${s.title}</a>`).join('\n')}
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
        <h3 class="text-xl mb-3 border-b pb-2">${s.title}</h3>
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
${s.momentos.length || s.tiempos.length || s.misaChilena ? `        <div class="flex flex-wrap gap-1 mb-3">${s.momentos.map(m=>`<span class="text-xs bg-green-100 text-green-800 px-2 py-0.5 rounded-full">${m}</span>`).join('')}${s.tiempos.map(t=>`<span class="text-xs bg-blue-100 text-blue-800 px-2 py-0.5 rounded-full">${t}</span>`).join('')}${s.misaChilena?'<span class="text-xs bg-yellow-100 text-yellow-800 px-2 py-0.5 rounded-full">Misa a la Chilena</span>':''}</div>` : ''}
        <pre class="song-pre">${s.content}</pre>
    </div>`;
}).join('\n')}
</main>

<div id="footer-container"></div>
<script src="../components.js?v=3"></script>
<script>
// ── Audio ──
let audioCtx;
function initAudio(){if(!audioCtx)audioCtx=new(window.AudioContext||window.webkitAudioContext)();if(audioCtx.state==='suspended')audioCtx.resume();}
function playChord(cs){initAudio();let m=cs.match(/^(Do|Re|Mi|Fa|Sol|La|Si)(#|b)?(.*)/i);if(!m)return;let nn=m[1].toLowerCase(),ac=m[2]||'',mo=m[3]||'';const ns={'do':60,'re':62,'mi':64,'fa':65,'sol':67,'la':69,'si':71};let mi=ns[nn];if(ac==='#')mi+=1;if(ac==='b')mi-=1;let iv=[0,4,7];let md=mo.toLowerCase();if(md.includes('m')&&!md.includes('maj'))iv[1]=3;if(md.includes('dim')){iv[1]=3;iv[2]=6;}else if(md.includes('aug'))iv[2]=8;if(md.includes('maj7'))iv.push(11);else if(md.includes('7'))iv.push(10);const t=audioCtx.currentTime;iv.forEach((interval,idx)=>{let f=Math.pow(2,(mi+interval-69)/12)*440;let o1=audioCtx.createOscillator(),o2=audioCtx.createOscillator(),g=audioCtx.createGain();o1.type='triangle';o2.type='sine';o1.frequency.setValueAtTime(f,t);o2.frequency.setValueAtTime(f*1.002,t);g.gain.setValueAtTime(0,t);g.gain.linearRampToValueAtTime(0.12,t+0.05);g.gain.exponentialRampToValueAtTime(0.001,t+2);o1.connect(g);o2.connect(g);g.connect(audioCtx.destination);let d=idx*0.03;o1.start(t+d);o2.start(t+d);o1.stop(t+d+2);o2.stop(t+d+2);});}

// ── Process <c> tags for click-to-play ──
document.addEventListener('DOMContentLoaded',()=>{document.querySelectorAll('c').forEach(ct=>{if(ct.dataset.p)return;ct.dataset.p="1";const ws=ct.textContent.split(/(\\s+)/);ct.innerHTML='';ws.forEach(w=>{if(!w.trim()){ct.appendChild(document.createTextNode(w));}else{const sp=document.createElement('span');sp.textContent=w;sp.style.cursor='pointer';sp.title='Toca para escuchar';sp.className='hover:text-red-400 hover:underline transition-colors';sp.onclick=()=>playChord(w);ct.appendChild(sp);}});});});

// ── Notation ──
const nL=['Do','Do#','Re','Re#','Mi','Fa','Fa#','Sol','Sol#','La','La#','Si'];
const nA=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
const eq={'Dob':'Si','Reb':'Do#','Mib':'Re#','Fab':'Mi','Solb':'Fa#','Lab':'Sol#','Sib':'La#','Cb':'B','Db':'C#','Eb':'D#','Fb':'E','Gb':'F#','Ab':'G#','Bb':'A#'};
function pN(s){let m=s.match(/^(Do|Re|Mi|Fa|Sol|La|Si|C|D|E|F|G|A|B)(#|b)?(.*)/i);if(!m)return null;let b=m[1].charAt(0).toUpperCase()+m[1].slice(1).toLowerCase(),fn=b+(m[2]||'');if(eq[fn])fn=eq[fn];let i=nL.indexOf(fn),tp='lat';if(i===-1){i=nA.indexOf(fn);tp='ang';}return{idx:i,type:tp,mod:m[3]||''};}
function fN(i,tp,mo){i=(i%12+12)%12;return(tp==='ang'?nA[i]:nL[i])+mo;}
function toggleChords(b){let c=b.closest('.card'),p=c.querySelector('pre'),bt=b.querySelector('.btn-text'),ic=b.querySelector('i');if(p.classList.contains('acordes-ocultos')){p.classList.remove('acordes-ocultos');bt.innerText='Ocultar Acordes';ic.className='fas fa-eye-slash mr-1';c.querySelectorAll('c').forEach(x=>x.style.display='');}else{p.classList.add('acordes-ocultos');bt.innerText='Mostrar Acordes';ic.className='fas fa-eye mr-1';c.querySelectorAll('c').forEach(x=>x.style.display='none');}}
function toggleNotation(b){let c=b.closest('.card'),sp=c.querySelectorAll('c span'),isA=c.dataset.notation==='anglo',tt=isA?'lat':'ang';c.dataset.notation=tt==='ang'?'anglo':'latina';b.querySelector('.btn-text').innerText=isA?'Do / C':'C / Do';sp.forEach(s=>{let p=pN(s.innerText);if(p&&p.idx!==-1)s.innerText=fN(p.idx,tt,p.mod);});}
function transpose(b,st){let c=b.closest('.card');let cur=parseInt(c.dataset.transSteps||'0');cur+=st;c.dataset.transSteps=cur;let disp=c.querySelector('.tono-display');if(disp){if(cur===0){disp.textContent='Tono';disp.style.color='';}else{disp.textContent=(cur>0?'+':'')+cur;disp.style.color=cur!==0?'#dc2626':'';}}c.querySelectorAll('c span').forEach(s=>{let p=pN(s.innerText);if(p&&p.idx!==-1)s.innerText=fN(p.idx+st,p.type,p.mod);});}
function resetTranspose(b){let c=b.closest('.card');let cur=parseInt(c.dataset.transSteps||'0');if(cur===0)return;let rev=-cur;c.dataset.transSteps='0';b.textContent='Tono';b.style.color='';c.querySelectorAll('c span').forEach(s=>{let p=pN(s.innerText);if(p&&p.idx!==-1)s.innerText=fN(p.idx+rev,p.type,p.mod);});}

// ── Filtering ──
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

function clearFilters() {
    activeFilters = { momento: null, tiempo: null, chilena: null };
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    document.getElementById('search-input').value = '';
    applyFilters();
}

function hasActiveFilter() {
    const search = document.getElementById('search-input').value.trim();
    return search.length > 0 || activeFilters.momento || activeFilters.tiempo || activeFilters.chilena;
}

function applyFilters() {
    const search = document.getElementById('search-input').value.toLowerCase().trim();
    const welcomeMsg = document.getElementById('welcome-msg');
    const filtersActive = hasActiveFilter();
    let visible = 0;
    
    // Welcome message: show only when nothing is active
    if (welcomeMsg) welcomeMsg.style.display = filtersActive ? 'none' : '';
    
    // Always hide ALL song cards — they only appear via index click
    document.querySelectorAll('.song-card').forEach((card) => card.classList.add('hidden-filter'));
    
    // Filter the INDEX links only
    document.querySelectorAll('.index-link').forEach((link) => {
        const slug = link.dataset.slug;
        const card = document.getElementById(slug);
        if (!card) return;
        
        let matchesFilter = true;
        if (filtersActive) {
            const title = card.dataset.title || '';
            let cats;
            try { cats = JSON.parse(card.dataset.cats); } catch(e) { cats = {m:[],l:[],ch:0}; }
            
            if (search && !title.includes(search)) matchesFilter = false;
            if (matchesFilter && activeFilters.momento && !cats.m.includes(activeFilters.momento)) matchesFilter = false;
            if (matchesFilter && activeFilters.tiempo && !cats.l.includes(activeFilters.tiempo)) matchesFilter = false;
            if (matchesFilter && activeFilters.chilena && !cats.ch) matchesFilter = false;
        }
        
        link.style.display = (filtersActive && !matchesFilter) ? 'none' : '';
        if (!filtersActive || matchesFilter) visible++;
    });
    
    document.getElementById('song-count').textContent = filtersActive ? \`(\${visible} de ${finalSongs.length})\` : \`(${finalSongs.length})\`;
}

function showSingleSong(event, slug) {
    event.preventDefault();
    // Hide welcome message
    const welcomeMsg = document.getElementById('welcome-msg');
    if (welcomeMsg) welcomeMsg.style.display = 'none';
    // Show only the clicked song
    document.querySelectorAll('.song-card').forEach(c => c.classList.add('hidden-filter'));
    const target = document.getElementById(slug);
    if (target) {
        target.classList.remove('hidden-filter');
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}

document.getElementById('search-input').addEventListener('input', applyFilters);
applyFilters();
</script>
</body>
</html>`;

fs.writeFileSync(path.join(__dirname, 'paginas', 'cantos.html'), html, 'utf8');
console.log(`✅ cantos.html generado: ${(html.length/1024).toFixed(0)} KB, ${finalSongs.length} canciones`);
