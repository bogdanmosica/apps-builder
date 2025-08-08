import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import type * as React from "react";

type HomeFeatureItemProps = {
  children?: React.ReactNode;
} & Record<string, any>;

export function HomeTestimonialsItem({
  authorName,
  companyName,
  description,
}: HomeFeatureItemProps): React.JSX.Element {
  return (
    <Card className="relative overflow-hidden rounded-lg border bg-background p-2">
      <CardHeader>
        <CardTitle>{authorName}</CardTitle>
        <CardDescription className="italic">{companyName}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm">{description}</p>
      </CardContent>
    </Card>
  );
}
