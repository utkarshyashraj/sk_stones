/**
 * CTA section — fade in when entering viewport
 */
(function () {
    if (!('IntersectionObserver' in window)) return;

    document.querySelectorAll('.cta-section.reveal').forEach(function (section) {
        if (section.classList.contains('visible')) return;

        var observer = new IntersectionObserver(
            function (entries, obs) {
                entries.forEach(function (entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('visible');
                        obs.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0.18, rootMargin: '0px 0px -40px 0px' }
        );

        observer.observe(section);
    });
})();
