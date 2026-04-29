
    function filterCategory(category) {
        // Update buttons
        document.querySelectorAll('.cat-btn').forEach(btn => {
            if (btn.dataset.cat === category) {
                btn.classList.remove('bg-gray-200', 'text-gray-700');
                btn.classList.add('bg-verdeSanPatricio', 'text-white', 'active');
            } else {
                btn.classList.add('bg-gray-200', 'text-gray-700');
                btn.classList.remove('bg-verdeSanPatricio', 'text-white', 'active');
            }
        });

        // Filter index
        document.querySelectorAll('.song-index-item').forEach(item => {
            const cats = item.dataset.categories.split(' ');
            if (category === 'all' || cats.includes(category)) {
                item.style.display = '';
            } else {
                item.style.display = 'none';
            }
        });

        // Filter cards
        document.querySelectorAll('.song-card').forEach(card => {
            const cats = card.dataset.categories.split(' ');
            if (category === 'all' || cats.includes(category)) {
                card.style.display = '';
            } else {
                card.style.display = 'none';
            }
        });
    }
