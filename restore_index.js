const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

// The original content is inside the comment block:
// <!-- CÓDIGO ORIGINAL COMENTADO ABIJO:
// (content)
// -->
const startMarker = '<!-- CÓDIGO ORIGINAL COMENTADO ABIJO:\n';
const endMarker = '\n-->';

const startIndex = content.indexOf(startMarker);
if (startIndex !== -1) {
    let originalCode = content.substring(startIndex + startMarker.length, content.lastIndexOf(endMarker));
    // Remove the escape we added previously
    originalCode = originalCode.replace(/-\\->/g, '-->');
    
    fs.writeFileSync('index.html', originalCode);
    console.log('index.html ha sido restaurado exitosamente.');
} else {
    console.log('No se encontro el marcador de comentario.');
}
