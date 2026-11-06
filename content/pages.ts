/**
 * Page copy migrated from the legacy site (index.html, about.html, services, case studies, projects,
 * contact). Text is kept as written; only duplicated statements were removed and capitalisation fixed.
 */

export interface Faq {
  q: string;
  a: string;
}

// ---------------- Shared ----------------
/** VERIFY: legacy homepage says both "100+" and "200+" completed projects; 200+ is used in the stats, about page and hero. */
export const companyStats = [
  { value: '12+', label: 'Years of excellence' },
  { value: '200+', label: 'Projects delivered' },
  { value: '50+', label: 'Trusted partners' },
  { value: '4.9/5', label: 'Client satisfaction' },
];

export const process = [
  {
    step: '01',
    title: 'Consult',
    text: 'Understand your space, style, and budget with expert stone guidance.',
  },
  { step: '02', title: 'Select', text: 'Choose from our wide range of stone products.' },
  {
    step: '03',
    title: 'Fabricate',
    text: 'Precision cutting and finishing with advanced fabrication technology.',
  },
  { step: '04', title: 'Install', text: 'Flawless on-site installation delivered on time, every time.' },
];

export const testimonials = [
  {
    quote:
      'We recently completed our villa in Bengaluru and sourced granite from SK Stones India. The team guided us in choosing the right material — quality, finishing, and delivery were outstanding.',
    name: 'Raghavendra M.',
  },
  {
    quote:
      'Their collection is extensive, and the team patiently explained the differences between various stones. The quality exceeded our expectations and transformed the look of our home.',
    name: 'Ar. Viswapriya',
  },
  {
    quote:
      'The material was exactly as shown during selection, and the quality was consistent across all slabs. Excellent communication throughout — highly recommended.',
    name: 'Ar. Zabi Ahmed',
  },
  {
    quote:
      'Their team understood my requirements and suggested options that perfectly matched my design vision. The craftsmanship and finish of the stone are exceptional.',
    name: 'Shristi S.',
  },
  {
    quote:
      'SK Stones India delivered exactly what they promised. Excellent quality with beautiful natural patterns, competitive pricing, and timely delivery. A pleasure to work with.',
    name: 'Harikishor',
  },
  {
    quote:
      'Their team demonstrated strong product knowledge and helped us select materials that met both our design and budget requirements. We look forward to working with them again.',
    name: 'Srinivasa Rao M.',
  },
];

export const featuredReview = {
  heading: 'Excellence. Expertise. Trust.',
  quote:
    'Working with S K Stones India (formerly Shree Stones & Services) was seamless from start to finish. Their craftsmanship, precision, and commitment to quality truly exceeded expectations. Every detail reflected expertise, making our project stand out beautifully.',
  name: 'DFA Architects, Bangalore',
};

