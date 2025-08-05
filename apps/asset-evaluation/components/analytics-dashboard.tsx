'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import {
  ChartConfig,
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@workspace/ui/components/chart';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  DollarSign,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw,
  Eye,
  MousePointer,
  Clock,
  Globe,
  Smartphone,
  Monitor,
  Tablet,
  Loader2,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  ResponsiveContainer,
} from 'recharts';

// Types for analytics data
interface AnalyticsData {
  overview: {
    totalUsers: number;
    totalRevenue: number;
    activeUsers: number;
    conversionRate: number;
    trends: {
      users: number;
      revenue: number;
      active: number;
      conversion: number;
    };
  };
  timeSeries: {
    daily: Array<{
      date: string;
      sessions: number;
      users: number;
      revenue: number;
    }>;
  };
  traffic: {
    pageViews: number;
    uniqueVisitors: number;
    bounceRate: number;
    avgSessionDuration: string;
    trends: {
      pageViews: number;
      visitors: number;
      bounceRate: number;
      duration: number;
    };
  };
  demographics: {
    countries: Array<{
      name: string;
      users: number;
      percentage: number;
    }>;
    devices: Array<{
      type: string;
      users: number;
      percentage: number;
    }>;
  };
  trafficSources: Array<{
    source: string;
    visitors: number;
  }>;
  topPages: Array<{
    path: string;
    views: number;
    uniqueViews: number;
  }>;
  realtimeData: {
    activeUsers: number;
    currentPageViews: number;
    topActivePages: Array<{
      path: string;
      activeUsers: number;
    }>;
  };
}

// Chart configurations
const performanceChartConfig = {
  revenue: {
    label: "Revenue",
    color: "#3b82f6", // Blue
  },
  users: {
    label: "Users", 
    color: "#10b981", // Green
  },
} satisfies ChartConfig

const trafficChartConfig = {
  direct: {
    label: "Direct",
    color: "#3b82f6", // Blue
  },
  organic: {
    label: "Organic Search",
    color: "#10b981", // Green
  },
  social: {
    label: "Social Media", 
    color: "#f59e0b", // Amber
  },
  referrals: {
    label: "Referrals",
    color: "#ef4444", // Red
  },
  email: {
    label: "Email",
    color: "#8b5cf6", // Purple
  },
} satisfies ChartConfig

const deviceChartConfig = {
  desktop: {
    label: "Desktop",
    color: "#3b82f6", // Blue
  },
  mobile: {
    label: "Mobile", 
    color: "#10b981", // Green
  },
  tablet: {
    label: "Tablet",
    color: "#f59e0b", // Amber
  },
} satisfies ChartConfig

function MetricCard({
  title,
  value,
  icon: Icon,
  trend,
  trendValue,
  description,
  format = 'number',
}: {
  title: string;
  value: number | string;
  icon: any;
  trend?: 'up' | 'down';
  trendValue?: number;
  description?: string;
  format?: 'number' | 'currency' | 'percentage' | 'duration';
}) {
  const formatValue = (val: number | string) => {
    if (typeof val === 'string') return val;

    switch (format) {
      case 'currency':
        return `$${Math.round(val).toLocaleString()}`;
      case 'percentage':
        return `${Math.round(val * 10) / 10}%`;
      case 'duration':
        return val;
      default:
        return Math.round(val).toLocaleString();
    }
  };

  return (
    <Card>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='space-y-2'>
            <p className='text-sm font-medium text-muted-foreground'>{title}</p>
            <p className='text-2xl font-bold text-foreground'>
              {formatValue(value)}
            </p>
            {trendValue && (
              <div className='flex items-center space-x-1 text-sm'>
                {trend === 'up' ? (
                  <TrendingUp className='h-4 w-4 text-green-600' />
                ) : (
                  <TrendingDown className='h-4 w-4 text-red-600' />
                )}
                <span
                  className={trend === 'up' ? 'text-green-600' : 'text-red-600'}
                >
                  {Math.round(Math.abs(trendValue) * 10) / 10}%
                </span>
                <span className='text-muted-foreground'>vs last month</span>
              </div>
            )}
            {description && (
              <p className='text-xs text-muted-foreground'>{description}</p>
            )}
          </div>
          <Icon className='h-8 w-8 text-blue-600 dark:text-blue-400' />
        </div>
      </CardContent>
    </Card>
  );
}

