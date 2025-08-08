import { CardSkeleton } from "@workspace/ui/components/card-skeleton";
import type { JSX } from "react";

export function UserAuthFormFallback(): JSX.Element {
  return <CardSkeleton />;
}