// ---------------- Home ----------------
export const home = {
  hero: {
    eyebrow: 'Crafting timeless spaces since 2014',
    heading: "We Don't Just Supply.",
    headingAccent: 'We Shape Experiences.',
    lead: 'Where exceptional stones create extraordinary spaces. Trusted by architects, builders & interior designers across India.',
    image: 'project-luxury-lobby',
  },
  about: {
    eyebrow: 'Who we are',
    heading: 'Built on trust.',
    headingAccent: 'Proven by results.',
    text: 'From selecting the perfect stone to flawless installation, we bring craftsmanship, consistency, and reliability to every project. S K Stones India (formerly Shree Stones & Services) supplies, fabricates and installs premium stone from our Koramangala showroom in Bengaluru.',
    video: {
      label: 'Behind the stone',
      title: 'From Quarry to Finish',
      text: 'This video takes you through how we source, cut, and prepare every slab — the same precision and care that goes into every residential and commercial project we deliver.',
    },
    pillars: [
      {
        title: 'Premium-grade material only',
        text: 'Every stone we supply goes through strict quality checks for strength, durability, and beauty. Only top-tier stones that meet our standards are approved.',
      },
      {
        title: 'Expert recommendations',
        text: 'Our specialists guide you toward the ideal stone for every space, considering usage, design style, maintenance needs, and budget.',
      },
      {
        title: 'Precision installation',
        text: 'Our trained team delivers perfectly aligned stonework with seamless joints, crack-free installation and accurate levelling.',
      },
      {
        title: '100% custom solutions',
        text: 'Fully customised stone concepts tailored to your vision — custom stone art, unique patterns and textures, handcrafted detailing.',
      },
    ],
  },
  faqs: [
    {
      q: 'What is the difference between marble and granite?',
      a: 'Marble offers elegant veining and a luxurious feel — ideal for living areas, bathrooms, and feature walls. Granite is harder, more scratch-resistant, and better suited for kitchens, high-traffic floors, and outdoor areas. Our team helps you choose based on usage, maintenance, and design goals.',
    },
    {
      q: 'Do you supply only, or supply and install?',
      a: 'We offer both. You can purchase stone slabs from our showroom, or opt for end-to-end supply, fabrication, and on-site installation through our expert execution teams.',
    },
    {
      q: 'How long does a typical project take?',
      a: 'Timelines depend on project size and stone type. Residential flooring typically takes 2–6 weeks; commercial and elevation projects may take 1–5 months. We provide a clear schedule after site assessment and stone selection.',
    },
    {
      q: 'Do you work outside Bengaluru?',
      a: 'Yes. While our showroom is in Koramangala, Bengaluru, we supply and execute projects across Karnataka and pan-India for architects, builders, and commercial clients.',
    },
    {
      q: 'Can I visit your showroom to see stones in person?',
      a: 'Absolutely. Visit us at 627-628, 15th Main, 80 Feet Road, 5th Cross Rd, 4th Block, Bengaluru, Karnataka 560034. Walk in during business hours or call +91 70226 30994 to schedule a guided consultation with our stone experts.',
    },
    {
      q: 'How do I get a quote for my project?',
      a: 'Fill out our enquiry form with stone type, dimensions, and site location — or WhatsApp us directly. Our team responds within 24 hours with guidance and a tailored quote.',
    },
  ] satisfies Faq[],
};

// ---------------- About ----------------
export const about = {
  hero: {
    heading: 'Premium stones for every vision.',
    headingAccent: 'Every space.',
    lead: 'We have delivered 200+ successful stone projects. S K Stones India (formerly Shree Stones & Services) blends craftsmanship, innovation, and precision engineering to deliver refined stone solutions tailored for residential, commercial, hospitality, and architectural environments with unwavering quality.',
    points: [
      'Architectural stone solutions',
      'Advanced fabrication technology',
      'Authentic material sourcing',
      'Client-centric delivery',
    ],
  },
  sectors: [
    'Luxury Hotels',
    'Commercial Spaces',
    'Premium Villas',
    'Airports & Infrastructure',
    'Healthcare',
  ],
  purpose: [
    {
      title: 'Crafting lasting excellence',
      text: 'We create refined stone solutions using precision, innovation, and exceptional craftsmanship, ensuring every project meets superior quality standards and long-term performance expectations.',
    },
    {
      title: 'Engineering material integrity',
      text: 'Our sourcing network ensures authentic stones for long-lasting installations. We partner with verified quarries globally to bring you the finest materials.',
    },
    {
      title: 'Innovating through precision',
      text: 'Advanced cutting technologies and engineering processes for detailed stonework. Our state-of-the-art machinery ensures perfect cuts every time.',
    },
  ],
  founder: {
    name: 'Shree Kumar Gandhi',
    role: 'Founder & CEO, S K Stones India Pvt. Ltd.',
    paragraphs: [
      'Our journey began with a commitment to elevate the standards of stone craftsmanship, driven by a vision to blend technology, artistry, and precision for every client we serve.',
      'From humble beginnings to large-scale architectural collaborations, our growth has been shaped by dedication, problem-solving, and the belief that exceptional results come from relentless learning and adaptation.',
      'S K Stones India (formerly Shree Stones & Services) stands today as the outcome of years refining processes, empowering skilled artisans, and building a culture that values integrity, innovation, and client-focused solutions.',
    ],
  },
  team: [
    { name: 'Shree Kumar Gandhi', role: 'Founder & CEO' },
    { name: 'Syed Jeelan', role: 'Project Management & Operations' },
    { name: 'Shubhangi', role: 'AI Growth Engineer' },
    { name: 'Dilip Sain', role: 'Project Management & Operations' },
    { name: 'Sarah', role: 'Account & Operations' },
    { name: 'Soumen Ghosh', role: 'Project Management & Operations' },
    { name: 'Sunit Mundhada', role: 'Project Management & Operations' },
  ],
};

