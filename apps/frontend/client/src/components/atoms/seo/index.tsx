import React from 'react';
import { Helmet } from 'react-helmet-async';
import { Platform } from 'react-native';

interface SEOProps {
  title?: string;
  description?: string;
  canonical?: string;
  ogTitle?: string;
  ogDescription?: string;
  ogImage?: string;
  twitterCard?: string;
}

const SEO: React.FC<SEOProps> = ({
  title,
  description,
  canonical,
  ogTitle,
  ogDescription,
  ogImage,
  twitterCard,
}) => {
  if (Platform.OS !== 'web') {
    return null;
  }

  return (
    <Helmet>
      <html lang="en" />
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {canonical && <link rel="canonical" href={canonical} />}

      {/* Open Graph / Facebook */}
      {ogTitle && <meta property="og:title" content={ogTitle} />}
      {ogDescription && <meta property="og:description" content={ogDescription} />}
      {ogImage && <meta property="og:image" content={ogImage} />}

      {/* Twitter */}
      {twitterCard && <meta name="twitter:card" content={twitterCard} />}
      {ogTitle && <meta name="twitter:title" content={ogTitle} />}
      {ogDescription && <meta name="twitter:description" content={ogDescription} />}
      {ogImage && <meta name="twitter:image" content={ogImage} />}
    </Helmet>
  );
};

export default SEO;
