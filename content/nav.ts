/**
 * Site navigation, exactly as on the approved reference (skstone.netlify.app): desktop header menus and the
 * mobile bottom-bar sheets. Labels are the reference's own (e.g. "Elevations", "Lime Stones", "Quatrz Surfaces").
 */
export interface NavLink {
  label: string;
  href: string;
}
export interface NavGroup {
  label: string;
  /** A group with items opens a flyout; one with href is a plain link (Wall Claddings). */
  items?: NavLink[];
  href?: string;
}

export const servicesMenu: NavLink[] = [
  { label: 'Landscaping', href: '/landscaping' },
  { label: 'Flooring Executions', href: '/flooring-executions' },
  { label: 'Elevations', href: '/stone-art-installations' },
];

export const productsMenu: NavGroup[] = [
  {
    label: 'Marbles',
    items: [
      { label: 'Indian Marbles', href: '/indian-marbles' },
      { label: 'Imported Marbles', href: '/imported-marbles' },
    ],
  },
  {
    label: 'Granites',
    items: [
      { label: 'Indian Granites', href: '/granites' },
      { label: 'Imported Granites', href: '/imported-granites' },
    ],
  },
  {
    label: 'Stone-Art',
    items: [
      { label: 'CNC Stone Work & INLAY Work', href: '/cnc-stone-work' },
      { label: 'MOP Work', href: '/mop-inlay-work' },
      { label: 'Murals & Monuments', href: '/murals-monuments' },
      { label: 'Feature Walls', href: '/feature-wall' },
    ],
  },
  {
    label: 'Natural Stones',
    items: [
      { label: 'Cobble Stones', href: '/cobble-stones' },
      { label: 'Lime Stones', href: '/kota-stones' },
      { label: 'Pebbles', href: '/pebbles' },
      { label: 'Sand Stones', href: '/sand-stones' },
    ],
  },
  {
    label: 'Engineered Surfaces',
    items: [
      { label: 'Acrylic Surfaces', href: '/acrylic-surfaces' },
      { label: 'Quatrz Surfaces', href: '/quatrz-surfaces' },
    ],
  },
  { label: 'Wall Claddings', href: '/wall-claddings' },
  {
    label: 'Tiles',
    items: [
      { label: 'Brillo Collection', href: '/brillo-collection' },
      { label: 'Elezzo Collection', href: '/elezzo-collection' },
      { label: 'Endless Collection', href: '/endless-collection' },
      { label: 'Ittaca Collection', href: '/ittaca-collection' },
      { label: 'Milagro Collection', href: '/milagro-collection' },
      { label: 'Stone Collection', href: '/stone-collection' },
      { label: 'Subway Tiles', href: '/subway-tiles' },
    ],
  },
  {
    label: 'Clay Products',
    items: [
      { label: 'Clay Jally', href: '/clay-jally' },
      { label: 'Wire Cut Bricks', href: '/wire-cut-bricks' },
      { label: 'Elevation Clay Bricks', href: '/elevation-clay-bricks' },
      { label: 'Roofing Tiles', href: '/roofing-tiles-clay' },
      { label: 'Roof Flooring Tiles', href: '/roof-flooring-tiles' },
    ],
  },
];

/** Mobile bottom bar "Products" sheet (the reference's own shortlist, not the full menu). */
export const mobileProductsSheet: NavLink[] = [
  { label: 'Indian Marble', href: '/indian-marbles' },
  { label: 'Imported Marble', href: '/imported-marbles' },
  { label: 'Granite', href: '/granites' },
  { label: 'Imported Granite', href: '/imported-granites' },
  { label: 'Quartz', href: '/quatrz-surfaces' },
  { label: 'Limestone', href: '/kota-stones' },
  { label: 'Sandstone', href: '/sand-stones' },
  { label: 'Natural Stones', href: '/natural-stones' },
  { label: 'Wall Claddings', href: '/wall-claddings' },
  { label: 'Tiles', href: '/tiles' },
  { label: 'Engineered Surfaces', href: '/engineered-surfaces' },
  { label: 'Clay Products', href: '/clay-products' },
  { label: 'Stone Art', href: '/stone-art' },
  { label: 'Roofing', href: '/roofing-tiles-clay' },
  { label: 'View All Products', href: '/products' },
];

/** Mobile "More" sheet: homepage sections that phones only see in the ?view=more homepage. */
export const mobileMoreSheet: NavLink[] = [
  { label: 'Who We Are', href: '/?view=more#who-we-are' },
  { label: 'Our Process', href: '/?view=more#process' },
  { label: 'Excellence & Trust', href: '/?view=more#trust' },
  { label: 'FAQ', href: '/?view=more#faq' },
  { label: 'Client Reviews', href: '/?view=more#testimonials' },
];

/** Every product, hub and overview route (drives the bottom bar's active "Products" tab). */
export const productRoutes = new Set([
  'products',
  'marbles',
  'stone-art',
  'natural-stones',
  'engineered-surfaces',
  'tiles',
  'clay-products',
  'concrete-blocks',
  ...productsMenu.flatMap((g) => (g.items ?? [g]).map((l) => l.href!.slice(1))),
]);
