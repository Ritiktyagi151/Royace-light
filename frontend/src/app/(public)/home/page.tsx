import { Metadata } from 'next';
import { BrandStoryRedesign } from '@/components/home/BrandStoryRedesign';

import { BlogSliderSection } from '@/components/home/BlogSliderSection';
import { CollectionShowcase } from '@/components/home/CollectionShowcase';
// import { FeaturedCategories } from '@/components/home/FeaturedCategories';
import { FeaturedProducts } from '@/components/home/FeaturedProducts';
import { HeroSection } from '@/components/home/HeroSection';
import HomePromoMosaic from '@/components/home/HomePromoMosaic';
import { NewsletterSection } from '@/components/home/NewsletterSection';
import { ServiceHighlights } from '@/components/home/ServiceHighlights';
import { Testimonials } from '@/components/home/Testimonials';
import { WhyChooseUs } from '@/components/home/WhyChooseUs';
import { fetchPublicCategories } from '@/lib/publicCategories';
import ExperienceStoresSection from '@/components/home/BannerVideoSection';


export const metadata: Metadata = {
  title: 'Royace Lighting - Luxury Chandeliers & Handcrafted Lighting',
  description:
    'Bespoke chandeliers and luxury lighting for extraordinary interiors. Crafted by master artisans for discerning homes.',
};

export default async function HomePage() {
  const collections = await fetchPublicCategories({ cache: 'no-store' });

  return (
    <div className="home-page">
      <HeroSection />
      <HomePromoMosaic />
      <ServiceHighlights />
      <ExperienceStoresSection />
      <BrandStoryRedesign />
      {/* <FeaturedCategories /> */}
      <FeaturedProducts collections={collections} />
      <CollectionShowcase />
      <WhyChooseUs />
      <BlogSliderSection />
      <Testimonials />
      <NewsletterSection />
    </div>
  );
}
