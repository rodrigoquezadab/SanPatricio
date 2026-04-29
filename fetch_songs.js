const https = require('https');
const fs = require('fs');

const categories = [
    { name: 'Entrada', path: '01%20Entrada.html' },
    { name: 'Perdón', path: '02%20Perd%C3%B3n.html' },
    { name: 'Gloria', path: '03%20Gloria.html' },
    { name: 'Salmos', path: '04%20Salmos.html' },
    { name: 'Aleluya', path: '05%20Aleluya.html' },
    { name: 'Leccionales', path: '06%20Leccionales.html' },
    { name: 'Ofertorio', path: '07%20Ofertorio.html' },
    { name: 'Santo', path: '08%20Santo.html' },
    { name: 'Padrenuestro', path: '09%20Padrenuestro.html' },
    { name: 'Paz', path: '10%20Paz.html' },
    { name: 'Cordero', path: '11%20Cordero.html' },
    { name: 'Comunión', path: '12%20Comuni%C3%B3n.html' },
    { name: 'Espíritu Santo', path: '13%20Esp%C3%ADritu%20Santo.html' },
    { name: 'Salida', path: '14%20Salida.html' },
    { name: 'Marianos', path: '15%20Marianos.html' }
];

function fetchPage(url) {
    return new Promise((resolve, reject) => {
        https.get(url, { headers: { 'User-Agent': 'Mozilla/5.0' } }, (res) => {
            let data = '';
            res.on('data', chunk => data += chunk);
            res.on('end', () => resolve(data));
        }).on('error', reject);
    });
}

async function getSongContent(songUrl) {
    try {
        const html = await fetchPage(songUrl);
        const match = html.match(/<pre[^>]*>([\s\S]*?)<\/pre>/i);
        return match ? match[1] : null;
    } catch (e) {
        return null;
    }
}

async function run() {
    const songsData = {};
    for (const cat of categories) {
        console.log('Fetching category:', cat.name);
        const catUrl = 'https://cancionerocatolico.cl/' + cat.path;
        try {
            const html = await fetchPage(catUrl);
            const songRegex = /<a class="btn btn-outline-primary btn-sm" href="([^"]+)">([^<]+)<\/a>/g;
            let match;
            songsData[cat.name] = [];
            while ((match = songRegex.exec(html)) !== null) {
                const relativeUrl = match[1];
                const title = match[2];
                
                const encodedUrl = relativeUrl.split('/').map(part => encodeURIComponent(part)).join('/');
                const songUrl = 'https://cancionerocatolico.cl/' + encodedUrl;
                
                console.log('  Fetching song:', title);
                const content = await getSongContent(songUrl);
                if (content) {
                    songsData[cat.name].push({ title, content });
                }
            }
            console.log(`  Found ${songsData[cat.name].length} songs in ${cat.name}`);
        } catch (e) {
            console.error('Error fetching category:', cat.name, e);
        }
    }
    fs.writeFileSync('songs_data.json', JSON.stringify(songsData, null, 2));
    console.log('Done.');
}

run();
