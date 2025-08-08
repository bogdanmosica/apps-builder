"use client";

import { Analytics as VercelAnalytics } from "@vercel/analytics/react";
import type { JSX } from "react";

export function Analytics(): JSX.Element {
  return <VercelAnalytics />;
}
