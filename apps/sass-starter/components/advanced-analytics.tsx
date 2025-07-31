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
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@workspace/ui/components/table';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@workspace/ui/components/tabs';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@workspace/ui/components/tooltip';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  Users,
  Globe,
  Smartphone,
  Monitor,
  Calendar,
  Clock,
  Target,
  Eye,
  MousePointer,
  ShoppingCart,
  DollarSign,
  Percent,
  MapPin,
  Zap,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Download,
  RefreshCw,
  Settings,
  Filter,
  Share2,
  Bookmark,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Plus,
  Minus,
  ExternalLink,
  PieChart,
  LineChart,
  MoreHorizontal,
} from 'lucide-react';
import { useState, useEffect } from 'react';

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

// Fallback data for when API is loading or fails
const fallbackAnalyticsData: AnalyticsData = {
  realTimeMetrics: {
    activeUsers: 1247,
    pageViews: 3421,
    bounceRate: 42.3,
    avgSessionDuration: '4:32',
    conversionRate: 3.8,
    revenue: 15420.5,
  },
  userEngagement: {
    totalSessions: 45230,
    newUsers: 12450,
    returningUsers: 32780,
    avgPagesPerSession: 3.2,
    avgSessionDuration: '4:32',
    bounceRate: 42.3,
  },
  trafficSources: [
    {
      source: 'Organic Search',
      visitors: 18500,
      percentage: 41.2,
      change: 12.5,
    },
    { source: 'Direct', visitors: 12300, percentage: 27.4, change: -3.2 },
    { source: 'Social Media', visitors: 8900, percentage: 19.8, change: 24.1 },
    { source: 'Referral', visitors: 3200, percentage: 7.1, change: 8.7 },
    { source: 'Email', visitors: 2100, percentage: 4.7, change: 15.3 },
  ],
  deviceStats: [
    { device: 'Desktop', users: 22340, percentage: 49.4, change: -2.1 },
    { device: 'Mobile', users: 19870, percentage: 44.0, change: 8.3 },
    { device: 'Tablet', users: 3020, percentage: 6.7, change: -5.7 },
  ],
  topPages: [
    {
      page: '/dashboard',
      views: 8940,
      uniqueViews: 6120,
      avgTime: '3:45',
      bounceRate: 28.4,
    },
    {
      page: '/pricing',
      views: 5680,
      uniqueViews: 4890,
      avgTime: '2:18',
      bounceRate: 35.2,
    },
    {
      page: '/features',
      views: 4320,
      uniqueViews: 3210,
      avgTime: '2:54',
      bounceRate: 42.1,
    },
    {
      page: '/blog',
      views: 3890,
      uniqueViews: 2940,
      avgTime: '4:12',
      bounceRate: 38.7,
    },
    {
      page: '/contact',
      views: 2540,
      uniqueViews: 2180,
      avgTime: '1:32',
      bounceRate: 52.3,
    },
  ],
  geographicData: [
    { country: 'United States', users: 15420, percentage: 34.1 },
    { country: 'Canada', users: 6890, percentage: 15.2 },
    { country: 'United Kingdom', users: 5340, percentage: 11.8 },
    { country: 'Germany', users: 4120, percentage: 9.1 },
    { country: 'France', users: 3670, percentage: 8.1 },
    { country: 'Australia', users: 2890, percentage: 6.4 },
    { country: 'Japan', users: 2340, percentage: 5.2 },
    { country: 'Other', users: 4560, percentage: 10.1 },
  ],
  conversionFunnels: [
    { step: 'Landing Page', users: 45230, conversion: 100 },
    { step: 'Product View', users: 28940, conversion: 64.0 },
    { step: 'Add to Cart', users: 12340, conversion: 27.3 },
    { step: 'Checkout', users: 5680, conversion: 12.6 },
    { step: 'Purchase', users: 3420, conversion: 7.6 },
  ],
  goals: [
    {
      id: 1,
      name: 'Newsletter Signups',
      target: 1000,
      current: 847,
      completion: 84.7,
    },
    {
      id: 2,
      name: 'Trial Conversions',
      target: 250,
      current: 189,
      completion: 75.6,
    },
    {
      id: 3,
      name: 'Revenue Target',
      target: 50000,
      current: 42340,
      completion: 84.7,
    },
    {
      id: 4,
      name: 'Customer Satisfaction',
      target: 95,
      current: 94.2,
      completion: 99.2,
    },
  ],
  cohortAnalysis: [
    {
      cohort: 'Jan 2024',
      users: 1000,
      month1: 78,
      month2: 65,
      month3: 58,
      month4: 52,
      month5: 48,
    },
    {
      cohort: 'Feb 2024',
      users: 1200,
      month1: 82,
      month2: 69,
      month3: 62,
      month4: 56,
      month5: undefined,
    },
    {
      cohort: 'Mar 2024',
      users: 1100,
      month1: 85,
      month2: 72,
      month3: 64,
      month4: undefined,
      month5: undefined,
    },
    {
      cohort: 'Apr 2024',
      users: 950,
      month1: 88,
      month2: 75,
      month3: undefined,
      month4: undefined,
      month5: undefined,
    },
    {
      cohort: 'May 2024',
      users: 800,
      month1: 91,
      month2: undefined,
      month3: undefined,
      month4: undefined,
      month5: undefined,
    },
    {
      cohort: 'Jun 2024',
      users: 1050,
      month1: undefined,
      month2: undefined,
      month3: undefined,
      month4: undefined,
      month5: undefined,
    },
  ],
};

