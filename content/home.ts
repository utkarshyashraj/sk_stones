/**
 * Homepage section content and configuration (copy, image choices, mappings).
 * All copy is the business's own (legacy site) or factual; nothing here invents stone names, numbers or clients.
 * Stones are referenced by catalogue id; images by optimised image key.
 */

export const homeHero = {
  subhead: 'Marble, granite & natural stone — supplied, fabricated and installed. Koramangala, Bengaluru.',
  primary: { label: 'Explore the collection', href: '/products' },
  secondary: { label: 'Visit the showroom', href: '#showroom' },
};

export const sectionCopy = {
  collections: {
    eyebrow: 'Collections',
    title: 'Stone for every space',
    intro:
      'Nine categories and 460+ stones — from Indian and imported marbles to granites, claddings and handcrafted stone art.',
  },
  trust: { eyebrow: 'Who we are' },
  applications: {
    eyebrow: 'Shop by application',
    title: 'Start with the space',
    intro: 'Choose where the stone will live and see the collections suited to it.',
  },
  process: { eyebrow: 'Our process', title: 'From vision to', titleAccent: 'masterpiece' },
  projects: {
    eyebrow: 'Featured projects',
    title: 'Hotels, villas &',
    titleAccent: 'infrastructure',
    intro: 'Supplied, fabricated and installed by our own teams.',
  },
  testimonials: { eyebrow: 'Client reviews', title: 'In their words' },
  finishes: {
    eyebrow: 'Finishes',
    title: 'One stone, many surfaces',
    intro:
      'The finish changes how a stone looks, feels and performs. These are the finishes in our current catalogue.',
  },
  showroom: { eyebrow: 'Visit the showroom', title: 'See the stone', titleAccent: 'in person' },
  faq: {
    eyebrow: 'FAQ',
    title: 'Frequently asked questions',
    aside: "Can't find your answer? Talk to our team.",
  },
  finalCta: {
    title: 'Find the stone for your project',
    text: 'Share your space, stone preference and quantities — we reply within 24 hours with guidance and a tailored quote.',
  },
};

/**
 * Applications → catalogue filter. `application` must be a value of applicationVocabulary
 * (content/categories.json); recommended collections are derived from the catalogue at build time.
 * Images: the business's own project photography where it exists, otherwise a stone from the matching collection.
 * Not included: "Staircases" — the catalogue has no staircase application data (see placeholders).
 */
export const applications = [
  { label: 'Kitchen countertops', application: 'Countertops & Kitchens', image: 'site/flooring-4' },
  { label: 'Flooring', application: 'Flooring', image: 'site/flooring-3' },
  {
    label: 'Bathrooms & vanities',
    application: 'Bathrooms',
    image: 'catalog/subway-tiles-classic-gloss-subway-tiles',
  },
  { label: 'Wall cladding & feature walls', application: 'Wall Cladding', image: 'site/installation-2' },
  { label: 'Outdoor & landscaping', application: 'Landscaping', image: 'site/landscaping-1' },
  { label: 'Facades & elevations', application: 'Facades & Elevations', image: 'site/service-elevations' },
] as const;

/**
 * Finishes present in the catalogue, each with a real swatch photo and the business's own description
 * (taken from the legacy finish pages). Honed, flamed and brushed are not in the catalogue (see placeholders).
 */
export const finishes = [
  {
    name: 'Polished',
    filter: 'Polished',
    productId: 'indian-marbles-udaipur-green-marble-polished-tiles',
    text: 'A high-gloss surface that enhances colour richness, vein clarity and reflective depth — for refined interiors and statement spaces.',
  },
  {
    name: 'Leathered',
    filter: 'Leather',
    productId: 'indian-marbles-rainforest-gold-leather-finish',
    text: 'A soft, textured surface that enhances natural patterns, reduces glare and has a refined tactile feel.',
  },
  {
    name: 'Unpolished',
    filter: 'Unpolished',
    productId: 'sand-stones-jaisalmer-marble-unpolished',
    text: 'Retains the stone’s original character — a raw matte surface for understated architectural and rustic interiors.',
  },
] as const;

/** Every piece of content this homepage still needs from the business. Mirrored in docs/HOMEPAGE-REDESIGN.md. */
export const homePlaceholders = [
  'Showroom photograph (Visit the showroom section currently shows the map only).',
  'Finish swatches for Honed, Flamed and Brushed (not in the catalogue; section shows only finishes that exist).',
  'Staircase application imagery and data (application tile omitted until catalogue items are tagged).',
  'Project photos with location and stone used for more projects (gallery currently uses the three documented case studies and existing project photos).',
  'Bathroom/vanity project photo (tile currently shows a Subway Tiles product photo).',
];
