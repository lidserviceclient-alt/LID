import { Helmet } from 'react-helmet-async';

const SITE_NAME = 'Lid';
const BASE_URL  = 'https://lidshopping.com';
const DEFAULT_IMAGE = `${BASE_URL}/imgs/og-1.png`;

export default function PageSEO({
  title,
  description,
  canonical,
  image,
  noindex = false,
  type = 'website',
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Achetez et Vendez en Ligne`;
  const metaDesc  = description || 'Lid est la meilleure marketplace pour acheter et vendre en Côte d\'Ivoire. Mode, électronique, beauté : trouvez tout ce qu\'il vous faut.';
  const metaImage = image || DEFAULT_IMAGE;
  const metaUrl   = canonical ? `${BASE_URL}${canonical}` : BASE_URL;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={metaDesc} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}
      <link rel="canonical" href={metaUrl} />

      {/* Open Graph */}
      <meta property="og:type"        content={type} />
      <meta property="og:title"       content={fullTitle} />
      <meta property="og:description" content={metaDesc} />
      <meta property="og:url"         content={metaUrl} />
      <meta property="og:image"       content={metaImage} />
      <meta property="og:site_name"   content={SITE_NAME} />
      <meta property="og:locale"      content="fr_CI" />

      {/* Twitter */}
      <meta name="twitter:card"        content="summary_large_image" />
      <meta name="twitter:title"       content={fullTitle} />
      <meta name="twitter:description" content={metaDesc} />
      <meta name="twitter:image"       content={metaImage} />
    </Helmet>
  );
}
