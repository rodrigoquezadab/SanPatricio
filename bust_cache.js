const fs = require('fs');
const path = require('path');

function updateFile(filePath, isRoot) {
    if (fs.existsSync(filePath)) {
        let content = fs.readFileSync(filePath, 'utf8');
        if (isRoot) {
            // Already updated in index.html, but let's be sure
             content = content.replace(/src="components\.js"/g, 'src="components.js?v=2"');
        } else {
             content = content.replace(/src="\.\.\/components\.js"/g, 'src="../components.js?v=2"');
        }
        fs.writeFileSync(filePath, content);
    }
}

// Update index
updateFile('index.html', true);

// Update all inside paginas/
const paginasDir = path.join(__dirname, 'paginas');
if (fs.existsSync(paginasDir)) {
    const files = fs.readdirSync(paginasDir);
    files.forEach(file => {
        if (file.endsWith('.html')) {
            updateFile(path.join(paginasDir, file), false);
        }
    });
    console.log('Todos los archivos HTML han sido actualizados con ?v=2 para romper el caché.');
}
