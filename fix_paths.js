const fs = require('fs');
const path = require('path');
const paginasDir = path.join(__dirname, 'paginas');

if (fs.existsSync(paginasDir)) {
    const files = fs.readdirSync(paginasDir);
    let fixesCount = 0;
    files.forEach(file => {
        if (file.endsWith('.html')) {
            let content = fs.readFileSync(path.join(paginasDir, file), 'utf8');
            
            // Imágenes y Estilos referenciando a assets
            content = content.replace(/src="assets\//g, 'src="../assets/');
            content = content.replace(/href="assets\//g, 'href="../assets/');
            
            // El script importado
            content = content.replace(/src="components\.js"/g, 'src="../components.js"');
            
            // Funcionalidad de Noticias (JSON original quedó en la raíz)
            content = content.replace(/fetch\('noticias\.json/g, "fetch('../noticias.json");
            content = content.replace(/fetch\("noticias\.json/g, 'fetch("../noticias.json');
            
            // Volver al index directamente por si hay un link estático aparte del menú
            content = content.replace(/href="index\.html"/g, 'href="../index.html"');

            fs.writeFileSync(path.join(paginasDir, file), content);
            console.log(`Enlaces redirigidos en: ${file}`);
            fixesCount++;
        }
    });
    console.log(`Completado: ${fixesCount} archivos en la carpeta paginas corregidos.`);
}
