import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Input } from "@workspace/ui/components/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Activity,
  Bell,
  ChevronDown,
  DollarSign,
  Menu,
  Package,
  Search,
  TrendingUp,
  Users,
} from "lucide-react";
import { cookies } from "next/headers";
import Link from "next/link";
import { Suspense } from "react";
import { DashboardProducts } from "./dashboard-products";
import { LogoutButton } from "./logout-button";

// Type definitions for API responses
interface Metric {
  title: string;
  value: string;
  change: string;
  trend: string;
  icon: string;
}

interface ActivityItem {
  id: string;
  type: string;
  user: string;
  action: string;
  time: string;
  value: string;
}

interface SubscriptionItem {
  id: number;
  customer: string;
  email: string;
  type: string;
  status: string;
  date: string;
  amount: string;
}

// Icon mapping
const iconMap = {
  DollarSign,
  Users,
  Activity,
  TrendingUp,
};

async function getMetrics(): Promise<Metric[]> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    const response = await fetch(
      "http://localhost:3000/api/dashboard/metrics",
      {
        cache: "no-store", // Always fetch fresh data
        headers: {
          Cookie: sessionCookie ? `session=${sessionCookie.value}` : "",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch metrics");
    }

    const data = await response.json();
    return data.metrics || [];
  } catch (error) {
    console.error("Error fetching metrics:", error);
    // Return fallback data if API fails
    return [
      {
        title: "Total Revenue",
        value: "$0",
        change: "+0%",
        trend: "up",
        icon: "DollarSign",
      },
      {
        title: "Subscriptions",
        value: "0",
        change: "+0%",
        trend: "up",
        icon: "Users",
      },
      {
        title: "Active Users",
        value: "0",
        change: "+0%",
        trend: "up",
        icon: "Activity",
      },
      {
        title: "Conversion Rate",
        value: "0%",
        change: "+0%",
        trend: "up",
        icon: "TrendingUp",
      },
    ];
  }
}

async function getRecentActivity(): Promise<ActivityItem[]> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    const response = await fetch(
      "http://localhost:3000/api/dashboard/activity",
      {
        cache: "no-store",
        headers: {
          Cookie: sessionCookie ? `session=${sessionCookie.value}` : "",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch activity");
    }

    const data = await response.json();
    return data.recentActivity || [];
  } catch (error) {
    console.error("Error fetching activity:", error);
    return [];
  }
}

async function getRecentSubscriptions(): Promise<SubscriptionItem[]> {
  try {
    const cookieStore = await cookies();
    const sessionCookie = cookieStore.get("session");

    const response = await fetch(
      "http://localhost:3000/api/dashboard/subscriptions",
      {
        cache: "no-store",
        headers: {
          Cookie: sessionCookie ? `session=${sessionCookie.value}` : "",
        },
      },
    );

    if (!response.ok) {
      throw new Error("Failed to fetch subscriptions");
    }

    const data = await response.json();
    return data.subscriptions || [];
  } catch (error) {
    console.error("Error fetching subscriptions:", error);
    return [];
  }
}

