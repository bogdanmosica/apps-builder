"use client";

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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@workspace/ui/components/tabs";
import { TooltipProvider } from "@workspace/ui/components/tooltip";
import {
  BarChart3,
  Clock,
  Download,
  Globe,
  Loader2,
  MousePointer,
  RefreshCw,
  TrendingDown,
  TrendingUp,
  Users,
} from "lucide-react";
import { useEffect, useState } from "react";

// Advanced analytics data interface
interface AnalyticsData {
  realTimeMetrics: {
    activeUsers: number;
    pageViews: number;
    bounceRate: number;
    avgSessionDuration: string;
    conversionRate: number;
    revenue: number;
  };
  userEngagement: {
    totalSessions: number;
    newUsers: number;
    returningUsers: number;
    avgPagesPerSession: number;
    avgSessionDuration: string;
    bounceRate: number;
  };
  trafficSources: Array<{
    source: string;
    visitors: number;
    percentage: number;
    change: number;
  }>;
  deviceStats: Array<{
    device: string;
    users: number;
    percentage: number;
    change: number;
  }>;
  topPages: Array<{
    page: string;
    views: number;
    uniqueViews: number;
    avgTime: string;
    bounceRate: number;
  }>;
  conversionFunnels: Array<{
    step: string;
    users: number;
    conversion: number;
  }>;
  geographicData: Array<{
    country: string;
    users: number;
    percentage: number;
  }>;
  cohortAnalysis: Array<{
    cohort: string;
    users: number;
    month1?: number;
    month2?: number;
    month3?: number;
    month4?: number;
    month5?: number;
  }>;
  goals: Array<{
    id: number;
    name: string;
    target: number;
    current: number;
    completion: number;
  }>;
}

interface RealTimeMetricCardProps {
  title: string;
  value: number | string;
  icon: React.ElementType;
  change: number;
}

function RealTimeMetricCard({
  title,
  value,
  icon: Icon,
  change,
}: RealTimeMetricCardProps) {
  return (
    <Card className="min-w-0">
      {" "}
      {/* Ensure card can shrink */}
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium truncate pr-2">
          {title}
        </CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold truncate">{value}</div>
        <p className="text-xs text-muted-foreground flex items-start flex-wrap gap-1">
          {change >= 0 ? (
            <TrendingUp className="h-3 w-3 text-green-500 flex-shrink-0 mt-0.5" />
          ) : (
            <TrendingDown className="h-3 w-3 text-red-500 flex-shrink-0 mt-0.5" />
          )}
          <span className="break-words leading-tight">
            {change >= 0 ? "+" : ""}
            {change}% from last period
          </span>
        </p>
      </CardContent>
    </Card>
  );
}

interface TrafficSourceCardProps {
  source: {
    source: string;
    visitors: number;
    percentage: number;
    change: number;
  };
}

