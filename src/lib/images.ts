// Curated cyberpunk stock photography from Pexels (free license).
// Direct image URLs — referenced, not downloaded.
//
// The gallery portraits evoke the spirit of the Edgerunners cast without
// using copyrighted anime artwork — each is a free Pexels stock photo.

const px = (id: number, slug: string, w = 1200) =>
  `https://images.pexels.com/photos/${id}/pexels-photo-${id}/${slug}.jpeg?auto=compress&cs=tinysrgb&w=${w}`;

export const IMAGES = {
  heroBg: px(30315845, 'urban-street-scene-at-night-with-neon-lights', 1920),

  // About-section feature cards
  aboutPortrait: px(8108330, 'man-in-black-jacket-smiling', 900),
  aboutRobotic: px(31840611, 'futuristic-cyberpunk-woman-with-robotic-arm', 900),

  // Gallery — 6 portraits evoking the Edgerunners crew
  gallery: [
    px(36064312, 'futuristic-cyberpunk-portrait-in-vibrant-colors', 800),   // young man, vibrant neon — David vibe
    px(8108553, 'woman-in-neon-light-at-the-party', 800),                   // woman in neon light — Lucy vibe
    px(6940320, 'neon-lights-behind-a-bald-man', 800),                     // bald man, tough — Maine vibe
    px(2825033, 'model-holding-neon-lights', 800),                          // woman holding neon — Rebecca vibe
    px(8108429, 'man-in-black-t-shirt', 800),                               // man in black, neon — Pilar vibe
    px(8108589, 'woman-leaning-on-a-wall', 800),                            // woman leaning, neon — Kiwi vibe
  ],

  // Quote portraits
  quotes: [
    px(8108382, 'man-in-black-jacket', 400),
    px(8107899, 'woman-wearing-sunglasses', 400),
    px(2825033, 'model-holding-neon-lights', 400),
  ],

  // Crew Database — 8 classified files (custom artwork)
  crew: {
    rebecca: 'https://ik.imagekit.io/zznoau6lx/20554e356cc5d2aa70e5fc880535bf18.webp',
    maine: 'https://ik.imagekit.io/zznoau6lx/d9d371de7501def548f18eb5349bebbb.webp',
    kiwi: 'https://ik.imagekit.io/zznoau6lx/fd4f1562a41cf38f05527f8e62d63fde.webp',
    dorio: 'https://ik.imagekit.io/zznoau6lx/5ea2fd030cf5b1673fe02b9ab11af75f.webp',
    pilar: 'https://ik.imagekit.io/zznoau6lx/cosplaying-as-pilar-v0-og7cwrxlec1e1.webp',
    david: 'https://ik.imagekit.io/zznoau6lx/Cybercoin%20webp/david2.webp',
    lucy: 'https://ik.imagekit.io/zznoau6lx/will-lucy-appear-cyberpunk-edgerunners-2-v0-q6krc34tz9bf1.webp',
  },

  roadmapBg: px(10591995, 'street-in-city-at-night-after-rain', 1600),
  buyBg: px(31966784, 'futuristic-portrait-with-neon-lighting', 1200),
  footerBg: px(31987988, 'free-photo-of-futuristic-fashion-portrait-with-neon-glow', 1600),
};
