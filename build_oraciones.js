const fs = require('fs');

const oracionesHtmlPath = 'oraciones.html';
const content = fs.readFileSync(oracionesHtmlPath, 'utf8');

// Extract the oraciones array string
const match = content.match(/const oraciones = (\[[\s\S]*?\]);\s*document\.addEventListener/);
if (!match) {
    console.log("No se pudo extraer el array de oraciones. Tal vez ya fue pre-renderizado.");
    process.exit(0);
}

const oracionesStr = match[1];
// Eval array to get objects
let oraciones;
try {
    oraciones = eval(`(${oracionesStr})`);
} catch (e) {
    console.error("Error evaluando oraciones:", e);
    process.exit(1);
}

// Generate static HTML
let indexHtml = '';
let contentHtml = '';

oraciones.forEach((oracion, index) => {
    const safeId = "oracion-" + index;
    
    // Index list item
    indexHtml += `
                <li class="hover:text-verdeSanPatricio cursor-pointer flex items-center p-3 rounded hover:bg-green-50 transition border-l-4 border-transparent hover:border-verdeSanPatricio shadow-sm bg-white" onclick="mostrarOracion('${safeId}')">
                    <i class="fas fa-chevron-right text-sm text-verdeSanPatricio mr-3"></i> ${oracion.titulo}
                </li>`;
                
    // Content article
    contentHtml += `
        <article id="${safeId}" class="oracion-article card mb-8 hidden transition-opacity duration-300 text-lg leading-relaxed">
            <button onclick="volverOraciones()" class="mb-6 inline-block bg-verdeSanPatricio text-white px-4 py-2 rounded hover:bg-green-700 transition shadow-md">
                <i class="fas fa-arrow-left mr-2"></i>Volver al índice
            </button>
            <h3 class="text-3xl mb-6 text-verdeSanPatricio font-bold border-b pb-2">${oracion.titulo}</h3>
            <div class="space-y-4 text-gray-800">
                ${oracion.contenido}
            </div>
        </article>`;
});

// Now replace the content in the original HTML
let newHtml = content.replace(
    /<ul id="lista-oraciones" class="list-none space-y-3 text-lg">[\s\S]*?<\/ul>/,
    `<ul id="lista-oraciones" class="list-none space-y-3 text-lg">${indexHtml}\n            </ul>`
);

newHtml = newHtml.replace(
    /<div id="detalle-oracion-container"[\s\S]*?<\/div>\n    <\/section>/,
    `<div id="detalle-oraciones-container">\n${contentHtml}\n        </div>\n    </section>`
);

// Replace JS logic
const newJs = `
    // Progressive enhancement
    function mostrarOracion(id) {
        document.getElementById("lista-oraciones-container").style.display = 'none';
        document.querySelectorAll('.oracion-article').forEach(el => el.style.display = 'none');
        
        const target = document.getElementById(id);
        if(target) {
            target.style.display = 'block';
            target.classList.remove('hidden');
            window.scrollTo({ top: target.offsetTop - 100, behavior: 'smooth' });
        }
    }

    function volverOraciones() {
        document.querySelectorAll('.oracion-article').forEach(el => el.style.display = 'none');
        document.getElementById("lista-oraciones-container").style.display = 'block';
        window.scrollTo({ top: document.getElementById("lista-oraciones-container").offsetTop - 100, behavior: 'smooth' });
    }
    
    // Si hay un hash en la URL, intentar abrirla (ej: #oracion-0)
    document.addEventListener("DOMContentLoaded", function () {
        if(window.location.hash && window.location.hash.startsWith('#oracion-')) {
            mostrarOracion(window.location.hash.substring(1));
        } else {
            // Ensure index is shown and articles are hidden
            document.getElementById("lista-oraciones-container").style.display = 'block';
        }
    });
`;

newHtml = newHtml.replace(/<script>\s*const oraciones = [\s\S]*?<\/script>/, `<script>\n${newJs}\n</script>`);

// Fix CSS for hidden articles natively so crawlers see them but users don't see them all at once unless they have no JS
// Actually, crawlers ignore CSS display:none usually, but Googlebot renders JS.
// We can use a `<noscript>` tag or just let JS hide them on load if we want SEO to be perfect,
// but actually Googlebot reads `display: none` content if it's in the DOM, though it might devalue it slightly.
// We'll just leave `hidden` classes and let JS manage the visibility.

fs.writeFileSync(oracionesHtmlPath, newHtml, 'utf8');
console.log("oraciones.html pre-renderizado correctamente para SEO.");
