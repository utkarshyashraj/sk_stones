/**
 * Stone care guides: general, widely published practice for natural stone — not S K Stones India's own
 * product claims or warranty terms.
 *
 * TODO(business review): have S K Stones India read and approve (or edit) every line before turning the
 * guides on. They are hidden until NEXT_PUBLIC_SHOW_CARE_GUIDES=1 is set at build time; when it is, each
 * guide gets a page at /care/<slug> and a link from the matching collection pages.
 */
export interface CareGuide {
  slug: 'marble' | 'granite' | 'natural-stone';
  title: string;
  /** stone types (lib/quote-prefill STONE_TYPE_BY_CATEGORY values) whose collection pages link here */
  stoneType: 'marbles' | 'granites' | 'natural-stones';
  intro: string;
  sections: { heading: string; points: string[] }[];
}

export const CARE_GUIDES_ENABLED = process.env.NEXT_PUBLIC_SHOW_CARE_GUIDES === '1';

export const careGuides: CareGuide[] = [
  {
    slug: 'marble',
    title: 'Caring for marble',
    stoneType: 'marbles',
    intro:
      'Marble is a calcium-based stone. It is softer than granite and reacts with acids, so gentle cleaning and quick attention to spills keep it looking its best.',
    sections: [
      {
        heading: 'Everyday cleaning',
        points: [
          'Dust or sweep regularly — grit underfoot acts like sandpaper on the surface.',
          'Clean with warm water and a pH-neutral cleaner made for stone, then dry with a soft cloth.',
          'Use mats at entrances to catch dirt before it reaches the floor.',
        ],
      },
      {
        heading: 'Spills and stains',
        points: [
          'Blot spills straight away; wiping spreads them.',
          'Acidic liquids such as lemon juice, vinegar, wine and many soft drinks can dull (etch) marble, even when it is sealed.',
          'Use coasters and trays under glasses, bottles and toiletries.',
        ],
      },
      {
        heading: 'Avoid',
        points: [
          'Vinegar, lemon, bleach, ammonia and general-purpose bathroom or kitchen sprays.',
          'Abrasive powders, scouring pads and steel wool.',
        ],
      },
      {
        heading: 'Sealing and upkeep',
        points: [
          'Sealing reduces staining but does not stop etching. How often to reseal depends on the stone and how it is used — ask your installer.',
          'Etch marks and wear on polished marble can usually be restored by a professional stone polisher.',
        ],
      },
    ],
  },
  {
    slug: 'granite',
    title: 'Caring for granite',
    stoneType: 'granites',
    intro:
      'Granite is hard and resists heat and scratches well, which is why it is popular for kitchens and floors. A little routine care keeps its finish even.',
    sections: [
      {
        heading: 'Everyday cleaning',
        points: [
          'Wipe with warm water and a mild, pH-neutral cleaner, then dry to avoid water marks.',
          'Sweep floors regularly to remove grit.',
        ],
      },
      {
        heading: 'Spills and stains',
        points: [
          'Wipe up oil, wine, coffee and other spills promptly — some granites are more porous than others and can absorb them.',
          'A simple check: if drops of water darken the stone within a few minutes, it may be due for sealing.',
        ],
      },
      {
        heading: 'Avoid',
        points: [
          'Harsh chemicals, bleach and abrasive cleaners, which can wear down sealers and polish.',
          'Standing on counters or striking edges and corners with heavy objects.',
          'Very hot pans placed directly on the stone for long periods — use a trivet.',
        ],
      },
      {
        heading: 'Sealing and upkeep',
        points: [
          'Many granites benefit from periodic sealing; dense, dark granites often need it less. Ask your installer what suits your stone.',
        ],
      },
    ],
  },
  {
    slug: 'natural-stone',
    title: 'Caring for natural stone',
    stoneType: 'natural-stones',
    intro:
      'Sandstone, limestone, slate, Kota and similar natural stones vary in hardness and porosity. These general tips apply to most of them indoors and outdoors.',
    sections: [
      {
        heading: 'Everyday cleaning',
        points: [
          'Sweep or vacuum loose dirt and grit regularly.',
          'Mop with water and a pH-neutral stone cleaner; rinse and let the surface dry.',
        ],
      },
      {
        heading: 'Outdoors',
        points: [
          'Keep gutters and drainage clear so water does not stand on paving.',
          'Remove leaves and organic debris, which can stain light stones.',
          'If you use a pressure washer, keep to low pressure and a wide nozzle — high pressure can erode softer stones and joints.',
        ],
      },
      {
        heading: 'Avoid',
        points: [
          'Acidic or strongly alkaline cleaners unless the product says it is safe for your stone.',
          'Rock salt and de-icing chemicals on stone surfaces.',
        ],
      },
      {
        heading: 'Sealing and upkeep',
        points: [
          'Porous stones are often sealed to resist stains and moss. Ask your installer whether sealing suits your stone and setting.',
        ],
      },
    ],
  },
];

export const careGuideFor = (stoneType: string) =>
  CARE_GUIDES_ENABLED ? careGuides.find((g) => g.stoneType === stoneType) : undefined;
