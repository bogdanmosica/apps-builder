import { HomeFeaturesList } from '@workspace/ui/sections/features-list';
import { JSX } from 'react';

interface HomeFeaturesSectionProps {
  marketingConfig?: Record<string, any>;
}

export function HomeFeaturesSection({
  marketingConfig,
}: HomeFeaturesSectionProps): JSX.Element {
  return (
    <section
      className='container py-6 bg-slate-50 dark:bg-transparent md:pb-12 lg:pb-24'
      id='features'
    >
      <div className='mx-auto flex max-w-[58rem] flex-col items-center py-6 text-center'>
        <h2 className='font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl'>
          Features
        </h2>
        <p className='max-w-[85%] leading-normal text-muted-foreground md:my-6 sm:text-lg sm:leading-7'>
          Swipe is a revolutionary video editor app that takes the hassle out of
          video creation and lets you unleash your creativity effortlessly.
          Whether you&apos;re a seasoned marketeer or someone looking to create
          quick videos on the fly, Swipe is designed to cater to all your needs.
        </p>
      </div>

      <HomeFeaturesList items={marketingConfig?.mainFeatures} />
    </section>
  );
}
