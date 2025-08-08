import { buttonVariants } from "@workspace/ui/components/button";
import { cn } from "@workspace/ui/lib/utils";

import "@workspace/ui/sections/hero-section.css";
import type { JSX } from "react";

interface HomeHeroSectionProps {
  siteConfig?: Record<string, any>;
}

export function HomeHeroSection({
  siteConfig = {
    name: "",
    description: "",
    url: "",
    ogImage: "",
    links: {
      twitter: "",
      github: "",
    },
  },
}: HomeHeroSectionProps): JSX.Element {
  return (
    <section className="py-6 pb-8 pt-9 md:pb-12 md:pt-10 lg:py-32">
      <div className="container flex max-w-[64rem] flex-col items-center gap-4 text-center">
        <a
          className="rounded-2xl bg-muted px-4 py-1.5 text-sm font-medium"
          href={siteConfig?.links?.twitter}
          target="_blank"
        >
          Follow along on Twitter
        </a>
        <h1 className="font-heading font-bold text-5xl md:text-6xl lg:text-7xl">
          Revolutionize video creation with Swipe
          <div className="important_word text-[#c10528] mb-5 font-bold" />
        </h1>
        <div className="px-4 mt-4 w-full">
          <a
            className={cn("w-2/6", buttonVariants({ variant: "default" }))}
            href="/login"
          >
            Get Started
          </a>
          <a
            className={cn(buttonVariants({ variant: "outline", size: "lg" }))}
            href={siteConfig?.links?.github}
            rel="noreferrer"
            target="_blank"
          >
            GitHub
          </a>
        </div>
      </div>
    </section>
  );
}
