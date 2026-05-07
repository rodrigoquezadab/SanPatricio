const fs = require('fs');
const path = require('path');

// Bust cache for all HTML files in the root directory
const rootDir = __dirname;
const files = fs.readdirSync(rootDir).filter(f => f.endsWith('.html'));

let version = 2;
// Detect current max version
for (const file of files) {
    const content = fs.readFileSync(path.join(rootDir, file), 'utf8');
    const matches = content.match(/\?v=(\d+)/g);
    if (matches) {
        matches.forEach(m => {
            const v = parseInt(m.replace('?v=', ''));
            if (v >= version) version = v + 1;
        });
    }
}

for (const file of files) {
    const filePath = path.join(rootDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    content = content.replace(/components\.js\?v=\d+/g, `components.js?v=${version}`);
    content = content.replace(/styles\.css\?v=\d+/g, `styles.css?v=${version}`);
    fs.writeFileSync(filePath, content);
}

console.log(`Cache busted: todos los HTML actualizados a ?v=${version}`);
