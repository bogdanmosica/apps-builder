import { HomeFeatureItem } from "@workspace/ui/sections/feature-item";
import type * as React from "react";

interface HomeFeaturesListProps {
  items?: Record<string, any>[];
  children?: React.ReactNode;
}

export function HomeFeaturesList({
  items = [],
}: HomeFeaturesListProps): React.JSX.Element {
  return (
    <div className="mx-auto grid justify-center gap-4 sm:grid-cols-2 md:max-w-[64rem] md:grid-cols-3">
      {items.map((item) => (
        <HomeFeatureItem key={crypto.randomUUID()} {...item} />
      ))}
    </div>
  );
}
