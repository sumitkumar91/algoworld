import React from 'react';
import { Helmet } from 'react-helmet-async';

const SEO = ({ title, description, path = '' }) => {
  const siteUrl = 'https://algoworld.com';
  const url = `${siteUrl}${path}`;

  return (
    <Helmet>
      <title>{title}</title>
      <meta name="description" content={description} />
      
      {/* Open Graph / Facebook */}
      <meta property="og:type" content="website" />
      <meta property="og:url" content={url} />
      <meta property="og:title" content={title} />
      <meta property="og:description" content={description} />
      
      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:url" content={url} />
      <meta name="twitter:title" content={title} />
      <meta name="twitter:description" content={description} />
      
      {/* Canonical Link */}
      <link rel="canonical" href={url} />
    </Helmet>
  );
};

export default SEO;
