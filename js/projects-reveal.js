/**
 * Projects page — staggered fade-in for cards & gallery items
 */
(function () {
    if (!document.body.classList.contains('page-projects')) return;
    if (!('IntersectionObserver' in window)) return;

    var items = document.querySelectorAll(
        '.case-studies-section .section-eyebrow, .case-study-card, .projects-section .section-eyebrow, .project-item'
    );

    items.forEach(function (el, i) {
        el.classList.add('projects-reveal');
        el.style.transitionDelay = (i % 6) * 0.08 + 's';
    });

    var observer = new IntersectionObserver(
        function (entries, obs) {
            entries.forEach(function (entry) {
                if (!entry.isIntersecting) return;
                entry.target.classList.add('visible');
                obs.unobserve(entry.target);
            });
        },
        { threshold: 0.12, rootMargin: '0px 0px -32px 0px' }
    );

    items.forEach(function (el) {
        observer.observe(el);
    });
})();