// ---------------- Services ----------------
export interface ServicePage {
  slug: string;
  name: string;
  title: string;
  description: string;
  heading: string;
  lead: string;
  heroImage: string;
  /** VERIFY: per-service figures from the legacy pages; years harmonised to 12+ (company founded 2014). */
  stats: { value: string; label: string }[];
  approach: { heading: string; text: string; pillars: { title: string; text: string; points: string[] }[] };
  gallery: { heading: string; text: string; images: { key: string; alt: string }[] };
  faqIntro: string;
  faqs: Faq[];
  cta: { heading: string; text: string };
  relatedCategories: string[];
}

const execPillar = (
  team: string,
  teamPoints: string[],
  coord: string,
  coordPoints: string[],
  quality: string,
  qualityPoints: string[],
) => [
  { title: 'Skilled execution team', text: team, points: teamPoints },
  { title: 'On-site coordination', text: coord, points: coordPoints },
  { title: 'Quality standards', text: quality, points: qualityPoints },
];

export const services: ServicePage[] = [
  {
    slug: 'installations',
    name: 'Installations',
    title: 'Stone Installation Services in Bengaluru | S K Stones India',
    description:
      'Precision stone installation for homes and commercial projects: layout, substrate preparation, joint control and finish detailing by S K Stones India.',
    heading: 'Precision-driven stone installation expertise',
    lead: 'We deliver carefully planned stone installation with accuracy, durability, and craftsmanship — coordinating layout, materials, and on-site execution across residential and commercial projects.',
    heroImage: 'installation-1',
    stats: [
      { value: '12+', label: 'Years of experience' },
      { value: '1,200+', label: 'Projects completed' },
      { value: '50+', label: 'Expert installers' },
      { value: '99%', label: 'Client satisfaction' },
    ],
    approach: {
      heading: 'Built with precision planning and on-site control',
      text: 'With years of hands-on execution experience, our installation approach is driven by accuracy, coordination, and disciplined site management.',
      pillars: execPillar(
        'Experienced supervisors and technicians ensuring correct alignment, surface finish, safety compliance, and consistent execution across all installation stages.',
        [
          'Layout accuracy',
          'Substrate preparation',
          'Joint control',
          'Finish detailing',
          'Safety compliance',
        ],
        'Structured coordination between materials, manpower, tools, and timelines to maintain smooth execution without delays or quality compromises.',
        ['Resource planning', 'Timeline management', 'Quality checkpoints', 'Workflow continuity'],
        'Every installation is verified through checkpoints focusing on durability, finish accuracy, joint consistency, and long-term performance assurance.',
        ['Surface integrity', 'Finish uniformity', 'Alignment accuracy', 'Load stability'],
      ),
    },
    gallery: {
      heading: 'Our installation work',
      text: 'Showcasing precision stone installations across residential and commercial projects.',
      images: [
        { key: 'installation-1', alt: 'Premium stone installation work' },
        { key: 'installation-2', alt: 'Dark marble wall cladding' },
        { key: 'installation-3', alt: 'Stone landscaping water feature' },
        { key: 'installation-4', alt: 'Luxury marble flooring' },
      ],
    },
    faqIntro:
      'Get clarity on our installation process, timelines, site requirements, quality checks, and execution standards.',
    faqs: [
      {
        q: 'What preparation is required before stone installation begins?',
        a: 'Site measurements, surface readiness, level checks, access planning, and material inspection are completed in advance to avoid execution issues and ensure smooth installation workflow.',
      },
      {
        q: 'How do you ensure accuracy during installation execution?',
        a: 'Accuracy is maintained through precise measurements, alignment checks, experienced supervision, proper tooling, and stage-wise verification throughout the installation process.',
      },
      {
        q: 'What factors affect installation timelines and scheduling?',
        a: 'Timelines depend on site readiness, material availability, design complexity, area size, weather conditions, and coordination with other ongoing site activities.',
      },
      {
        q: 'How is quality checked during and after installation?',
        a: 'Quality is verified through surface finish inspection, alignment consistency checks, joint uniformity assessment, stability testing, and final walkthrough before project handover.',
      },
      {
        q: 'Do you handle on-site challenges during execution?',
        a: 'Yes, our team addresses on-site challenges through immediate assessment, corrective planning, coordination adjustments, and practical solutions without compromising installation quality.',
      },
    ],
    cta: {
      heading: "Let's start your installation today",
      text: 'Premium stone installation services for homes, offices & commercial spaces.',
    },
    relatedCategories: ['marbles', 'granites', 'wall-claddings'],
  },
  {
    slug: 'landscaping',
    name: 'Landscaping',
    title: 'Stone Landscaping Services in Bengaluru | S K Stones India',
    description:
      'Landscape execution with natural stone: paving, terraced gardens, borders and pebble gardens, with drainage and levelling handled by S K Stones India.',
    heading: 'Precision-driven landscape execution expertise',
    lead: 'We deliver carefully planned landscaping execution ensuring balance, durability, drainage efficiency, material harmony, and precise on-site coordination across residential, commercial, and outdoor environments.',
    heroImage: 'landscaping-1',
    stats: [
      { value: '12+', label: 'Years of experience' },
      { value: '500+', label: 'Landscape projects' },
      { value: '30+', label: 'Expert team members' },
      { value: '99%', label: 'Client satisfaction' },
    ],
    approach: {
      heading: 'Built with landscape planning and site precision',
      text: 'With structured outdoor execution expertise, our landscaping services focus on accuracy, coordination, material control, and disciplined on-ground management.',
      pillars: execPillar(
        'Experienced landscape supervisors and technicians ensure proper grading, plant placement, surface finishing, safety compliance, and consistent execution across every stage of landscaping.',
        ['Proper grading', 'Plant placement', 'Surface finishing', 'Safety compliance'],
        'Planned coordination between plants, materials, manpower, tools, and schedules ensures seamless landscaping execution without delays or quality compromises.',
        ['Resource planning', 'Timeline management', 'Quality checkpoints', 'Workflow continuity'],
        'Every landscaping project is evaluated through defined checkpoints focusing on drainage alignment, surface levelling accuracy, material durability, and finish precision.',
        [
          'Drainage alignment',
          'Surface levelling accuracy',
          'Material durability',
          'Finish precision',
          'Long-term outdoor performance',
        ],
      ),
    },
    gallery: {
      heading: 'Our landscaping work',
      text: 'Showcasing precision landscape projects across residential and commercial outdoor spaces.',
      images: [
        { key: 'landscaping-1', alt: 'Modern courtyard stone paving' },
        { key: 'landscaping-2', alt: 'Terraced garden with stone steps' },
        { key: 'landscaping-3', alt: 'Decorative stone border edging' },
        { key: 'landscaping-4', alt: 'Natural pebble garden design' },
      ],
    },
    faqIntro:
      'Get clarity on our landscaping process, timelines, site preparation requirements, quality checks, and execution standards.',
    faqs: [
      {
        q: 'What preparation is required before landscaping begins?',
        a: 'Before installation, we assess site levels, substrate strength, drawings, measurements, access routes, material readiness, moisture conditions, and safety requirements, ensuring the area is fully prepared for execution.',
      },
      {
        q: 'How do you ensure accuracy during landscaping execution?',
        a: 'Accuracy is ensured through calibrated tools, detailed drawings, skilled supervision, continuous alignment checks, controlled cutting, trial placements, and systematic verification at each stage.',
      },
      {
        q: 'What factors affect landscaping timelines?',
        a: 'Timelines depend on design complexity, material availability, site readiness, weather conditions, coordination with other trades, access limitations, and approval cycles.',
      },
      {
        q: 'How is quality checked during and after landscaping?',
        a: 'Quality is checked through stage-wise inspections, alignment verification, finish evaluation, joint consistency reviews, load and durability checks, documentation records, and final walkthroughs.',
      },
      {
        q: 'Do you handle on-site challenges during execution?',
        a: 'Yes, our team manages on-site challenges by adjusting execution methods, coordinating resources, resolving technical issues promptly, and maintaining workflow continuity.',
      },
    ],
    cta: {
      heading: "Let's start your landscaping project today",
      text: 'Premium landscaping services for homes, offices & commercial outdoor spaces.',
    },
    relatedCategories: ['natural-stones', 'cobble-stones', 'pebbles'],
  },
  {
    slug: 'flooring-executions',
    name: 'Flooring Executions',
    title: 'Marble & Granite Flooring Installation in Bengaluru | S K Stones India',
    description:
      'Stone flooring execution with laser levelling, seamless joints and polished finishes for homes, offices and commercial interiors across Bengaluru.',
    heading: 'Precision-driven stone flooring execution',
    lead: 'We deliver carefully planned flooring execution with precise levelling, seamless joints, and polished finishes crafted for homes, offices, and commercial interiors.',
    heroImage: 'flooring-1',
    stats: [
      { value: '12+', label: 'Years of experience' },
      { value: '800+', label: 'Flooring projects' },
      { value: '1M+', label: 'Sq. ft. installed' },
      { value: '99%', label: 'Client satisfaction' },
    ],
    approach: {
      heading: 'Built with flooring execution and site discipline',
      text: 'Our flooring execution approach is driven by systematic planning, controlled workflows, precise measurements, and consistent supervision — ensuring reliable installation outcomes across varied interior spaces.',
      pillars: execPillar(
        'Trained flooring professionals handle layout accuracy, substrate preparation, joint control, finish detailing, safety compliance, and consistent phase-wise execution.',
        [
          'Layout accuracy',
          'Substrate preparation',
          'Joint control',
          'Finish detailing',
          'Safety compliance',
          'Consistent phase-wise execution',
        ],
        'Active coordination of resources, sequencing, and task flow ensures uninterrupted flooring progress while aligning activities efficiently with site conditions and parallel trades.',
        ['Resource coordination', 'Task sequencing', 'Parallel trade alignment', 'Workflow continuity'],
        'Each flooring project undergoes structured inspection checkpoints covering surface integrity, finish uniformity, alignment accuracy, load behaviour stability, and long-term functional durability.',
        [
          'Surface integrity',
          'Finish uniformity',
          'Alignment accuracy',
          'Load behaviour stability',
          'Long-term functional durability',
        ],
      ),
    },
    gallery: {
      heading: 'Our flooring work',
      text: 'Showcasing precision flooring installations across residential and commercial spaces.',
      images: [
        { key: 'flooring-1', alt: 'Luxury hotel lobby marble flooring' },
        { key: 'flooring-2', alt: 'Modern interior marble staircase' },
        { key: 'flooring-3', alt: 'White marble living and dining area' },
        { key: 'flooring-4', alt: 'Modern kitchen marble countertop' },
        { key: 'flooring-5', alt: 'Premium commercial marble flooring' },
        { key: 'flooring-6', alt: 'Polished marble kitchen surface' },
      ],
    },
    faqIntro:
      'Get clarity on our flooring installation process, timelines, site preparation requirements, quality checks, and execution standards.',
    faqs: [
      {
        q: 'What preparation is required before flooring installation begins?',
        a: 'Before flooring installation we evaluate substrate condition levels, moisture tolerance, layout drawings, access movement, protection planning, material readiness, and safety controls ensuring the area is fully prepared.',
      },
      {
        q: 'How do you ensure accuracy during flooring execution?',
        a: 'Accuracy is achieved through laser levelling, calibrated tools, layout markings, skilled supervision, controlled cutting, dry fit checks, and continuous alignment verification at each stage maintaining uniform results.',
      },
      {
        q: 'What factors affect flooring execution timelines?',
        a: 'Flooring timelines depend on material type, area size, surface preparation, curing requirements, site readiness, coordination with other trades, access constraints, and approval stages planned carefully to avoid delays.',
      },
      {
        q: 'How is quality checked during and after flooring installation?',
        a: 'Quality is verified through stage inspections, level checks, joint alignment, surface finish reviews, load tolerance testing, documentation records, and final walkthroughs ensuring flooring meets durability standards.',
      },
      {
        q: 'Do you manage on-site challenges during flooring execution?',
        a: 'Our team handles on-site challenges by adjusting execution methods, coordinating manpower, materials and tools, resolving substrate issues promptly, and maintaining workflow continuity ensuring project progress remains uninterrupted.',
      },
    ],
    cta: {
      heading: "Let's begin your flooring project today",
      text: 'Premium flooring execution services for homes, offices & commercial spaces.',
    },
    relatedCategories: ['marbles', 'granites', 'tiles'],
  },
  {
    slug: 'stone-art-installations',
    name: 'Stone Art Installations',
    title: 'Stone Art Installations | Murals & Feature Walls | S K Stones India',
    description:
      'Custom stone art installations — feature walls, murals and sculpted details — planned, fixed and finished on site by S K Stones India craftsmen.',
    heading: 'Precision-driven stone art installation expertise',
    lead: 'We deliver custom stone art installations — feature walls, murals, and sculpted details — with careful planning, material harmony, and precise on-site craftsmanship.',
    heroImage: 'stoneart-1',
    stats: [
      { value: '12+', label: 'Years of experience' },
      { value: '300+', label: 'Art installations' },
      { value: '50+', label: 'Custom designs' },
      { value: '99%', label: 'Client satisfaction' },
    ],
    approach: {
      heading: 'Built with artistic layout & site precision',
      text: 'With specialised stone art execution expertise, our installations focus on accurate placement, visual balance, secure fixing methods, and controlled on-site handling throughout the process.',
      pillars: execPillar(
        'Experienced stone art installers and supervisors ensure correct positioning and symmetry, fine detailing accuracy, surface finish integrity, safety compliance, and consistent execution across all artistic stages.',
        [
          'Correct positioning and symmetry',
          'Fine detailing accuracy',
          'Surface finish integrity',
          'Safety compliance',
          'Consistent execution',
        ],
        'Planned coordination between stone elements, fixing systems, manpower, tools, and sequencing ensures smooth installation flow without misalignment, damage, or execution delays.',
        [
          'Stone element coordination',
          'Fixing system management',
          'Installation sequencing',
          'Quality checkpoints',
        ],
        'Every stone art installation is evaluated through defined inspection checkpoints focusing on structural bonding strength, finish precision, alignment consistency, and long-term visual durability.',
        [
          'Structural bonding strength',
          'Finish precision',
          'Alignment consistency',
          'Long-term visual durability',
          'Material stability',
        ],
      ),
    },
    gallery: {
      heading: 'Our stone art work',
      text: 'Showcasing artistic stone installations including murals, fountains, water features, and decorative installations.',
      images: [
        { key: 'stoneart-1', alt: 'Modern courtyard stone paving design' },
        { key: 'stoneart-2', alt: 'Natural stone pathway with boulder walls' },
        { key: 'stoneart-3', alt: 'Colourful garden with stone edging' },
        { key: 'stoneart-4', alt: 'Curved stone border landscaping' },
        { key: 'stoneart-5', alt: 'Stone retaining wall with flowers' },
      ],
    },
    faqIntro:
      'Get clarity on our stone art installation process, layout planning, fixing techniques, quality standards, and execution methods.',
    faqs: [
      {
        q: 'What preparation is required before stone art installation begins?',
        a: 'We assess wall/surface conditions, structural support, design layouts, fixing systems, material sequencing, access requirements, and safety measures before starting any stone art installation.',
      },
      {
        q: 'How do you ensure accuracy during installation execution?',
        a: 'Accuracy is maintained through precise measurements, layout markings, skilled positioning, alignment verification, controlled fixing, and continuous supervision throughout the artistic installation process.',
      },
      {
        q: 'What factors affect installation timelines and scheduling?',
        a: 'Timelines depend on design complexity, piece sizes, fixing methods, surface conditions, access constraints, curing requirements, and coordination with other site activities.',
      },
      {
        q: 'How is quality checked during and after installation?',
        a: 'Quality is verified through alignment checks, bonding strength tests, finish evaluation, visual balance assessment, stability verification, and final walkthrough inspection before handover.',
      },
      {
        q: 'Do you handle on-site challenges during execution?',
        a: 'Yes, our team manages challenges through adaptive fixing methods, coordination adjustments, material handling solutions, and workflow modifications without compromising artistic quality or structural integrity.',
      },
    ],
    cta: {
      heading: "Let's start your stone art installation today",
      text: 'Premium stone art installation services for homes, offices & commercial spaces.',
    },
    relatedCategories: ['stone-art', 'feature-wall', 'murals-monuments'],
  },
];

