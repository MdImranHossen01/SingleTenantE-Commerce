import dynamic from 'next/dynamic';

// --- NAVBARS ---
const NavbarV1 = dynamic(() => import('./navbars/NavbarV1'));
const NavbarV2 = dynamic(() => import('./navbars/NavbarV2'));
const NavbarV3 = dynamic(() => import('./navbars/NavbarV3'));
const NavbarV4 = dynamic(() => import('./navbars/NavbarV4'));
const NavbarV5 = dynamic(() => import('./navbars/NavbarV5'));
const NavbarAarong = dynamic(() => import('./navbars/NavbarAarong'));
const NavbarGhorerBazar = dynamic(() => import('./navbars/NavbarGhorerBazar'));
const NavbarFalak = dynamic(() => import('./navbars/NavbarFalak'));

export const NavbarSelector = ({ style }: { style: string }) => {
  switch (style) {
    case 'v1': return <NavbarV1 />;
    case 'v2': return <NavbarV2 />;
    case 'v3': return <NavbarV3 />;
    case 'v4': return <NavbarV4 />;
    case 'v5': return <NavbarV5 />;
    case 'aarong': return <NavbarAarong />;
    case 'ghorer-bazar': return <NavbarGhorerBazar />;
    case 'falak': return <NavbarFalak />;
    default: return <NavbarV1 />;
  }
};

// --- HEROS ---
const HeroV1 = dynamic(() => import('./heros/HeroV1'));
const HeroV2 = dynamic(() => import('./heros/HeroV2'));
const HeroV3 = dynamic(() => import('./heros/HeroV3'));
const HeroV4 = dynamic(() => import('./heros/HeroV4'));
const HeroV5 = dynamic(() => import('./heros/HeroV5'));
const HeroAarong = dynamic(() => import('./heros/HeroAarong'));
const HeroGhorerBazar = dynamic(() => import('./heros/HeroGhorerBazar'));
const HeroFalak = dynamic(() => import('./heros/HeroFalak'));

export const HeroSelector = ({ style, banners, layout, onSlideChange }: { style: string, banners: any[], layout?: string, onSlideChange?: (index: number) => void }) => {
  switch (style) {
    case 'v1': return <HeroV1 banners={banners} layout={layout} onSlideChange={onSlideChange} />;
    case 'v2': return <HeroV2 banners={banners} onSlideChange={onSlideChange} />;
    case 'v3': return <HeroV3 banners={banners} />;
    case 'v4': return <HeroV4 banners={banners} onSlideChange={onSlideChange} />;
    case 'v5': return <HeroV5 banners={banners} />;
    case 'aarong': return <HeroAarong banners={banners} layout={layout} onSlideChange={onSlideChange} />;
    case 'ghorer-bazar': return <HeroGhorerBazar banners={banners} onSlideChange={onSlideChange} />;
    case 'falak': return <HeroFalak banners={banners} onSlideChange={onSlideChange} />;
    default: return <HeroV1 banners={banners} layout={layout} onSlideChange={onSlideChange} />;
  }
};

// --- PRODUCT CARDS ---
const ProductCardV1 = dynamic(() => import('./product-cards/ProductCardV1'));
const ProductCardV2 = dynamic(() => import('./product-cards/ProductCardV2'));
const ProductCardV3 = dynamic(() => import('./product-cards/ProductCardV3'));
const ProductCardV4 = dynamic(() => import('./product-cards/ProductCardV4'));
const ProductCardV5 = dynamic(() => import('./product-cards/ProductCardV5'));
const ProductCardV6 = dynamic(() => import('./product-cards/ProductCardV6'));
const ProductCardAarong = dynamic(() => import('./product-cards/ProductCardAarong'));

export const ProductCardSelector = ({ style, product, isFlashSale, priority, layout }: { style: string, product: any, isFlashSale?: boolean, priority?: boolean, layout?: string }) => {
  switch (style) {
    case 'v1': return <ProductCardV1 product={product} isFlashSale={isFlashSale} />;
    case 'v2': return <ProductCardV2 product={product} isFlashSale={isFlashSale} />;
    case 'v3': return <ProductCardV3 product={product} isFlashSale={isFlashSale} />;
    case 'v4': return <ProductCardV4 product={product} isFlashSale={isFlashSale} />;
    case 'v5': return <ProductCardV5 product={product} isFlashSale={isFlashSale} />;
    case 'v6': return <ProductCardV6 product={product} isFlashSale={isFlashSale} priority={priority} layout={layout} />;
    case 'aarong': return <ProductCardAarong product={product} isFlashSale={isFlashSale} priority={priority} layout={layout} />;
    default: return <ProductCardV1 product={product} isFlashSale={isFlashSale} />;
  }
};

// --- CATEGORIES ---
const CategoryV1 = dynamic(() => import('./categories/CategoryV1'));
const CategoryV2 = dynamic(() => import('./categories/CategoryV2'));
const CategoryV3 = dynamic(() => import('./categories/CategoryV3'));
const CategoryV4 = dynamic(() => import('./categories/CategoryV4'));
const CategoryV5 = dynamic(() => import('./categories/CategoryV5'));
const CategoryAarong = dynamic(() => import('./categories/CategoryAarong'));

export const CategorySelector = ({ style, categories }: { style: string, categories: any[] }) => {
  // Only show main categories (where parentCategory is null, undefined or empty)
  const mainCategories = (categories || []).filter((cat) => !cat.parentCategory);

  switch (style) {
    case 'v1': return <CategoryV1 categories={mainCategories} />;
    case 'v2': return <CategoryV2 categories={mainCategories} />;
    case 'v3': return <CategoryV3 categories={mainCategories} />;
    case 'v4': return <CategoryV4 categories={mainCategories} />;
    case 'v5': return <CategoryV5 categories={mainCategories} />;
    case 'aarong': return <CategoryAarong categories={mainCategories} />;
    default: return <CategoryV1 categories={mainCategories} />;
  }
};

