(function () {
    const schema = {
        '@context': 'https://schema.org',
        '@type': 'LocalBusiness',
        name: 'S K Stones India',
        alternateName: 'Shree Stones & Services',
        description: 'Premium natural stone supplier, fabricator and installer in Bengaluru. Granites, marbles, cladding, flooring and custom stone art since 2014.',
        url: 'https://skstonesindia.com',
        telephone: '+91-70226-30994',
        email: 'info@skstonesindia.com',
        image: 'https://skstonesindia.com/images/project-luxury-lobby.png',
        priceRange: '₹₹₹',
        address: {
            '@type': 'PostalAddress',
            streetAddress: '627-628, 15th Main, 80 Feet Road, 5th Cross Rd, 4th Block',
            addressLocality: 'Bengaluru',
            addressRegion: 'Karnataka',
            postalCode: '560034',
            addressCountry: 'IN'
        },
        geo: {
            '@type': 'GeoCoordinates',
            latitude: 12.9350616,
            longitude: 77.6283894
        },
        openingHoursSpecification: {
            '@type': 'OpeningHoursSpecification',
            dayOfWeek: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
            opens: '09:00',
            closes: '19:00'
        },
        sameAs: [
            'https://wa.me/917022630994',
            'https://www.google.com/maps/place/S+K+STONES+INDIA+PVT+LTD/@12.9350616,77.6283894,17z'
        ],
        areaServed: ['Bengaluru', 'Karnataka', 'India']
    };

    const script = document.createElement('script');
    script.type = 'application/ld+json';
    script.textContent = JSON.stringify(schema);
    document.head.appendChild(script);
})();
