import { HomeFeaturesSection } from "@workspace/ui/sections/features-section";
import { HomeHeroSection } from "@workspace/ui/sections/hero-section";
import { HomeTestimonialsSection } from "@workspace/ui/sections/testimonials-section";
import { marketingConfig } from "../../config/marketing";
import { siteConfig } from "../../config/site";

export default async function IndexPage() {
  return (
    <>
      <HomeHeroSection siteConfig={siteConfig} />
      <HomeFeaturesSection marketingConfig={marketingConfig} />
      <HomeTestimonialsSection marketingConfig={marketingConfig} />
    </>
  );
}