async function MetricsCards() {
  const metrics = await getMetrics();

  return (
    <div className="grid gap-4 md:grid-cols-2 md:gap-8 lg:grid-cols-4">
      {metrics.map((metric) => {
        const Icon = iconMap[metric.icon as keyof typeof iconMap] || DollarSign;
        return (
          <Card key={metric.title}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                {metric.title}
              </CardTitle>
              <Icon
                className="h-4 w-4 text-muted-foreground"
                aria-hidden="true"
              />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                {metric.change} from last month
              </p>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}

async function RecentActivityCard() {
  const recentActivity = await getRecentActivity();

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Activity</CardTitle>
        <CardDescription>
          Latest subscription and user activities
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentActivity.length > 0 ? (
            recentActivity.map((activity) => (
              <div key={activity.id} className="flex items-center">
                <div className="ml-4 space-y-1">
                  <p className="text-sm font-medium leading-none">
                    {activity.user}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    {activity.action}
                  </p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-sm font-medium">{activity.value}</p>
                  <p className="text-xs text-muted-foreground">
                    {activity.time}
                  </p>
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground">No recent activity</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}

// Dashboard Header Component
function DashboardHeader() {
  return (
    <div className="w-full border-b bg-background">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <Package className="h-8 w-8 text-primary" />
            <span className="text-2xl font-bold text-gray-900">
              SaaS Starter
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="relative">
            <Search
              className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground"
              aria-hidden="true"
            />
            <Input
              type="search"
              placeholder="Search..."
              className="w-[200px] lg:w-[320px] pl-9"
            />
          </div>

          <Button variant="outline" size="icon" className="h-9 w-9">
            <Bell className="h-4 w-4" aria-hidden="true" />
            <span className="sr-only">Notifications</span>
          </Button>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="outline"
                size="icon"
                className="overflow-hidden rounded-full h-9 w-9"
              >
                <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm">
                  JD
                </div>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuLabel>My Account</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem asChild>
                <Link href="/dashboard/settings">Profile</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/team">Team Settings</Link>
              </DropdownMenuItem>
              <DropdownMenuItem asChild>
                <Link href="/dashboard/pricing">Pricing</Link>
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <LogoutButton />
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </div>
  );
}

// Create a version without the built-in sidebar and header
async function DashboardWithoutSidebar() {
  const recentSubscriptions = await getRecentSubscriptions();

  return (
    <div className="grid flex-1 items-start gap-4 md:gap-8">
      <div className="grid gap-4 md:gap-8">
        {/* Products Management Section - Client Component */}
        <DashboardProducts />

        <Suspense fallback={<div>Loading metrics...</div>}>
          <MetricsCards />
        </Suspense>

        <div className="grid gap-4 md:gap-8 lg:grid-cols-2 xl:grid-cols-3">
          <Card className="xl:col-span-2">
            <CardHeader className="flex flex-row items-center">
              <div className="grid gap-2">
                <CardTitle>Recent Subscriptions</CardTitle>
                <CardDescription>
                  Latest subscription activity for your team.
                </CardDescription>
              </div>
              <Button asChild size="sm" className="ml-auto gap-1">
                <Link href="/dashboard/subscriptions">
                  View All
                  <ChevronDown className="h-4 w-4" aria-hidden="true" />
                </Link>
              </Button>
            </CardHeader>
            <CardContent>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Customer</TableHead>
                    <TableHead className="hidden xl:table-cell">Type</TableHead>
                    <TableHead className="hidden xl:table-cell">
                      Status
                    </TableHead>
                    <TableHead className="hidden xl:table-cell">Date</TableHead>
                    <TableHead className="text-right">Amount</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {recentSubscriptions.length > 0 ? (
                    recentSubscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell>
                          <div className="font-medium">
                            {subscription.customer}
                          </div>
                          <div className="hidden text-sm text-muted-foreground md:inline">
                            {subscription.email}
                          </div>
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          {subscription.type}
                        </TableCell>
                        <TableCell className="hidden xl:table-cell">
                          <Badge
                            className="text-xs"
                            variant={
                              subscription.status === "Active"
                                ? "secondary"
                                : subscription.status === "Canceled"
                                  ? "destructive"
                                  : "outline"
                            }
                          >
                            {subscription.status}
                          </Badge>
                        </TableCell>
                        <TableCell className="hidden md:table-cell lg:hidden xl:table-cell">
                          {subscription.date}
                        </TableCell>
                        <TableCell className="text-right">
                          {subscription.amount}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell
                        colSpan={5}
                        className="text-center text-muted-foreground"
                      >
                        No subscriptions found
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
          <Suspense fallback={<div>Loading activity...</div>}>
            <RecentActivityCard />
          </Suspense>
        </div>
      </div>
    </div>
  );
}

export default function DashboardPage() {
  return <DashboardWithoutSidebar />;
}