function RealTimeMetricCard({
  title,
  value,
  icon: Icon,
  change,
  format = 'number',
}: {
  title: string;
  value: string | number;
  icon: any;
  change?: number;
  format?: 'number' | 'currency' | 'percentage' | 'time';
}) {
  const formatValue = (val: string | number) => {
    if (format === 'currency') return `$${val.toLocaleString()}`;
    if (format === 'percentage') return `${val}%`;
    if (format === 'time') return val;
    return val.toLocaleString();
  };

  return (
    <Card>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div>
            <p className='text-sm font-medium text-gray-600'>{title}</p>
            <p className='text-2xl font-bold text-gray-900'>
              {formatValue(value)}
            </p>
            {change !== undefined && (
              <p
                className={`text-sm flex items-center mt-1 ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}
              >
                {change >= 0 ? (
                  <TrendingUp className='h-3 w-3 mr-1' aria-hidden="true" />
                ) : (
                  <TrendingDown className='h-3 w-3 mr-1' aria-hidden="true" />
                )}
                {Math.abs(change)}%
              </p>
            )}
          </div>
          <Icon className='h-8 w-8 text-blue-600' />
        </div>
      </CardContent>
    </Card>
  );
}

function TrafficSourceRow({
  source,
}: {
  source: (typeof fallbackAnalyticsData.trafficSources)[0];
}) {
  return (
    <TableRow>
      <TableCell className='font-medium'>{source.source}</TableCell>
      <TableCell>{source.visitors.toLocaleString()}</TableCell>
      <TableCell>{source.percentage}%</TableCell>
      <TableCell>
        <div
          className={`flex items-center ${source.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
        >
          {source.change >= 0 ? (
            <TrendingUp className='h-3 w-3 mr-1' aria-hidden="true" />
          ) : (
            <TrendingDown className='h-3 w-3 mr-1' aria-hidden="true" />
          )}
          {Math.abs(source.change)}%
        </div>
      </TableCell>
      <TableCell>
        <div className='w-full bg-gray-200 rounded-full h-2'>
          <div
            className='bg-blue-600 h-2 rounded-full'
            style={{ width: `${source.percentage}%` }}
          />
        </div>
      </TableCell>
    </TableRow>
  );
}

function GoalCard({ goal }: { goal: (typeof fallbackAnalyticsData.goals)[0] }) {
  const progress = (goal.current / goal.target) * 100;
  const statusColors = {
    'on-track': 'bg-green-100 text-green-800',
    behind: 'bg-red-100 text-red-800',
    exceeded: 'bg-blue-100 text-blue-800',
  };

  return (
    <Card>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <h3 className='font-medium text-gray-900'>{goal.name}</h3>
          <Badge
            className={goal.completion >= 80 ? statusColors['on-track'] : goal.completion >= 60 ? statusColors['behind'] : statusColors['exceeded']}
          >
            {goal.completion >= 80 ? 'on track' : goal.completion >= 60 ? 'behind' : 'exceeded'}
          </Badge>
        </div>
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600'>Progress</span>
            <span className='font-medium'>{progress.toFixed(1)}%</span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className='bg-blue-600 h-2 rounded-full'
              style={{ width: `${Math.min(progress, 100)}%` }}
            />
          </div>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600'>
              {goal.current.toLocaleString()} / {goal.target.toLocaleString()}
            </span>
            <span className='text-gray-400'>{goal.completion.toFixed(1)}%</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FunnelStep({
  step,
  index,
  total,
}: {
  step: (typeof fallbackAnalyticsData.conversionFunnels)[0];
  index: number;
  total: number;
}) {
  return (
    <div className='flex items-center space-x-4'>
      <div className='flex-shrink-0 w-8 h-8 bg-blue-600 text-white rounded-full flex items-center justify-center text-sm font-medium'>
        {index + 1}
      </div>
      <div className='flex-1'>
        <div className='flex items-center justify-between mb-1'>
          <span className='font-medium text-gray-900'>{step.step}</span>
          <span className='text-sm text-gray-500'>
            {step.users.toLocaleString()} users
          </span>
        </div>
        <div className='flex items-center justify-between'>
          <div className='w-full bg-gray-200 rounded-full h-2 mr-4'>
            <div
              className='bg-blue-600 h-2 rounded-full'
              style={{ width: `${step.conversion}%` }}
            />
          </div>
          <span className='text-sm font-medium text-gray-900'>
            {step.conversion}%
          </span>
        </div>
      </div>
    </div>
  );
}

function CohortTable() {
  return (
    <div className='overflow-x-auto'>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Cohort</TableHead>
            <TableHead>Month 0</TableHead>
            <TableHead>Month 1</TableHead>
            <TableHead>Month 2</TableHead>
            <TableHead>Month 3</TableHead>
            <TableHead>Month 4</TableHead>
            <TableHead>Month 5</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {fallbackAnalyticsData.cohortAnalysis.map((cohort) => (
            <TableRow key={cohort.cohort}>
              <TableCell className='font-medium'>{cohort.cohort}</TableCell>
              <TableCell>
                <span className='inline-flex items-center px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-800'>
                  100%
                </span>
              </TableCell>
              <TableCell>
                {cohort.month1 && (
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      cohort.month1 >= 80
                        ? 'bg-green-100 text-green-800'
                        : cohort.month1 >= 60
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {cohort.month1}%
                  </span>
                )}
              </TableCell>
              <TableCell>
                {cohort.month2 && (
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      cohort.month2 >= 70
                        ? 'bg-green-100 text-green-800'
                        : cohort.month2 >= 50
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {cohort.month2}%
                  </span>
                )}
              </TableCell>
              <TableCell>
                {cohort.month3 && (
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      cohort.month3 >= 60
                        ? 'bg-green-100 text-green-800'
                        : cohort.month3 >= 40
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {cohort.month3}%
                  </span>
                )}
              </TableCell>
              <TableCell>
                {cohort.month4 && (
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      cohort.month4 >= 50
                        ? 'bg-green-100 text-green-800'
                        : cohort.month4 >= 30
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {cohort.month4}%
                  </span>
                )}
              </TableCell>
              <TableCell>
                {cohort.month5 && (
                  <span
                    className={`inline-flex items-center px-2 py-1 rounded-full text-xs ${
                      cohort.month5 >= 40
                        ? 'bg-green-100 text-green-800'
                        : cohort.month5 >= 20
                          ? 'bg-yellow-100 text-yellow-800'
                          : 'bg-red-100 text-red-800'
                    }`}
                  >
                    {cohort.month5}%
                  </span>
                )}
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

export default function AdvancedAnalytics() {
  const [timeRange, setTimeRange] = useState('30d');

  return (
    <TooltipProvider>
      <div className='p-6 space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Advanced Analytics
            </h1>
            <p className='text-gray-600'>
              Deep insights into your business performance
            </p>
          </div>
          <div className='flex items-center space-x-2'>
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
            <Button variant='outline' size='sm'>
              <RefreshCw className='h-4 w-4 mr-2' />
              Refresh
            </Button>
          </div>
        </div>

        {/* Real-time Metrics */}
        <div>
          <h2 className='text-xl font-semibold text-gray-900 mb-4'>
            Real-time Metrics
          </h2>
          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6'>
            <RealTimeMetricCard
              title='Active Users'
              value={fallbackAnalyticsData.realTimeMetrics.activeUsers}
              icon={Users}
              change={8.2}
            />
            <RealTimeMetricCard
              title='Page Views'
              value={fallbackAnalyticsData.realTimeMetrics.pageViews}
              icon={Eye}
              change={15.4}
            />
            <RealTimeMetricCard
              title='Bounce Rate'
              value={fallbackAnalyticsData.realTimeMetrics.bounceRate}
              icon={ArrowDownRight}
              change={-3.2}
              format='percentage'
            />
            <RealTimeMetricCard
              title='Avg Session'
              value={fallbackAnalyticsData.realTimeMetrics.avgSessionDuration}
              icon={Clock}
              change={12.8}
              format='time'
            />
            <RealTimeMetricCard
              title='Conversion Rate'
              value={fallbackAnalyticsData.realTimeMetrics.conversionRate}
              icon={Target}
              change={24.1}
              format='percentage'
            />
            <RealTimeMetricCard
              title='Revenue'
              value={fallbackAnalyticsData.realTimeMetrics.revenue}
              icon={DollarSign}
              change={18.7}
              format='currency'
            />
          </div>
        </div>

        <Tabs defaultValue='traffic' className='space-y-6'>
          <TabsList>
            <TabsTrigger value='traffic'>Traffic Analysis</TabsTrigger>
            <TabsTrigger value='conversions'>Conversion Funnels</TabsTrigger>
            <TabsTrigger value='geography'>Geographic Data</TabsTrigger>
            <TabsTrigger value='goals'>Goals & KPIs</TabsTrigger>
            <TabsTrigger value='cohorts'>Cohort Analysis</TabsTrigger>
          </TabsList>

          <TabsContent value='traffic' className='space-y-6'>
            <div className='grid grid-cols-1 lg:grid-cols-2 gap-6'>
              <Card>
                <CardHeader>
                  <CardTitle>Traffic Sources</CardTitle>
                  <CardDescription>
                    Where your visitors are coming from
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Source</TableHead>
                        <TableHead>Visitors</TableHead>
                        <TableHead>%</TableHead>
                        <TableHead>Change</TableHead>
                        <TableHead>Trend</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {fallbackAnalyticsData.trafficSources.map((source) => (
                        <TrafficSourceRow key={source.source} source={source} />
                      ))}
                    </TableBody>
                  </Table>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Device Breakdown</CardTitle>
                  <CardDescription>
                    User engagement by device type
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className='space-y-4'>
                    {fallbackAnalyticsData.deviceStats.map((device) => (
                      <div
                        key={device.device}
                        className='flex items-center justify-between'
                      >
                        <div className='flex items-center space-x-3'>
                          {device.device === 'Desktop' && (
                            <Monitor className='h-5 w-5 text-gray-400' />
                          )}
                          {device.device === 'Mobile' && (
                            <Smartphone className='h-5 w-5 text-gray-400' />
                          )}
                          {device.device === 'Tablet' && (
                            <Smartphone className='h-5 w-5 text-gray-400' />
                          )}
                          <div>
                            <div className='font-medium'>{device.device}</div>
                            <div className='text-sm text-gray-500'>
                              {device.users.toLocaleString()} users
                            </div>
                          </div>
                        </div>
                        <div className='text-right'>
                          <div className='font-medium'>
                            {device.percentage}%
                          </div>
                          <div
                            className={`text-sm flex items-center ${device.change >= 0 ? 'text-green-600' : 'text-red-600'}`}
                          >
                            {device.change >= 0 ? (
                              <TrendingUp className='h-3 w-3 mr-1' aria-hidden="true" />
                            ) : (
                              <TrendingDown className='h-3 w-3 mr-1' aria-hidden="true" />
                            )}
                            {Math.abs(device.change)}%
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Top Pages</CardTitle>
                <CardDescription>
                  Most visited pages and their performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Page</TableHead>
                      <TableHead>Page Views</TableHead>
                      <TableHead>Unique Views</TableHead>
                      <TableHead>Avg Time</TableHead>
                      <TableHead>Bounce Rate</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fallbackAnalyticsData.topPages.map((page) => (
                      <TableRow key={page.page}>
                        <TableCell className='font-medium'>
                          <div className='flex items-center space-x-2'>
                            <span>{page.page}</span>
                            <ExternalLink className='h-3 w-3 text-gray-400' />
                          </div>
                        </TableCell>
                        <TableCell>{page.views.toLocaleString()}</TableCell>
                        <TableCell>
                          {page.uniqueViews.toLocaleString()}
                        </TableCell>
                        <TableCell>{page.avgTime}</TableCell>
                        <TableCell>
                          <span
                            className={
                              page.bounceRate > 50
                                ? 'text-red-600'
                                : 'text-green-600'
                            }
                          >
                            {page.bounceRate}%
                          </span>
                        </TableCell>
                        <TableCell>
                          <Button variant='ghost' size='sm'>
                            <BarChart3 className='h-4 w-4' />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='conversions' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Conversion Funnel</CardTitle>
                <CardDescription>
                  Track user journey from awareness to conversion
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='space-y-6'>
                  {fallbackAnalyticsData.conversionFunnels.map(
                    (step, index) => (
                      <FunnelStep
                        key={step.step}
                        step={step}
                        index={index}
                        total={fallbackAnalyticsData.conversionFunnels.length}
                      />
                    )
                  )}
                </div>
                <div className='mt-6 p-4 bg-blue-50 rounded-lg'>
                  <div className='flex items-center justify-between'>
                    <div>
                      <h4 className='font-medium text-blue-900'>
                        Overall Conversion Rate
                      </h4>
                      <p className='text-sm text-blue-700'>
                        Landing page to purchase
                      </p>
                    </div>
                    <div className='text-2xl font-bold text-blue-900'>7.6%</div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='geography' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Geographic Performance</CardTitle>
                <CardDescription>
                  User engagement and revenue by location
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Country</TableHead>
                      <TableHead>Users</TableHead>
                      <TableHead>Percentage</TableHead>
                      <TableHead>Revenue</TableHead>
                      <TableHead>Revenue per User</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {fallbackAnalyticsData.geographicData.map((country) => (
                      <TableRow key={country.country}>
                        <TableCell className='font-medium'>
                          <div className='flex items-center space-x-2'>
                            <MapPin className='h-4 w-4 text-gray-400' />
                            <span>{country.country}</span>
                          </div>
                        </TableCell>
                        <TableCell>{country.users.toLocaleString()}</TableCell>
                        <TableCell>{country.percentage}%</TableCell>
                        <TableCell>
                          ${(country.users * 25).toLocaleString()}
                        </TableCell>
                        <TableCell>
                          $25.00
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='goals' className='space-y-6'>
            <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
              {fallbackAnalyticsData.goals.map((goal) => (
                <GoalCard key={goal.id} goal={goal} />
              ))}
            </div>
          </TabsContent>

          <TabsContent value='cohorts' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>User Retention Cohorts</CardTitle>
                <CardDescription>
                  Track user retention over time by signup month
                </CardDescription>
              </CardHeader>
              <CardContent>
                <CohortTable />
                <div className='mt-4 flex items-center space-x-4 text-sm text-gray-600'>
                  <div className='flex items-center space-x-1'>
                    <div className='w-3 h-3 bg-green-100 rounded' />
                    <span>Good retention (60%+)</span>
                  </div>
                  <div className='flex items-center space-x-1'>
                    <div className='w-3 h-3 bg-yellow-100 rounded' />
                    <span>Average retention (40-60%)</span>
                  </div>
                  <div className='flex items-center space-x-1'>
                    <div className='w-3 h-3 bg-red-100 rounded' />
                    <span>Poor retention (&lt;40%)</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