function TopPagesTable({ data }: { data: AnalyticsData | null }) {
  if (!data) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      {data.topPages.map((page, index) => (
        <div
          key={page.path}
          className='flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-800 rounded-lg'
        >
          <div className='flex items-center space-x-3'>
            <div className='flex items-center justify-center w-6 h-6 bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full text-sm font-medium'>
              {index + 1}
            </div>
            <div>
              <p className='font-medium text-foreground'>{page.path}</p>
              <p className='text-sm text-muted-foreground'>
                {page.uniqueViews.toLocaleString()} unique views
              </p>
            </div>
          </div>
          <div className='text-right'>
            <p className='font-medium text-foreground'>
              {page.views.toLocaleString()}
            </p>
            <p className='text-sm text-muted-foreground'>total views</p>
          </div>
        </div>
      ))}
    </div>
  );
}

function RealtimeUsers({ data }: { data: AnalyticsData | null }) {
  if (!data) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className='space-y-4'>
      <div className='flex items-center justify-between'>
        <h3 className='text-lg font-semibold'>Active Users Right Now</h3>
        <div className='flex items-center space-x-2'>
          <div className='w-2 h-2 bg-green-500 rounded-full animate-pulse'></div>
          <span className='text-2xl font-bold text-green-600'>
            {data.realtimeData.activeUsers}
          </span>
        </div>
      </div>

      <div className='space-y-3'>
        {data.realtimeData.topActivePages.map((page) => (
          <div
            key={page.path}
            className='flex items-center justify-between p-3 bg-green-50 dark:bg-green-900/20 rounded-lg'
          >
            <span className='text-sm font-medium text-foreground'>
              {page.path}
            </span>
            <span className='text-sm text-green-600'>
              {page.activeUsers} users
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function CountryBreakdown({ data }: { data: AnalyticsData | null }) {
  if (!data) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {data.demographics.countries.map((country) => (
        <div key={country.name} className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <Globe className='h-4 w-4 text-gray-400 dark:text-gray-500' />
            <span className='text-sm font-medium text-foreground'>
              {country.name}
            </span>
          </div>
          <div className='flex items-center space-x-2'>
            <div className='w-16 text-right text-sm text-muted-foreground'>
              {country.percentage}%
            </div>
            <div className='w-20 bg-gray-200 dark:bg-gray-700 rounded-full h-2'>
              <div
                className='bg-blue-600 dark:bg-blue-500 h-2 rounded-full'
                style={{ width: `${Math.min(country.percentage * 2, 100)}%` }}
              />
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function DeviceBreakdown({ data }: { data: AnalyticsData | null }) {
  const deviceIcons = {
    Desktop: Monitor,
    Mobile: Smartphone,
    Tablet: Tablet,
  };

  if (!data) {
    return (
      <div className="flex items-center justify-center py-8">
        <Loader2 className="h-6 w-6 animate-spin" />
      </div>
    );
  }

  return (
    <div className='space-y-3'>
      {data.demographics.devices.map((device) => {
        const Icon = deviceIcons[device.type as keyof typeof deviceIcons];
        return (
          <div key={device.type} className='flex items-center justify-between'>
            <div className='flex items-center space-x-3'>
              <Icon className='h-4 w-4 text-gray-400 dark:text-gray-500' />
              <span className='text-sm font-medium text-foreground'>
                {device.type}
              </span>
            </div>
            <div className='flex items-center space-x-2'>
              <div className='w-16 text-right text-sm text-muted-foreground'>
                {device.percentage}%
              </div>
              <div className='w-20 bg-gray-200 rounded-full h-2'>
                <div
                  className='bg-green-600 h-2 rounded-full'
                  style={{ width: `${device.percentage}%` }}
                />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}

export default function AnalyticsDashboard() {
  const [timeRange, setTimeRange] = useState('30d');
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchAnalyticsData = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await fetch('/api/analytics');
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data');
      }
      
      const result = await response.json();
      setAnalyticsData(result.data);
    } catch (err) {
      console.error('Error fetching analytics:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAnalyticsData();
  }, [timeRange]);

  if (loading) {
    return (
      <div className='p-6 space-y-6'>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4' />
            <p className='text-gray-600'>Loading analytics data...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className='p-6 space-y-6'>
        <div className='flex items-center justify-center py-12'>
          <div className='text-center'>
            <p className='text-red-600 mb-4'>Error loading analytics: {error}</p>
            <Button onClick={fetchAnalyticsData} variant='outline'>
              Try Again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className='p-6 space-y-6'>
      <div className='flex items-center justify-between'>
        <div>
          <h1 className='text-3xl font-bold text-foreground'>Analytics</h1>
          <p className='text-gray-600'>
            Track your application's performance and user engagement
          </p>
        </div>
        <div className='flex items-center space-x-3'>
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className='w-32'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value='7d'>Last 7 days</SelectItem>
              <SelectItem value='30d'>Last 30 days</SelectItem>
              <SelectItem value='90d'>Last 90 days</SelectItem>
              <SelectItem value='1y'>Last year</SelectItem>
            </SelectContent>
          </Select>
          <Button variant='outline' size='sm'>
            <Download className='h-4 w-4 mr-2' />
            Export
          </Button>
          <Button variant='outline' size='sm' onClick={fetchAnalyticsData}>
            <RefreshCw className='h-4 w-4' />
          </Button>
        </div>
      </div>

      <Tabs defaultValue='overview' className='space-y-6'>
        <TabsList>
          <TabsTrigger value='overview'>Overview</TabsTrigger>
          <TabsTrigger value='traffic'>Traffic</TabsTrigger>
          <TabsTrigger value='demographics'>Demographics</TabsTrigger>
          <TabsTrigger value='realtime'>Real-time</TabsTrigger>
        </TabsList>

        <TabsContent value='overview' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <MetricCard
              title='Total Users'
              value={analyticsData?.overview.totalUsers || 0}
              icon={Users}
              trend={analyticsData && analyticsData.overview.trends.users > 0 ? 'up' : 'down'}
              trendValue={analyticsData?.overview.trends.users}
            />
            <MetricCard
              title='Total Revenue'
              value={analyticsData?.overview.totalRevenue || 0}
              icon={DollarSign}
              format='currency'
              trend={analyticsData && analyticsData.overview.trends.revenue > 0 ? 'up' : 'down'}
              trendValue={analyticsData?.overview.trends.revenue}
            />
            <MetricCard
              title='Active Users'
              value={analyticsData?.overview.activeUsers || 0}
              icon={Activity}
              trend={analyticsData && analyticsData.overview.trends.active > 0 ? 'up' : 'down'}
              trendValue={analyticsData?.overview.trends.active}
            />
            <MetricCard
              title='Conversion Rate'
              value={analyticsData?.overview.conversionRate || 0}
              icon={TrendingUp}
              format='percentage'
              trend={
                analyticsData && analyticsData.overview.trends.conversion > 0 ? 'up' : 'down'
              }
              trendValue={analyticsData?.overview.trends.conversion}
            />
          </div>

          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>
                  Most visited pages in your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <TopPagesTable data={analyticsData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <div>
                    <CardTitle>Performance Chart</CardTitle>
                    <CardDescription>
                      Revenue and user growth over time
                    </CardDescription>
                  </div>
                  <div className="flex items-center gap-4 text-sm">
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500" />
                      <span className="text-muted-foreground">Revenue ($)</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-green-500" />
                      <span className="text-muted-foreground">Users</span>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {(() => {
                  const chartData = analyticsData?.timeSeries?.daily || [];
                  
                  if (chartData.length === 0) {
                    return (
                      <div className="flex items-center justify-center h-[300px] text-gray-500">
                        <div className="text-center space-y-4">
                          <BarChart3 className="h-12 w-12 mx-auto mb-2 text-gray-400" />
                          <div>
                            <p className="text-lg font-medium">No recent data available</p>
                            <p className="text-sm text-muted-foreground">Chart will show once you have analytics data</p>
                          </div>
                          <Button 
                            variant="outline" 
                            size="sm"
                            onClick={async () => {
                              try {
                                const response = await fetch('/api/analytics/generate-sample', { method: 'POST' });
                                if (response.ok) {
                                  fetchAnalyticsData(); // Refresh data
                                }
                              } catch (error) {
                                console.error('Failed to generate test data:', error);
                              }
                            }}
                          >
                            Generate Test Data
                          </Button>
                        </div>
                      </div>
                    );
                  }
                  
                  return (
                    <ChartContainer config={performanceChartConfig} className="min-h-[300px] w-full">
                      <LineChart
                        accessibilityLayer
                        data={chartData}
                        margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(var(--muted-foreground))" opacity={0.3} />
                        <XAxis
                          dataKey="date"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{ fontSize: 12, fill: "hsl(var(--muted-foreground))" }}
                          tickFormatter={(value) => {
                            const date = new Date(value);
                            return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
                          }}
                        />
                        <YAxis
                          yAxisId="revenue"
                          orientation="left"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{ fontSize: 12, fill: "#3b82f6" }}
                          tickFormatter={(value) => `$${value.toLocaleString()}`}
                        />
                        <YAxis
                          yAxisId="users"
                          orientation="right"
                          tickLine={false}
                          axisLine={false}
                          tickMargin={8}
                          tick={{ fontSize: 12, fill: "#10b981" }}
                          tickFormatter={(value) => value.toLocaleString()}
                        />
                        <ChartTooltip 
                          content={({ active, payload, label }: { active?: boolean; payload?: any[]; label?: string }) => {
                            if (active && payload && payload.length) {
                              return (
                                <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                                  <p className="text-sm font-medium text-gray-900 dark:text-gray-100 mb-2">
                                    {label ? new Date(label).toLocaleDateString('en-US', { 
                                      weekday: 'long',
                                      month: 'short', 
                                      day: 'numeric' 
                                    }) : 'Unknown Date'}
                                  </p>
                                  {payload.map((entry, index) => (
                                    <div key={index} className="flex items-center gap-2">
                                      <div 
                                        className="w-3 h-3 rounded-full" 
                                        style={{ 
                                          backgroundColor: entry.dataKey === 'revenue' ? '#3b82f6' : '#10b981'
                                        }}
                                      />
                                      <span className="text-sm text-gray-600 dark:text-gray-400">
                                        {entry.dataKey === 'revenue' ? 'Revenue' : 'Users'}:
                                      </span>
                                      <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                        {entry.dataKey === 'revenue' 
                                          ? `$${Number(entry.value).toLocaleString()}` 
                                          : Number(entry.value).toLocaleString()
                                        }
                                      </span>
                                    </div>
                                  ))}
                                </div>
                              );
                            }
                            return null;
                          }}
                        />
                        <Line
                          yAxisId="revenue"
                          dataKey="revenue"
                          type="monotone"
                          stroke="#3b82f6"
                          strokeWidth={3}
                          dot={false}
                          activeDot={{
                            r: 6,
                            fill: "#3b82f6",
                            stroke: "white",
                            strokeWidth: 2,
                          }}
                        />
                        <Line
                          yAxisId="users"
                          dataKey="users"
                          type="monotone"
                          stroke="#10b981"
                          strokeWidth={3}  
                          dot={false}
                          activeDot={{
                            r: 6,
                            fill: "#10b981",
                            stroke: "white",
                            strokeWidth: 2,
                          }}
                        />
                      </LineChart>
                    </ChartContainer>
                  );
                })()}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value='traffic' className='space-y-6'>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
            <MetricCard
              title='Page Views'
              value={analyticsData?.traffic.pageViews || 0}
              icon={Eye}
              trend={analyticsData && analyticsData.traffic.trends.pageViews > 0 ? 'up' : 'down'}
              trendValue={analyticsData?.traffic.trends.pageViews}
            />
            <MetricCard
              title='Unique Visitors'
              value={analyticsData?.traffic.uniqueVisitors || 0}
              icon={Users}
              trend={analyticsData && analyticsData.traffic.trends.visitors > 0 ? 'up' : 'down'}
              trendValue={analyticsData?.traffic.trends.visitors}
            />
            <MetricCard
              title='Bounce Rate'
              value={analyticsData?.traffic.bounceRate || 0}
              icon={MousePointer}
              format='percentage'
              trend={
                analyticsData && analyticsData.traffic.trends.bounceRate > 0 ? 'down' : 'up'
              }
              trendValue={analyticsData?.traffic.trends.bounceRate}
            />
            <MetricCard
              title='Avg Session Duration'
              value={analyticsData?.traffic.avgSessionDuration || '0m 0s'}
              icon={Clock}
              trend={analyticsData && analyticsData.traffic.trends.duration > 0 ? 'up' : 'down'}
              trendValue={analyticsData?.traffic.trends.duration}
            />
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Traffic Sources</CardTitle>
              <CardDescription>
                Where your visitors are coming from
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={trafficChartConfig} className="min-h-[400px] w-full">
                <PieChart>
                  <Pie
                    data={analyticsData?.trafficSources?.map((item, index) => ({
                      source: item.source,
                      visitors: item.visitors,
                      fill: index === 0 ? "#3b82f6" :  // Blue for Direct
                            index === 1 ? "#10b981" :  // Green for Organic
                            index === 2 ? "#f59e0b" :  // Amber for Social
                            index === 3 ? "#ef4444" :  // Red for Referrals
                            "#8b5cf6"                   // Purple for Email
                    })) || [
                      { source: "Direct", visitors: 350, fill: "#3b82f6" },
                      { source: "Organic Search", visitors: 300, fill: "#10b981" },
                      { source: "Social Media", visitors: 200, fill: "#f59e0b" },
                      { source: "Referrals", visitors: 100, fill: "#ef4444" },
                      { source: "Email", visitors: 50, fill: "#8b5cf6" },
                    ]}
                    dataKey="visitors"
                    nameKey="source"
                    cx="50%"
                    cy="50%"
                    outerRadius={120}
                    innerRadius={40}
                    paddingAngle={2}
                    stroke="#ffffff"
                    strokeWidth={2}
                  />
                  <ChartTooltip 
                    content={({ active, payload }: { active?: boolean; payload?: any[] }) => {
                      if (active && payload && payload.length) {
                        const data = payload[0];
                        return (
                          <div className="bg-white dark:bg-gray-800 p-3 border border-gray-200 dark:border-gray-700 rounded-lg shadow-lg">
                            <div className="flex items-center gap-2">
                              <div 
                                className="w-3 h-3 rounded-full" 
                                style={{ backgroundColor: data.payload.fill }}
                              />
                              <span className="text-sm font-medium text-gray-900 dark:text-gray-100">
                                {data.payload.source}
                              </span>
                            </div>
                            <p className="text-sm text-gray-600 dark:text-gray-400 mt-1">
                              {data.value?.toLocaleString()} visitors
                            </p>
                            <p className="text-xs text-gray-500 dark:text-gray-500">
                              {analyticsData?.trafficSources ? 
                                Math.round((Number(data.value) / analyticsData.trafficSources.reduce((sum, item) => sum + item.visitors, 0)) * 100) 
                                : 0}% of total
                            </p>
                          </div>
                        );
                      }
                      return null;
                    }}
                  />
                  <ChartLegend
                    content={({ payload }: { payload?: any[] }) => (
                      <div className="flex flex-wrap justify-center gap-4 mt-4">
                        {payload?.map((entry, index) => (
                          <div key={index} className="flex items-center gap-2">
                            <div 
                              className="w-3 h-3 rounded-full" 
                              style={{ backgroundColor: entry.color }}
                            />
                            <span className="text-sm text-gray-600 dark:text-gray-400">
                              {entry.value}
                            </span>
                          </div>
                        ))}
                      </div>
                    )}
                  />
                </PieChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='demographics' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Top Countries</CardTitle>
                <CardDescription>
                  Geographic distribution of your users
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CountryBreakdown data={analyticsData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Device Types</CardTitle>
                <CardDescription>
                  How users access your application
                </CardDescription>
              </CardHeader>
              <CardContent>
                <DeviceBreakdown data={analyticsData} />
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <CardTitle>Device Analytics</CardTitle>
              <CardDescription>Users by device type</CardDescription>
            </CardHeader>
            <CardContent>
              <ChartContainer config={deviceChartConfig} className="min-h-[300px] w-full">
                <BarChart
                  accessibilityLayer
                  data={analyticsData?.demographics?.devices?.map(device => ({
                    device: device.type,
                    users: device.users,
                    percentage: device.percentage
                  })) || [
                    { device: "Desktop", users: 0, percentage: 0 },
                    { device: "Mobile", users: 0, percentage: 0 },
                    { device: "Tablet", users: 0, percentage: 0 },
                  ]}
                >
                  <CartesianGrid vertical={false} />
                  <XAxis
                    dataKey="device"
                    tickLine={false}
                    tickMargin={10}
                    axisLine={false}
                  />
                  <YAxis
                    tickLine={false}
                    axisLine={false}
                    tickMargin={8}
                  />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar
                    dataKey="users"
                    fill="#3b82f6"
                    radius={4}
                  />
                </BarChart>
              </ChartContainer>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value='realtime' className='space-y-6'>
          <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
            <Card>
              <CardHeader>
                <CardTitle>Real-time Activity</CardTitle>
                <CardDescription>
                  Live user activity on your site
                </CardDescription>
              </CardHeader>
              <CardContent>
                <RealtimeUsers data={analyticsData} />
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Live Events</CardTitle>
                <CardDescription>Real-time user interactions</CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-3'>
                  <div className='flex items-center space-x-3 p-3 bg-blue-50 rounded-lg'>
                    <div className='w-2 h-2 bg-blue-500 rounded-full'></div>
                    <span className='text-sm'>
                      User signed up from United States
                    </span>
                    <span className='text-xs text-gray-500 ml-auto'>
                      2s ago
                    </span>
                  </div>
                  <div className='flex items-center space-x-3 p-3 bg-green-50 rounded-lg'>
                    <div className='w-2 h-2 bg-green-500 rounded-full'></div>
                    <span className='text-sm'>Purchase completed - $49.99</span>
                    <span className='text-xs text-gray-500 ml-auto'>
                      15s ago
                    </span>
                  </div>
                  <div className='flex items-center space-x-3 p-3 bg-orange-50 rounded-lg'>
                    <div className='w-2 h-2 bg-orange-500 rounded-full'></div>
                    <span className='text-sm'>New page view on /pricing</span>
                    <span className='text-xs text-gray-500 ml-auto'>
                      23s ago
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
