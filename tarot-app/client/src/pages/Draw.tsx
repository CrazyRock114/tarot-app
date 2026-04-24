import { useTranslation } from 'react-i18next';
import CardDrawing from '../components/tarot/CardDrawing';
import SEO from '../components/SEO';

export default function DrawPage() {
  const { t } = useTranslation();
  return (
    <>
      <SEO title={t('draw.seoTitle')} description={t('draw.seoDesc')} />
      <CardDrawing />
    </>
  );
}
