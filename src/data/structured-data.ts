import { AGENT_PROFILE, PAGE_METADATA, SITE_BASE_URL } from './agent-profile';

const absoluteUrl = (path: string) => new URL(path, SITE_BASE_URL).toString();

export const personStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'Person',
  name: AGENT_PROFILE.officialName,
  alternateName: AGENT_PROFILE.casualAlias,
  jobTitle: AGENT_PROFILE.role,
  url: SITE_BASE_URL,
  sameAs: AGENT_PROFILE.contactLinks
    .filter((item) => item.label !== 'Portfolio')
    .map((item) => item.url),
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Kyiv',
    addressCountry: 'Ukraine',
  },
  knowsAbout: [
    'mobile product design',
    'mobile B2C app design',
    '0-to-1 product design',
    'craft-heavy product polish',
    'visual systems',
    'motion design',
    '3D interface craft',
    'AI-assisted design workflows',
  ],
});

export const profilePageStructuredData = () => ({
  '@context': 'https://schema.org',
  '@type': 'ProfilePage',
  name: AGENT_PROFILE.officialName,
  headline: PAGE_METADATA.home.title,
  abstract: AGENT_PROFILE.shortPositioning,
  description: PAGE_METADATA.home.description,
  url: SITE_BASE_URL,
  mainEntity: personStructuredData(),
});

export const caseCreativeWorkStructuredData = ({
  slug,
  title,
  description,
  keywords,
}: {
  slug: 'fora' | 'kissa';
  title: string;
  description: string;
  keywords: string[];
}) => ({
  '@context': 'https://schema.org',
  '@type': 'CreativeWork',
  name: title,
  headline: title,
  abstract: description,
  description,
  url: absoluteUrl(`/${slug}`),
  mainEntityOfPage: absoluteUrl(`/${slug}`),
  author: {
    '@type': 'Person',
    name: AGENT_PROFILE.officialName,
    alternateName: AGENT_PROFILE.casualAlias,
    jobTitle: AGENT_PROFILE.role,
    url: SITE_BASE_URL,
  },
  creator: {
    '@type': 'Person',
    name: AGENT_PROFILE.officialName,
    alternateName: AGENT_PROFILE.casualAlias,
    jobTitle: AGENT_PROFILE.role,
    url: SITE_BASE_URL,
  },
  about: keywords,
  keywords,
});
