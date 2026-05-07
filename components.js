document.addEventListener("DOMContentLoaded", function () {
    const menuContainer = document.getElementById('menu-container');
    if (menuContainer) {
        // Lógica del menú móvil
        const menuToggle = document.getElementById('menu-toggle');
        const mobileMenu = document.getElementById('mobile-menu');
        if (menuToggle && mobileMenu) {
            menuToggle.addEventListener('click', () => { mobileMenu.classList.toggle('hidden'); });
        }

        // Marcar enlace activo
        const links = menuContainer.querySelectorAll('a.nav-link');
        const pathInfo = window.location.pathname.split('/');
        const currentPage = pathInfo[pathInfo.length - 1] || 'index.html';
        
        links.forEach(link => {
            const finalHref = link.getAttribute('href');
            if (finalHref && (finalHref === currentPage || (currentPage === '' && finalHref === 'index.html'))) {
                link.classList.add('active');
            } else {
                link.classList.remove('active');
            }
        });
    }

    const footerContainer = document.getElementById('footer-container');
    if (footerContainer) {
        // Lógica botón subir
        window.addEventListener('scroll', () => {
            const btnSubirDiv = document.getElementById('btnSubir');
            if (btnSubirDiv) {
                if (window.scrollY > 300) btnSubirDiv.classList.remove('hidden');
                else btnSubirDiv.classList.add('hidden');
            }
        });
    }
});
