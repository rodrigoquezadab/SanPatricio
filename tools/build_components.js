const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');
const menuHtml = fs.readFileSync(path.join(projectRoot, 'components', 'menu.html'), 'utf8');
const footerHtml = fs.readFileSync(path.join(projectRoot, 'components', 'footer.html'), 'utf8');

const metaDescriptions = {
    'adoracion.html': 'Adoración Eucarística en la Parroquia San Patricio, Las Condes. Horarios, cómo sumarte como adorador y ubicación de la capilla.',
    'aportes.html': 'Datos bancarios y formas de contribuir a la Parroquia San Patricio. Información sobre el 1% CALI (Contribución a la Iglesia).',
    'calendario.html': 'Calendario parroquial de la Parroquia San Patricio con actividades, celebraciones y eventos de la comunidad.',
    'comunidades.html': 'Conoce las comunidades, equipos pastorales y grupos de la Parroquia San Patricio: catequesis, adoradores, coro, y más.',
    'parroquia.html': 'Conoce la historia de la Parroquia San Patricio en Las Condes y la Congregación de los Hijos de Santa María Inmaculada.',
    'contacto.html': 'Contacto, dirección, teléfono, WhatsApp y redes sociales de la Parroquia San Patricio en Las Condes, Santiago.',
    'evangelio.html': 'Evangelio del día y Santo del día. Lectura bíblica diaria desde la Parroquia San Patricio.',
    'noticias.html': 'Noticias y actividades recientes de la Parroquia San Patricio en Las Condes, Santiago de Chile.',
    'oraciones.html': 'Colección de oraciones: Regina Caeli, Novena al P. Frassinetti, Novena a San José, y más oraciones de la comunidad.',
    'recursos.html': 'Enlaces y recursos útiles para la comunidad: Santo Rosario, Liturgia de las Horas, cancionero litúrgico y más.',
    'servicios.html': 'Servicios parroquiales: corona de caridad, visita a enfermos, velatorio, dirección espiritual, bendición de hogares.',
    'cantos.html': 'Cancionero Católico Parroquial con acordes, buscador y transposición para animación litúrgica.'
};

const stylesRegex = /<style>[\s\S]*?<\/style>/i;

function processFile(file) {
    const filePath = path.join(projectRoot, file);
    if (file === 'index.html' || file === 'noticia.html' || file === 'generated_songs.html' || file === 'generated_index.html') {
        // Para index.html y noticia.html solo inyectamos menu y footer y actualizamos estilos, NO tocamos metas
        let content = fs.readFileSync(filePath, 'utf8');
        
        // Inject menu
        if (content.includes('<nav class="bg-verdeSanPatricio')) {
            content = content.replace(/<div id="menu-container">[\s\S]*?<\/nav>\s*<\/div>/g, `<div id="menu-container">\n${menuHtml}\n</div>`);
        } else {
            content = content.replace(/<div id="menu-container"><\/div>/g, `<div id="menu-container">\n${menuHtml}\n</div>`);
        }
        
        // Inject footer
        if (content.includes('<footer class="bg-gray-800')) {
            content = content.replace(/<div id="footer-container">[\s\S]*?<\/footer>\s*<\/div>/g, `<div id="footer-container">\n${footerHtml}\n</div>`);
        } else {
            content = content.replace(/<div id="footer-container"><\/div>/g, `<div id="footer-container">\n${footerHtml}\n</div>`);
        }
        
        // Clean up paths if it was moved (index was already in root, but just in case)
        if(file !== 'index.html') {
            content = content.replace(/\.\.\/assets\//g, 'assets/');
            content = content.replace(/\.\.\/components\.js/g, 'components.js');
        }

        // Replace inline styles
        if (stylesRegex.test(content)) {
            content = content.replace(stylesRegex, '<link rel="stylesheet" href="styles.css">');
        }

        fs.writeFileSync(filePath, content, 'utf8');
        console.log(`Processed ${file} (partial)`);
        return;
    }

    let content = fs.readFileSync(filePath, 'utf8');
    
    // Inject menu & footer
    if (content.includes('<nav class="bg-verdeSanPatricio')) {
        content = content.replace(/<div id="menu-container">[\s\S]*?<\/nav>\s*<\/div>/g, `<div id="menu-container">\n${menuHtml}\n</div>`);
    } else {
        content = content.replace(/<div id="menu-container"><\/div>/g, `<div id="menu-container">\n${menuHtml}\n</div>`);
    }

    if (content.includes('<footer class="bg-gray-800')) {
        content = content.replace(/<div id="footer-container">[\s\S]*?<\/footer>\s*<\/div>/g, `<div id="footer-container">\n${footerHtml}\n</div>`);
    } else {
        content = content.replace(/<div id="footer-container"><\/div>/g, `<div id="footer-container">\n${footerHtml}\n</div>`);
    }

    // Clean up paths since files are now in root
    content = content.replace(/\.\.\/assets\//g, 'assets/');
    content = content.replace(/\.\.\/components\.js/g, 'components.js');

    // Replace styles
    if (stylesRegex.test(content)) {
        content = content.replace(stylesRegex, '<link rel="stylesheet" href="styles.css">');
    }

    // Add Meta Tags if not present
    if (!content.includes('<meta name="description"')) {
        const desc = metaDescriptions[file] || 'Parroquia San Patricio, Las Condes, Santiago.';
        const sectionName = file.replace('.html', '').charAt(0).toUpperCase() + file.replace('.html', '').slice(1);
        
        const metaTags = `
    <meta name="description" content="${desc}">
    <link rel="canonical" href="https://rodrigoquezadab.github.io/SanPatricio/${file}">
    <meta property="og:title" content="Parroquia San Patricio - ${sectionName}">
    <meta property="og:description" content="${desc}">
    <meta property="og:type" content="website">`;
        
        content = content.replace('</head>', `${metaTags}\n</head>`);
    }

    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`Processed ${file}`);
}

const files = fs.readdirSync(projectRoot).filter(f => f.endsWith('.html') && !f.startsWith('generated_'));
files.forEach(processFile);
console.log('Build completed!');
