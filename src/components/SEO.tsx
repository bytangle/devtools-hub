import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title: string;
  description: string;
  keywords?: string;
  canonicalUrl?: string;
  type?: 'website' | 'article';
  jsonLd?: Record<string, unknown>;
}

export const SEO = ({ 
  title, 
  description, 
  keywords,
  canonicalUrl,
  type = 'website',
  jsonLd,
}: SEOProps) => {
  const fullTitle = title.includes('devv.tools') ? title : `${title} - devv.tools`;
  const siteUrl = typeof window !== 'undefined' ? window.location.origin : 'https://devv.tools';
  const ogImage = 'https://dev-tools-hub.s3.us-east-1.amazonaws.com/og.png';
  const fullCanonicalUrl = canonicalUrl ? `${siteUrl}${canonicalUrl}` : (typeof window !== 'undefined' ? window.location.href : siteUrl);

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      {keywords && <meta name="keywords" content={keywords} />}
      <link rel="canonical" href={fullCanonicalUrl} />
      
      {/* Open Graph */}
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:type" content={type} />
      <meta property="og:url" content={fullCanonicalUrl} />
      <meta property="og:site_name" content="devv.tools" />
      <meta property="og:image" content={ogImage} />
      <meta property="og:locale" content="en_US" />
      
      {/* Twitter */}
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:site" content="@bytangle" />
      <meta name="twitter:image" content={ogImage} />
      
      {/* Additional SEO */}
      <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />
      <meta name="author" content="devv.tools" />

      {/* JSON-LD Structured Data */}
      {jsonLd && (
        <script type="application/ld+json">
          {JSON.stringify(jsonLd)}
        </script>
      )}
    </Helmet>
  );
};