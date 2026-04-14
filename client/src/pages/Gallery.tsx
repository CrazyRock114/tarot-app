import SEO from '../components/SEO';
import TarotGallery from '../components/tarot/TarotGallery';

const Gallery = () => {
  return (
    <>
      <SEO title="78张塔罗牌图鉴" description="完整的78张塔罗牌图鉴，包含22张大阿卡纳和56张小阿卡纳，了解每张牌的含义与象征。" />
      <TarotGallery />
    </>
  );
};

export default Gallery;
