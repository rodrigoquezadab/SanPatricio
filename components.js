document.addEventListener("DOMContentLoaded", function () {
    // Cargar Menú
    fetch('menu.html')
        .then(response => response.text())
        .then(data => {
            const menuContainer = document.getElementById('menu-container');
            if(menuContainer) {
                menuContainer.innerHTML = data;
    
                // Lógica del menú móvil
                const menuToggle = document.getElementById('menu-toggle');
                const mobileMenu = document.getElementById('mobile-menu');
                if (menuToggle && mobileMenu) {
                    menuToggle.addEventListener('click', () => { mobileMenu.classList.toggle('hidden'); });
                }
    
                // Marcar enlace activo
                const pathInfo = window.location.pathname.split('/');
                const currentPage = pathInfo[pathInfo.length - 1] || 'index.html';
                const links = document.querySelectorAll('.nav-link');
                links.forEach(link => {
                    const href = link.getAttribute('href');
                    if (href === currentPage || (currentPage === '' && href === 'index.html')) {
                        link.classList.add('active');
                    } else {
                        link.classList.remove('active');
                    }
                });
            }
        })
        .catch(error => console.error('Error al cargar el menú:', error));

    // Cargar Footer (incluye botones flotantes)
    fetch('footer.html')
        .then(response => response.text())
        .then(data => {
            const footerContainer = document.getElementById('footer-container');
            if(footerContainer) {
                footerContainer.innerHTML = data;
    
                // Lógica botón subir
                window.addEventListener('scroll', () => {
                    const btnSubirDiv = document.getElementById('btnSubir');
                    if (btnSubirDiv) {
                        if (window.scrollY > 300) btnSubirDiv.classList.remove('hidden');
                        else btnSubirDiv.classList.add('hidden');
                    }
                });
            }
        })
        .catch(error => console.error('Error al cargar el footer:', error));
});
