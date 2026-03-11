export type GalleryItem = {
  title: string;
  description: string;
  src: string;
  alt: string;
};

export const GALLERY_ITEMS: GalleryItem[] = [
  {
    title: 'UI Motion Study',
    description: 'Micro-interaction concept for onboarding emphasis.',
    src: '/media/gallery-motion.svg',
    alt: 'Gallery placeholder for motion study',
  },
  {
    title: '3D Icon Direction',
    description: 'Exploration of playful iconography for product highlights.',
    src: '/media/gallery-3d.svg',
    alt: 'Gallery placeholder for 3D icon direction',
  },
  {
    title: 'Visual Tone Board',
    description: 'Typography and color combinations for brand direction.',
    src: '/media/gallery-tone.svg',
    alt: 'Gallery placeholder for visual tone board',
  },
];