// ---------------- Case studies ----------------
export interface CaseStudy {
  slug: string;
  sector: string;
  cardTitle: string;
  cardText: string;
  title: string;
  description: string;
  heading: string;
  lead: string;
  facts: { value: string; label: string }[];
  sections: { heading: string; paragraphs?: string[]; list?: string[] }[];
  images: { key: string; alt: string }[];
  cta: { heading: string; text: string; button: string; whatsapp: string };
}

export const caseStudies: CaseStudy[] = [
  {
    slug: 'case-study-ritz-carlton',
    sector: 'Hospitality · Stone Elevation',
    cardTitle: 'Luxury hotel stone elevation',
    cardText: 'Grand façade cladding with premium natural stone — 12,000+ sq. ft. delivered in 4 months.',
    title: 'Case Study: Luxury Hotel Stone Elevation & Façade Cladding | S K Stones India',
    description:
      'How S K Stones India delivered 12,000+ sq. ft. of natural stone façade cladding for a landmark hospitality project in Bengaluru in 4 months.',
    heading: 'Luxury hotel stone elevation & façade cladding',
    lead: 'A landmark hospitality project requiring grand stone elevations that combine architectural presence, weather resistance, and a refined natural finish visible from every angle.',
    facts: [
      { value: '12,000+', label: 'Sq. ft. cladding' },
      { value: '4 months', label: 'Project timeline' },
      { value: 'Natural stone', label: 'Material' },
      { value: 'Elevation', label: 'Service type' },
    ],
    sections: [
      {
        heading: 'The challenge',
        paragraphs: [
          "The client needed a façade that reflected five-star luxury while withstanding Bangalore's climate — monsoon exposure, temperature shifts, and high-traffic public visibility.",
          'Stone selection, joint detailing, and installation sequencing had to align with strict architectural drawings and on-site coordination with multiple contractors.',
        ],
      },
      {
        heading: 'Our solution',
        paragraphs: [
          'S K Stones India sourced premium natural stone slabs, performed precision fabrication, and executed façade cladding with uniform alignment and seamless visual continuity.',
          "Our team managed material logistics, on-site quality checks, and finishing to deliver an elevation that elevates the building's curb appeal and brand identity.",
        ],
      },
      {
        heading: 'The result',
        paragraphs: [
          "A striking stone elevation that defines the property's exterior — textured depth, consistent colour tones, and craftsmanship that meets international hospitality standards.",
          'The project stands as a reference for architects and developers seeking premium stone cladding at scale.',
        ],
      },
      {
        heading: 'Scope delivered',
        list: [
          'Stone selection & sampling',
          'Fabrication & edge finishing',
          'Façade cladding installation',
          'Quality inspection & handover',
        ],
      },
    ],
    images: [
      { key: 'project-ritz-carlton', alt: 'Stone elevation exterior of the hotel' },
      { key: 'installation-2', alt: 'Cladding detail' },
      { key: 'installation-3', alt: 'Installation process' },
    ],
    cta: {
      heading: 'Planning a similar project?',
      text: 'Get expert guidance on stone selection, cladding systems, and installation for your hospitality or commercial build.',
      button: 'Get a similar quote',
      whatsapp:
        "Hi, I saw the luxury hotel stone elevation case study. I'd like a similar stone elevation quote.",
    },
  },
  {
    slug: 'case-study-luxury-villa',
    sector: 'Residential · Flooring',
    cardTitle: 'Luxury villa marble flooring',
    cardText: 'Book-matched Italian marble across 8,500 sq. ft. with mirror-polish finishing.',
    title: 'Case Study: Luxury Villa Italian Marble Flooring | S K Stones India',
    description:
      'Book-matched Italian marble flooring across 8,500 sq. ft. of a Bengaluru villa, installed in 6 weeks with laser-level alignment and mirror polish.',
    heading: 'Luxury villa — Italian marble flooring',
    lead: 'A high-end residential project in Bengaluru featuring book-matched marble floors across living areas, bedrooms, and staircases with mirror-polish finishing.',
    facts: [
      { value: '8,500', label: 'Sq. ft. floored' },
      { value: '6 weeks', label: 'Installation' },
      { value: 'Italian marble', label: 'Material' },
      { value: 'Flooring', label: 'Service' },
    ],
    sections: [
      {
        heading: 'The challenge',
        paragraphs: [
          'The homeowner wanted a seamless, luxury look across multiple levels — with consistent veining, zero lippage, and durability for daily family use.',
          'Coordination with interior designers and MEP teams was critical to maintain floor levels and expansion joints.',
        ],
      },
      {
        heading: 'Our solution',
        paragraphs: [
          'We curated marble slabs with matched veining, performed precision cutting on-site, and executed flooring with laser-level alignment and professional polishing.',
          'Each room transition was planned for visual flow — creating a cohesive, hotel-like ambience throughout the villa.',
        ],
      },
    ],
    images: [
      { key: 'flooring-1', alt: 'Marble flooring in the villa lobby' },
      { key: 'flooring-2', alt: 'Polished marble floor and staircase' },
      { key: 'flooring-3', alt: 'Marble flooring detail' },
    ],
    cta: {
      heading: 'Want similar flooring for your home?',
      text: 'Visit our Koramangala showroom or request a site visit for stone selection and quote.',
      button: 'Get a flooring quote',
      whatsapp: "Hi, I'm interested in luxury marble flooring for my villa.",
    },
  },
  {
    slug: 'case-study-airport',
    sector: 'Commercial · Infrastructure',
    cardTitle: 'Airport & commercial lobby',
    cardText: 'High-traffic stone flooring at scale — durable, uniform, and built for 24/7 operations.',
    title: 'Case Study: Airport & Commercial Lobby Stone Flooring | S K Stones India',
    description:
      'Granite and marble flooring for airport and commercial lobbies: 25,000+ sq. ft. installed in phases over 5 months for 24/7 operations.',
    heading: 'Airport & commercial lobby — stone flooring',
    lead: 'High-traffic commercial and infrastructure spaces demanding durable stone flooring, uniform finishes, and installation at scale without compromising on aesthetics.',
    facts: [
      { value: '25,000+', label: 'Sq. ft.' },
      { value: '5 months', label: 'Timeline' },
      { value: 'Granite & marble', label: 'Materials' },
      { value: 'Commercial', label: 'Sector' },
    ],
    sections: [
      {
        heading: 'The challenge',
        paragraphs: [
          'Airport and large commercial lobbies face extreme foot traffic, rolling luggage, and 24/7 operations. Stone had to be slip-resistant, low-maintenance, and installed within tight construction schedules.',
        ],
      },
      {
        heading: 'Our solution',
        paragraphs: [
          'S K Stones India supplied hard-wearing granite and marble, planned phased installation to avoid disruption, and delivered consistent joint alignment across vast floor areas with professional polishing and sealing.',
        ],
      },
    ],
    images: [
      { key: 'project-airport-departures', alt: 'Airport departures area' },
      { key: 'project-luxury-lobby', alt: 'Commercial lobby' },
      { key: 'project-aster-hospital', alt: 'Healthcare commercial space' },
    ],
    cta: {
      heading: 'Commercial project enquiry?',
      text: 'We handle large-scale supply and installation for airports, hospitals, hotels, and corporate spaces.',
      button: 'Request a commercial quote',
      whatsapp: 'Hi, I have a commercial stone flooring project.',
    },
  },
];