function TrafficSourceCard({ source }: TrafficSourceCardProps) {
  return (
    <div className="flex items-center justify-between p-4 border rounded-lg">
      <div>
        <p className="font-medium">{source.source}</p>
        <p className="text-sm text-muted-foreground">
          {source.visitors.toLocaleString()} visitors
        </p>
      </div>
      <div className="text-right">
        <p className="text-lg font-semibold">{source.percentage}%</p>
        <p
          className={`text-sm flex items-center ${source.change >= 0 ? "text-green-600" : "text-red-600"}`}
        >
          {source.change >= 0 ? (
            <TrendingUp className="h-3 w-3 mr-1" aria-hidden="true" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1" aria-hidden="true" />
          )}
          {source.change >= 0 ? "+" : ""}
          {source.change}%
        </p>
      </div>
    </div>
  );
}

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState("30d");
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null,
  );
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);

      const response = await fetch(
        `/api/dashboard/advanced-analytics?timeRange=${timeRange}`,
        {
          credentials: "include",
        },
      );

      if (!response.ok) {
        if (response.status === 401) {
          throw new Error("Unauthorized access");
        }
        throw new Error("Failed to fetch analytics data");
      }

      const data = await response.json();
      setAnalyticsData(data);
    } catch (err) {
      console.error("Error fetching analytics:", err);
      setError(err instanceof Error ? err.message : "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  const handleRefresh = () => {
    fetchAnalyticsData();
  };

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <Loader2 className="h-8 w-8 animate-spin mx-auto mb-4 text-muted-foreground" />
            <p className="text-muted-foreground">Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <div className="text-center">
            <p className="text-red-600 mb-4">Error: {error}</p>
            <Button onClick={handleRefresh} variant="outline">
              <RefreshCw className="h-4 w-4 mr-2" />
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  if (!analyticsData) {
    return (
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-center h-64">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    );
  }

  return (
    <TooltipProvider>
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Advanced Analytics
            </h1>
            <p className="text-gray-600">
              Deep insights into your business performance
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Select value={timeRange} onValueChange={setTimeRange}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="7d">Last 7 days</SelectItem>
                <SelectItem value="30d">Last 30 days</SelectItem>
                <SelectItem value="90d">Last 90 days</SelectItem>
                <SelectItem value="1y">Last year</SelectItem>
              </SelectContent>
            </Select>
            <Button variant="outline" size="sm">
              <Download className="h-4 w-4 mr-2" />
              Export
            </Button>
            <Button variant="outline" size="sm" onClick={handleRefresh}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Refresh
            </Button>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div>
          <h2 className="text-xl font-semibold text-gray-900 mb-4">
            Real-time Metrics
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
            <RealTimeMetricCard
              title="Active Users"
              value={analyticsData.realTimeMetrics.activeUsers}
              icon={Users}
              change={8.2}
            />
            <RealTimeMetricCard
              title="Page Views"
              value={analyticsData.realTimeMetrics.pageViews}
              icon={MousePointer}
              change={4.1}
            />
            <RealTimeMetricCard
              title="Bounce Rate"
              value={`${analyticsData.realTimeMetrics.bounceRate}%`}
              icon={TrendingDown}
              change={-2.3}
            />
            <RealTimeMetricCard
              title="Avg. Session"
              value={analyticsData.realTimeMetrics.avgSessionDuration}
              icon={Clock}
              change={7.8}
            />
            <RealTimeMetricCard
              title="Conversion"
              value={`${analyticsData.realTimeMetrics.conversionRate}%`}
              icon={TrendingUp}
              change={12.4}
            />
            <RealTimeMetricCard
              title="Revenue"
              value={`$${analyticsData.realTimeMetrics.revenue.toLocaleString()}`}
              icon={BarChart3}
              change={18.7}
            />
          </div>
        </div>

        {/* Traffic Sources and User Engagement */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>
                Where your visitors are coming from
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {analyticsData.trafficSources.map((source) => (
                <TrafficSourceCard key={source.source} source={source} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Engagement</CardTitle>
              <CardDescription>
                How users interact with your site
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Total Sessions</span>
                  <span className="text-sm">
                    {analyticsData.userEngagement.totalSessions.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">New Users</span>
                  <span className="text-sm">
                    {analyticsData.userEngagement.newUsers.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Returning Users</span>
                  <span className="text-sm">
                    {analyticsData.userEngagement.returningUsers.toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">
                    Avg. Session Duration
                  </span>
                  <span className="text-sm">
                    {analyticsData.userEngagement.avgSessionDuration}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Bounce Rate</span>
                  <span className="text-sm">
                    {analyticsData.userEngagement.bounceRate}%
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Top Pages */}
        <Card>
          <CardHeader>
            <CardTitle>Top Pages</CardTitle>
            <CardDescription>Most visited pages on your site</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Page</TableHead>
                  <TableHead>Views</TableHead>
                  <TableHead>Unique Views</TableHead>
                  <TableHead>Avg Time</TableHead>
                  <TableHead>Bounce Rate</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {analyticsData.topPages.map((page) => (
                  <TableRow key={page.page}>
                    <TableCell className="font-medium">{page.page}</TableCell>
                    <TableCell>{page.views.toLocaleString()}</TableCell>
                    <TableCell>{page.uniqueViews.toLocaleString()}</TableCell>
                    <TableCell>{page.avgTime}</TableCell>
                    <TableCell>
                      <Badge
                        variant={
                          page.bounceRate > 50
                            ? "destructive"
                            : page.bounceRate > 30
                              ? "secondary"
                              : "default"
                        }
                      >
                        {page.bounceRate}%
                      </Badge>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Conversion Funnel */}
        <Card>
          <CardHeader>
            <CardTitle>Conversion Funnel</CardTitle>
            <CardDescription>
              Track user journey through your conversion process
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.conversionFunnels.map((step, index) => {
                // Calculate proper width percentage (max 100%)
                const widthPercentage = Math.min(step.conversion, 100);

                return (
                  <div key={step.step} className="flex items-center space-x-4">
                    <div className="flex-shrink-0 w-8 h-8 bg-primary text-primary-foreground rounded-full flex items-center justify-center text-sm font-medium">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-2">
                        <span className="font-medium">{step.step}</span>
                        <span className="text-sm text-muted-foreground">
                          {step.users.toLocaleString()} users (
                          {step.conversion.toFixed(1)}%)
                        </span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                        <div
                          className="bg-primary h-2 rounded-full transition-all duration-300 ease-in-out"
                          style={{ width: `${widthPercentage}%` }}
                        />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>

        {/* Geographic Data */}
        <Card>
          <CardHeader>
            <CardTitle>Geographic Distribution</CardTitle>
            <CardDescription>Where your users are located</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {analyticsData.geographicData.map((country) => (
                <div
                  key={country.country}
                  className="flex items-center justify-between"
                >
                  <div className="flex items-center space-x-3">
                    <Globe className="h-4 w-4 text-muted-foreground" />
                    <span className="font-medium">{country.country}</span>
                  </div>
                  <div className="text-right">
                    <div className="font-semibold">
                      {country.users.toLocaleString()}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {country.percentage}%
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </TooltipProvider>
  );
}
