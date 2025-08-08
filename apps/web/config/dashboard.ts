import type { DashboardConfig } from "@workspace/types";

export const dashboardConfig: DashboardConfig = {
  mainNav: [
    {
      title: "Dashboard",
      href: "/dashboard",
    },
    {
      title: "Compositions",
      href: "/compositions",
    },
    {
      title: "Crawlers",
      href: "/crawlers",
    },
    {
      title: "Templates",
      href: "/templates",
    },
  ],
  sidebarNav: [
    {
      title: "Compositions",
      href: "/dashboard",
      icon: "post",
    },
    {
      title: "Billing",
      href: "/dashboard/billing",
      icon: "billing",
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: "settings",
    },
    {
      title: "Settings",
      href: "/dashboard/settings",
      icon: "settings",
    },
  ],
};
