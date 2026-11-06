/* Product parents (Marbles, Granites, …) only open submenus — never navigate.
   Subcategory links (Indian Marbles, etc.) remain normal links. */
document.querySelectorAll('.mega-item.has-sub > a').forEach((link) => {
    link.setAttribute('href', '#');
    link.setAttribute('role', 'button');
    link.setAttribute('aria-haspopup', 'true');
    link.addEventListener('click', (e) => {
        e.preventDefault();
        e.stopPropagation();
        // Mobile: tap toggles the subcategory list
        if (window.innerWidth <= 1024) {
            const item = link.parentElement;
            if (!item || !item.classList.contains('has-sub')) return;
            item.classList.toggle('open');
            link.setAttribute('aria-expanded', item.classList.contains('open') ? 'true' : 'false');
        }
    });
});
