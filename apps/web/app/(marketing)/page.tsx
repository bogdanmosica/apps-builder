import { HomeFeaturesSection } from '@workspace/ui/sections/features-section';
import { HomeHeroSection } from '@workspace/ui/sections/hero-section';
import { HomeTestimonialsSection } from '@workspace/ui/sections/testimonials-section';
import { siteConfig } from '../../config/site';
import { marketingConfig } from '../../config/marketing';

export default async function IndexPage() {
  return (
    <>
      <HomeHeroSection siteConfig={siteConfig} />
      <HomeFeaturesSection marketingConfig={marketingConfig} />
      <HomeTestimonialsSection marketingConfig={marketingConfig} />
    </>
  );
}
