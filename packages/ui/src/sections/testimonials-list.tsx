import { HomeTestimonialsItem } from "@workspace/ui/sections/testimonials-item";
import type * as React from "react";

interface HomeFeaturesListProps {
  items?: Record<string, any>[];
  children?: React.ReactNode;
}

export function HomeTestimonialsList({
  items = [],
}: HomeFeaturesListProps): React.JSX.Element {
  return (
    <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-2">
      {items.map((item) => (
        <HomeTestimonialsItem key={crypto.randomUUID()} {...item} />
      ))}
    </div>
  );
}
