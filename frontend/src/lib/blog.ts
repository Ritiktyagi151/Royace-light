export type BlogSection = {
  heading: string;
  paragraphs: string[];
};

export type BlogPost = {
  slug: string;
  title: string;
  excerpt: string;
  category: string;
  date: string;
  readTime: string;
  image: string;
  content: BlogSection[];
  takeaways: string[];
};

export const blogPosts: BlogPost[] = [
  {
    slug: 'choose-right-chandelier-size-luxury-living-room',
    title: 'How to Choose the Right Chandelier Size for a Living Room',
    excerpt:
      'A practical guide to scale, ceiling height, finish, and light layering for Indian living rooms.',
    category: 'Design Guide',
    date: 'June 18, 2026',
    readTime: '6 min read',
    image:
      'https://images.unsplash.com/photo-1572955034096-233ea61a78d8?auto=format&fit=crop&w=1600&q=85',
    takeaways: [
      'Measure room width, length, and ceiling height before selecting the fixture.',
      'Use layered lighting so the chandelier is a focal point, not the only source.',
      'Match metal finish with nearby hardware, furniture, and architectural details.',
    ],
    content: [
      {
        heading: 'Start With Room Scale',
        paragraphs: [
          'A luxury living room needs a chandelier that feels intentional from every viewing angle. The most reliable starting point is the room size. Add the room length and width in feet, then use that number as an approximate chandelier diameter in inches.',
          'For double-height spaces, the fixture can be wider and taller because the room has more vertical volume. In compact rooms, a slimmer profile with strong detailing often feels more premium than an oversized piece.',
        ],
      },
      {
        heading: 'Respect Ceiling Height',
        paragraphs: [
          'Ceiling height decides how dramatic the drop can be. A chandelier should never interrupt movement, sightlines, or furniture use. For living rooms, keep the lowest crystal or frame comfortably above head level unless the fixture is centered over a table.',
          'In high ceilings, longer suspension, tiered forms, and vertical crystal arrangements help the light feel connected to the room instead of floating too far away.',
        ],
      },
      {
        heading: 'Balance Finish And Light Temperature',
        paragraphs: [
          'Warm metal finishes pair beautifully with ivory walls, marble floors, and wood textures. Chrome and polished nickel feel cleaner in contemporary interiors, while antique brass adds softness to classic spaces.',
          'For most homes, warm white lighting keeps skin tones, fabrics, and natural stone looking rich. Neutral white can work in modern spaces, but it should be used carefully so the room does not feel commercial.',
        ],
      },
    ],
  },
  {
    slug: 'warm-white-vs-neutral-white-home-lighting',
    title: 'Warm White vs Neutral White: What Works Best at Home',
    excerpt:
      'Understand color temperature and how it changes the mood of dining rooms, bedrooms, and foyers.',
    category: 'Lighting Basics',
    date: 'June 10, 2026',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1513506003901-1e6a229e2d15?auto=format&fit=crop&w=1200&q=85',
    takeaways: [
      'Warm white is best for lounges, bedrooms, dining rooms, and hospitality-style interiors.',
      'Neutral white works well in task zones where clean visibility matters.',
      'Avoid mixing too many color temperatures in one open-plan area.',
    ],
    content: [
      {
        heading: 'What Warm White Does',
        paragraphs: [
          'Warm white light gives interiors a softer, more relaxed feel. It works especially well with chandeliers because crystal, brass, and textured glass gain depth under warmer tones.',
          'Living rooms, bedrooms, and dining rooms usually benefit from this atmosphere because these are comfort-led spaces rather than work zones.',
        ],
      },
      {
        heading: 'Where Neutral White Works',
        paragraphs: [
          'Neutral white is useful in kitchens, vanity areas, wardrobes, and study corners where color clarity and task visibility matter more than ambience.',
          'If neutral white is used in a decorative fixture, balance it with warm accent lights so the space still feels residential and inviting.',
        ],
      },
    ],
  },
  {
    slug: 'bespoke-lighting-villas-installation-planning',
    title: 'Custom Lighting for Villas: What to Plan Before Installation',
    excerpt:
      'From ceiling points to reinforcement, these details keep custom lighting projects smooth on site.',
    category: 'Bespoke',
    date: 'May 28, 2026',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1540932239986-30128078f3c5?auto=format&fit=crop&w=1200&q=85',
    takeaways: [
      'Finalize ceiling points before false ceiling work is closed.',
      'Confirm fixture weight, mounting method, and access for maintenance.',
      'Coordinate lighting drawings with furniture layout and sightlines.',
    ],
    content: [
      {
        heading: 'Plan Before Ceiling Closure',
        paragraphs: [
          'Bespoke chandeliers need planning before the ceiling is finished. Electrical points, support plates, access panels, and hanging height should be confirmed early.',
          'This prevents last-minute compromises and keeps the final installation clean, aligned, and secure.',
        ],
      },
      {
        heading: 'Coordinate With Interior Layout',
        paragraphs: [
          'The best lighting plans respond to furniture placement, room proportions, and how people move through the villa. A chandelier should frame the space without blocking views or feeling disconnected from the seating layout.',
          'For stairwells and double-height spaces, mockups and elevation checks are especially helpful before production begins.',
        ],
      },
    ],
  },
  {
    slug: 'maintaining-crystal-chandeliers-shine',
    title: 'Maintaining Crystal Chandeliers Without Losing Their Shine',
    excerpt:
      'Simple care routines for preserving brilliance, finish quality, and fixture longevity.',
    category: 'Care',
    date: 'May 16, 2026',
    readTime: '3 min read',
    image:
      'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=1200&q=85',
    takeaways: [
      'Dust gently and often instead of waiting for heavy buildup.',
      'Use soft cloths and mild cleaning solutions for crystal surfaces.',
      'Schedule professional cleaning for large or high ceiling installations.',
    ],
    content: [
      {
        heading: 'Clean Gently And Consistently',
        paragraphs: [
          'Crystal chandeliers look best when dust is removed regularly. A soft microfiber cloth or gentle duster protects the surface while preserving sparkle.',
          'Avoid harsh chemicals on metal finishes. They can dull coatings, stain frames, or damage delicate detailing.',
        ],
      },
      {
        heading: 'Know When To Call Professionals',
        paragraphs: [
          'Large chandeliers, double-height installations, and delicate crystal arrangements should be handled by trained teams.',
          'Professional cleaning protects the fixture and keeps the installation safe, especially when ladders, scaffolding, or electrical checks are involved.',
        ],
      },
    ],
  },
  {
    slug: 'layered-lighting-ideas-dining-rooms',
    title: 'Layered Lighting Ideas for Dining Rooms',
    excerpt:
      'Combine chandeliers, wall lights, and accent lamps to create depth without visual clutter.',
    category: 'Inspiration',
    date: 'April 30, 2026',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&w=1200&q=85',
    takeaways: [
      'Use a chandelier as the visual anchor above the dining table.',
      'Add wall lights or lamps to soften the room edges.',
      'Install dimming so the same room works for family meals and hosting.',
    ],
    content: [
      {
        heading: 'Anchor The Table',
        paragraphs: [
          'The chandelier should visually belong to the dining table. Its width, drop, and shape should respond to the table size rather than the full room alone.',
          'Linear fixtures suit rectangular tables, while round chandeliers work beautifully over circular or square settings.',
        ],
      },
      {
        heading: 'Add Depth Around The Room',
        paragraphs: [
          'Wall lights, console lamps, and soft accent lighting prevent the room from feeling flat. They create a layered effect that looks more complete and more comfortable.',
          'A dimmer is one of the simplest upgrades for dining spaces because it lets the mood change through the evening.',
        ],
      },
    ],
  },
  {
    slug: 'foyer-chandelier-ideas-grand-entrance',
    title: 'Foyer Chandelier Ideas for a Grand Entrance',
    excerpt:
      'Create a strong first impression with the right chandelier scale, drop, and finish for entrance areas.',
    category: 'Inspiration',
    date: 'April 18, 2026',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=1200&q=85',
    takeaways: [
      'Choose a chandelier that fills vertical space without blocking the entry view.',
      'Use warm finishes to make the entrance feel welcoming from the first step.',
      'Check door swings, staircase sightlines, and ceiling height before installation.',
    ],
    content: [
      {
        heading: 'Let The Entrance Set The Tone',
        paragraphs: [
          'A foyer chandelier is often the first lighting feature guests notice. It should introduce the style of the home while still feeling practical for daily movement.',
          'For compact entrances, a refined flush or semi-flush chandelier can feel more elegant than an oversized hanging piece. In double-height foyers, vertical chandeliers create drama and help connect the upper and lower levels.',
        ],
      },
      {
        heading: 'Keep Sightlines Clear',
        paragraphs: [
          'The fixture should not interrupt the view into the home or block a staircase landing. Before choosing the drop, check how the chandelier looks from the doorway, living room, and upper floor.',
          'A centered chandelier works well in symmetrical foyers, while offset placement can be useful when the entrance shares space with a corridor or staircase.',
        ],
      },
    ],
  },
  {
    slug: 'hotel-lobby-lighting-lessons-for-homes',
    title: 'Hotel Lobby Lighting Ideas You Can Use at Home',
    excerpt:
      'Use hospitality lighting principles to make home interiors feel warmer, layered, and more premium.',
    category: 'Luxury Design',
    date: 'April 7, 2026',
    readTime: '5 min read',
    image:
      'https://images.unsplash.com/photo-1551918120-9739cb430c6d?auto=format&fit=crop&w=1200&q=85',
    takeaways: [
      'Combine statement lighting with soft background illumination.',
      'Use repeated finishes so every fixture feels part of one design language.',
      'Make dimming part of the plan for evening ambience.',
    ],
    content: [
      {
        heading: 'Layer More Than One Light Source',
        paragraphs: [
          'Hotel lobbies rarely rely on one fixture. They use chandeliers, wall lights, concealed lights, and accent lamps together so the room feels dimensional.',
          'The same principle works at home. A chandelier can be the main visual feature, while wall lights and soft cove lighting make the room comfortable after sunset.',
        ],
      },
      {
        heading: 'Repeat Finishes With Control',
        paragraphs: [
          'Luxury spaces feel composed when metal finishes, glass tones, and light temperatures repeat across the room. This does not mean every fixture must match exactly, but they should feel related.',
          'Choose one dominant finish, such as brass or bronze, and let secondary details support it through furniture hardware, mirrors, and decorative accessories.',
        ],
      },
    ],
  },
  {
    slug: 'choosing-wall-lights-for-bedroom-ambience',
    title: 'Choosing Wall Lights for Bedroom Ambience',
    excerpt:
      'Use wall lights to frame bedsides, soften corners, and add hotel-style comfort without clutter.',
    category: 'Bedroom Lighting',
    date: 'March 24, 2026',
    readTime: '4 min read',
    image:
      'https://images.unsplash.com/photo-1618220179428-22790b461013?auto=format&fit=crop&w=1200&q=85',
    takeaways: [
      'Place bedside wall lights at a comfortable reading height.',
      'Choose diffused shades to reduce glare near the bed.',
      'Coordinate wall light finishes with handles, lamps, and wardrobe hardware.',
    ],
    content: [
      {
        heading: 'Frame The Bed Comfortably',
        paragraphs: [
          'Wall lights can make bedrooms feel calmer and more finished, especially when they frame the bed evenly. They free up bedside table space and create a hotel-inspired look.',
          'Placement matters. The light should support reading without shining directly into the eyes, and switches should be easy to reach from the bed.',
        ],
      },
      {
        heading: 'Use Diffusion For Softness',
        paragraphs: [
          'Bedrooms need gentle light more than bright task lighting. Fabric shades, frosted glass, and indirect wall washers help create a relaxed atmosphere.',
          'For a richer effect, combine wall lights with a central decorative fixture and low-level lamps so the room has options for different moods.',
        ],
      },
    ],
  },
];

export const featuredBlogPost = blogPosts[0];

export function getBlogPost(slug: string) {
  return blogPosts.find((post) => post.slug === slug);
}

export function getRelatedBlogPosts(slug: string, limit = 3) {
  return blogPosts.filter((post) => post.slug !== slug).slice(0, limit);
}
