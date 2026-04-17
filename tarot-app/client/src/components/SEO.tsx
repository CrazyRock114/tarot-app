import { Helmet } from 'react-helmet-async';

interface SEOProps {
  title?: string;
  description?: string;
  image?: string;
  url?: string;
}

const defaults = {
  title: '2or Tarot - AI-Powered Online Tarot Reading',
  description: 'Professional AI tarot readings. Free card draws for love, career & more.',
  image: 'https://2or.com/cards/00-fool.jpg',
  url: 'https://2or.com',
};

const SEO: React.FC<SEOProps> = ({ title, description, image, url }) => {
  const t = title ? `${title} - 2or.com Tarot` : defaults.title;
  const d = description || defaults.description;
  const img = image || defaults.image;
  const u = url || defaults.url;

  return (
    <Helmet>
      <title>{t}</title>
      <meta name="description" content={d} />
      <meta property="og:title" content={t} />
      <meta property="og:description" content={d} />
      <meta property="og:image" content={img} />
      <meta property="og:url" content={u} />
      <meta name="twitter:title" content={t} />
      <meta name="twitter:description" content={d} />
      <meta name="twitter:image" content={img} />
    </Helmet>
  );
};

export default SEO;
