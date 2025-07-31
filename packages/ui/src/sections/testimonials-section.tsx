import { JSX } from 'react';
import { HomeTestimonialsList } from '@workspace/ui/sections/testimonials-list';

interface HomeTestimonialsSectionProps {
  marketingConfig?: Record<string, any>;
}
export function HomeTestimonialsSection({
  marketingConfig = {
    mainTestimonials: [
      {
        authorName: '',
        description: '',
        companyName: '',
      },
    ],
  },
}: HomeTestimonialsSectionProps): JSX.Element {
  return (
    <section className='container py-6 bg-slate-50 dark:bg-transparent md:pb-12 lg:pb-24'>
      <div className='mx-auto flex max-w-[58rem] flex-col items-center py-6 text-center'>
        <h2 className='font-heading text-3xl leading-[1.1] sm:text-3xl md:text-6xl'>
          Testimonials
        </h2>
      </div>
      <HomeTestimonialsList items={marketingConfig.mainTestimonials} />
    </section>
  );
}
