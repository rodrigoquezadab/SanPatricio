const fs = require('fs');

let content = fs.readFileSync('index.html', 'utf8');

// Escapar comentarios existentes para evitar que el comentario gigante se cierre antes de tiempo
content = content.replace(/-->/g, '-\\->');

const newContent = `<!DOCTYPE html>
<html lang="es">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Test de Despliegue</title>
</head>
<body style="display: flex; justify-content: center; align-items: center; height: 100vh; font-family: sans-serif; background-color: #f0f0f0;">
    <h1 style="color: #16A34A; font-size: 4rem;">¡Funciona!</h1>
</body>
</html>

<!-- CÓDIGO ORIGINAL COMENTADO ABIJO:
${content}
-->`;

fs.writeFileSync('index.html', newContent);
console.log('index.html ha sido comentado y reemplazado por la prueba.');
