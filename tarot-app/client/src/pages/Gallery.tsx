import { useTranslation } from 'react-i18next';
import SEO from '../components/SEO';
import TarotGallery from '../components/tarot/TarotGallery';

const Gallery = () => {
  const { t } = useTranslation();

  return (
    <>
      <SEO title={t('gallery.seoTitle')} description={t('gallery.seoDesc')} />
      <TarotGallery />
    </>
  );
};

export default Gallery;
