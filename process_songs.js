const fs = require('fs');
const songsData = JSON.parse(fs.readFileSync('songs_data.json', 'utf8'));

// Function to normalize titles for IDs
const toId = (text) => text.toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');

// Collect all unique songs and their categories
const uniqueSongs = {};
const categoryNames = Object.keys(songsData);

categoryNames.forEach(cat => {
    songsData[cat].forEach(song => {
        const id = toId(song.title);
        if (!uniqueSongs[id]) {
            uniqueSongs[id] = {
                title: song.title,
                content: song.content,
                categories: [cat]
            };
        } else {
            if (!uniqueSongs[id].categories.includes(cat)) {
                uniqueSongs[id].categories.push(cat);
            }
        }
    });
});

// Build the Index HTML
let indexHtml = '<div id="indice" class="card mb-8">\n';
indexHtml += '    <h3 class="text-2xl mb-4 border-b pb-2"><i class="fas fa-filter mr-2 text-verdeSanPatricio"></i>Filtrar por Categoría</h3>\n';
indexHtml += '    <div class="flex flex-wrap gap-2 mb-6">\n';
indexHtml += '        <button onclick="filterCategory(\'all\')" class="cat-btn bg-verdeSanPatricio text-white px-3 py-1 rounded shadow-sm hover:bg-green-700 transition active" data-cat="all">Todas</button>\n';
categoryNames.forEach(cat => {
    indexHtml += '        <button onclick="filterCategory(\'' + cat + '\')" class="cat-btn bg-gray-200 text-gray-700 px-3 py-1 rounded shadow-sm hover:bg-gray-300 transition" data-cat="' + cat + '">' + cat + '</button>\n';
});
indexHtml += '    </div>\n';
indexHtml += '    <h3 class="text-2xl mb-4 border-b pb-2"><i class="fas fa-music mr-2 text-verdeSanPatricio"></i>Índice de Canciones</h3>\n';
indexHtml += '    <div class="index-grid" id="songs-index">\n';

const sortedIds = Object.keys(uniqueSongs).sort((a, b) => uniqueSongs[a].title.localeCompare(uniqueSongs[b].title));

sortedIds.forEach(id => {
    const song = uniqueSongs[id];
    const catData = song.categories.join(' ');
    indexHtml += '        <a href="#' + id + '" class="index-link song-index-item" data-categories="' + catData + '">' + song.title + '</a>\n';
});
indexHtml += '    </div>\n';
indexHtml += '</div>';

// Build the Songs HTML
let songsHtml = '';
sortedIds.forEach(id => {
    const song = uniqueSongs[id];
    const catData = song.categories.join(' ');
    const displayTitle = song.title;
    
    // Process content to wrap chords in <c>
    let content = song.content;
    // Replace <b>chord</b> with <c>chord</c>
    content = content.replace(/<b>(.*?)<\/b>/g, '<c>$1</c>');
    
    // If Abre tu jardín, use the specifically formatted one as reference
    // But user said "don't modify abre tu jardín and use it as reference"
    // I will handle it manually in the final merge or just keep it if it's already there.
    
    const toolbarHtml = `
        <div class="flex flex-wrap gap-2 mb-4 text-sm text-gray-700 toolbar-cancion">
            <button onclick="toggleChords(this)" class="bg-arena hover:bg-gray-200 px-3 py-1 rounded border border-gray-300 transition-colors flex items-center">
                <i class="fas fa-eye-slash mr-1"></i> <span class="btn-text">Ocultar Acordes</span>
            </button>
            <button onclick="toggleNotation(this)" class="bg-arena hover:bg-gray-200 px-3 py-1 rounded border border-gray-300 transition-colors flex items-center">
                <i class="fas fa-music mr-1"></i> <span class="btn-text">Do / C</span>
            </button>
            <div class="flex items-center bg-arena rounded border border-gray-300 overflow-hidden">
                <button onclick="transpose(this, -1)" class="hover:bg-gray-200 px-3 py-1 font-bold border-r border-gray-300">-</button>
                <span class="px-2 font-semibold" title="Transportar tono">Tono</span>
                <button onclick="transpose(this, 1)" class="hover:bg-gray-200 px-3 py-1 font-bold border-l border-gray-300">+</button>
            </div>
        </div>`;

    songsHtml += '    <div class="card mb-8 song-card" id="' + id + '" data-categories="' + catData + '">\n';
    songsHtml += '        <h3 class="text-2xl mb-4 border-b pb-2">' + displayTitle + '</h3>\n';
    songsHtml += toolbarHtml;
    songsHtml += '        <pre>' + content + '</pre>\n';
    songsHtml += '    </div>\n';
});

// Helper for filtering JS
const filterJs = `
    function filterCategory(category) {
        // Update buttons
        document.querySelectorAll('.cat-btn').forEach(btn => {
            if (btn.dataset.cat === category) {
                btn.classList.remove('bg-gray-200', 'text-gray-700');
                btn.classList.add('bg-verdeSanPatricio', 'text-white', 'active');
            } else {
                btn.classList.add('bg-gray-200', 'text-gray-700');
                btn.classList.remove('bg-verdeSanPatricio', 'text-white', 'active');
            }
        });

        // Filter index
        document.querySelectorAll('.song-index-item').forEach(item => {
            const cats = item.dataset.categories.split(' ');
            if (category === 'all' || cats.includes(category)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });

        // Filter cards
        document.querySelectorAll('.song-card').forEach(card => {
            const cats = card.dataset.categories.split(' ');
            if (category === 'all' || cats.includes(category)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
`;

fs.writeFileSync('generated_index.html', indexHtml);
fs.writeFileSync('generated_songs.html', songsHtml);
fs.writeFileSync('generated_filter.js', filterJs);
console.log('Processed unique songs:', sortedIds.length);