// ---------------- Projects gallery ----------------
export const projectGallery = [
  { key: 'gallery-wall-cladding', alt: 'Natural stone wall cladding' },
  { key: 'gallery-stone-project', alt: 'Stone project' },
  { key: 'cheetah-stone-art', alt: 'Cheetah stone art' },
  { key: 'gallery-hall-interior', alt: 'Hall interior with stone flooring' },
  { key: 'gallery-hotel-reception', alt: 'Luxury hotel reception' },
  { key: 'gallery-commercial-project', alt: 'Commercial project' },
  { key: 'gallery-stone-installation', alt: 'Stone installation' },
  { key: 'gallery-residential-project', alt: 'Residential project' },
  { key: 'gallery-architectural-stone-work', alt: 'Architectural stone work' },
  { key: 'project-aster-hospital', alt: 'Aster Hospital' },
  { key: 'stone-wall-art', alt: 'Stone wall art' },
  { key: 'circular-stone-pattern', alt: 'Circular stone pattern inlay' },
];

// ---------------- Contact ----------------
export const contactFaqs: Faq[] = [
  {
    q: 'How quickly will I receive a quote?',
    a: 'We typically respond within 24 hours on business days. For urgent projects, call or WhatsApp us directly at +91 70226 30994.',
  },
  {
    q: 'What details should I include in my enquiry?',
    a: 'Stone type, approximate quantity or area (sq. ft.), site location, thickness/size requirements, and whether you need supply only or full installation.',
  },
  {
    q: 'Can I schedule a showroom visit?',
    a: 'Yes — walk in during business hours or mention your preferred date in the form. Our Koramangala showroom has live stone samples across granites, marbles, and claddings.',
  },
];
