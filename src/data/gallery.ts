export type GalleryCardType = 'phone' | 'tablet' | 'illustration' | 'image';
export type GalleryIllustrationContent = 'coin-wheel' | 'cube' | 'terminal' | 'cup-wheel' | 'hairy-tubes';
export type GalleryScreenMediaKind = 'image' | 'video';
export type GalleryDeviceLoadPriority = 'critical' | 'lazy';

export interface GalleryScreenMedia {
  kind: GalleryScreenMediaKind;
  src: string;
  poster?: string;
}

interface GalleryCardBase {
  id: string;
  type: GalleryCardType;
  colSpan: 2 | 4;
  alt: string;
}

export interface GalleryPhoneCard extends GalleryCardBase {
  type: 'phone';
  colSpan: 2;
  screen: GalleryScreenMedia;
  shellSrc: string;
  priority: GalleryDeviceLoadPriority;
}

export interface GalleryTabletCard extends GalleryCardBase {
  type: 'tablet';
  colSpan: 2;
  screen: GalleryScreenMedia;
  shellSrc: string;
  priority: GalleryDeviceLoadPriority;
}

export interface GalleryIllustrationCard extends GalleryCardBase {
  type: 'illustration';
  colSpan: 2;
  content: GalleryIllustrationContent;
}

export interface GalleryImageCard extends GalleryCardBase {
  type: 'image';
  colSpan: 4;
  imageSrc: string;
  darkImageSrc?: string;
}

export type GalleryRowItem = GalleryPhoneCard | GalleryTabletCard | GalleryIllustrationCard | GalleryImageCard;

export interface GalleryRow {
  id: string;
  items: GalleryRowItem[];
}

const PHONE_SHELL_SRC = '/media/gallery/device-shells/phone-shell.webp';
const TABLET_SHELL_SRC = '/media/gallery/device-shells/tablet-shell.webp';

const screenImage = (src: string): GalleryScreenMedia => ({
  kind: 'image',
  src,
});

const screenVideo = (src: string, poster: string): GalleryScreenMedia => ({
  kind: 'video',
  src,
  poster,
});

const phone = (
  id: string,
  screen: GalleryScreenMedia,
  alt: string,
  priority: GalleryDeviceLoadPriority = 'lazy',
): GalleryPhoneCard => ({
  id,
  type: 'phone',
  colSpan: 2,
  screen,
  shellSrc: PHONE_SHELL_SRC,
  priority,
  alt,
});

const tablet = (
  id: string,
  screen: GalleryScreenMedia,
  alt: string,
  priority: GalleryDeviceLoadPriority = 'lazy',
): GalleryTabletCard => ({
  id,
  type: 'tablet',
  colSpan: 2,
  screen,
  shellSrc: TABLET_SHELL_SRC,
  priority,
  alt,
});

const illustration = (id: string, content: GalleryIllustrationContent, alt: string): GalleryIllustrationCard => ({
  id,
  type: 'illustration',
  colSpan: 2,
  content,
  alt,
});

const image = (id: string, imageSrc: string, alt: string, darkImageSrc?: string): GalleryImageCard => ({
  id,
  type: 'image',
  colSpan: 4,
  imageSrc,
  darkImageSrc,
  alt,
});

export const GALLERY_ROWS: GalleryRow[] = [
  {
    id: 'row-1',
    items: [
      phone('51:5263', screenImage('/media/gallery/screens/r1-c1-phone.webp'), 'Gallery phone card: red editorial mobile concept'),
      phone(
        '51:5269',
        screenVideo('/media/gallery/flows/r1-c2-phone.webm', '/media/gallery/posters/r1-c2-phone.png'),
        'Gallery phone card: scenic path mobile concept',
      ),
      illustration('51:5274', 'coin-wheel', 'Gallery illustration card: coin wheel'),
      phone('51:5279', screenImage('/media/gallery/screens/r1-c4-phone.webp'), 'Gallery phone card: focus mode weather app'),
    ],
  },
  {
    id: 'row-2',
    items: [
      phone('51:5286', screenImage('/media/gallery/screens/r2-c1-phone.webp'), 'Gallery phone card: kids wallet dashboard'),
      illustration('51:5287', 'cube', 'Gallery illustration card: cube'),
      tablet(
        '51:5288',
        screenVideo('/media/gallery/flows/r2-c3-tablet.webm', '/media/gallery/posters/r2-c3-tablet.png'),
        'Gallery tablet card: Kissa recognition flow',
      ),
      illustration('51:5289', 'terminal', 'Gallery illustration card: payment terminal'),
    ],
  },
  {
    id: 'row-3',
    items: [
      illustration('53:5326', 'cup-wheel', 'Gallery illustration card: cup wheel'),
      phone(
        '53:5327',
        screenVideo('/media/gallery/flows/r3-c2-phone.webm', '/media/gallery/posters/r3-c2-phone.png'),
        'Gallery phone card: Echo Journal concept',
      ),
      phone(
        '53:5328',
        screenImage('/media/gallery/screens/r3-c3-phone.webp'),
        'Gallery phone card: portfolio finance tracker',
      ),
      phone(
        '53:5329',
        screenVideo('/media/gallery/flows/r3-c4-phone.webm', '/media/gallery/posters/r3-c4-phone.png'),
        'Gallery phone card: Lights smart-home concept',
      ),
    ],
  },
  {
    id: 'row-4',
    items: [
      phone(
        '57:5417',
        screenVideo('/media/gallery/flows/r4-c1-phone.webm', '/media/gallery/posters/r4-c1-phone.png'),
        'Gallery phone card: dark finance tasks',
      ),
      image('57:5418', '/media/gallery/images/r4-c2-image.webp', 'Gallery image card: Nova Poshta 3D composition'),
      phone('57:5420', screenImage('/media/gallery/screens/r4-c3-phone.webp'), 'Gallery phone card: socioligy concept'),
    ],
  },
  {
    id: 'row-5',
    items: [
      phone(
        '57:5448',
        screenVideo('/media/gallery/flows/r5-c1-phone.webm', '/media/gallery/posters/r5-c1-phone.png'),
        'Gallery phone card: festive campaign concept',
      ),
      phone('57:5449', screenImage('/media/gallery/screens/r5-c2-phone.webp'), 'Gallery phone card: neon game campaign concept'),
      image(
        '57:5450',
        '/media/gallery/images/r5-c3-cube-log-in.webp',
        'Gallery image card: cube log in composition',
        '/media/gallery/images/r5-c3-cube-log-in-dark.webp',
      ),
    ],
  },
  {
    id: 'row-6',
    items: [
      phone(
        '57:5469',
        screenVideo('/media/gallery/flows/r6-c1-phone.webm', '/media/gallery/posters/r6-c1-phone.png'),
        'Gallery phone card: referral rewards flow',
      ),
      illustration('57:5470', 'hairy-tubes', 'Gallery illustration card: hairy tubes'),
      phone(
        '57:5471',
        screenImage('/media/gallery/screens/r6-c3-phone.webp'),
        'Gallery phone card: social connections flow',
      ),
    ],
  },
];
