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
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@workspace/ui/components/dialog';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@workspace/ui/components/dropdown-menu';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
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
  CreditCard,
  Plus,
  Download,
  Calendar,
  DollarSign,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Check,
  X,
  MoreHorizontal,
  Edit,
  Trash2,
  FileText,
  Clock,
  Users,
  Zap,
  Shield,
  Star,
  ArrowUpRight,
  ArrowDownRight,
  Receipt,
  RefreshCw,
  Settings,
} from 'lucide-react';
import { useState } from 'react';

// Mock billing data
const billingData = {
  currentPlan: {
    name: 'Pro Plan',
    price: 49.99,
    interval: 'month',
    features: ['Unlimited projects', '50GB storage', 'Priority support'],
    nextBilling: '2024-04-25',
    status: 'active',
  },
  usage: {
    projects: { current: 12, limit: 50, percentage: 24 },
    storage: { current: 25.6, limit: 50, percentage: 51.2 },
    apiCalls: { current: 8540, limit: 100000, percentage: 8.54 },
    teamMembers: { current: 8, limit: 25, percentage: 32 },
  },
  paymentMethods: [
    {
      id: 1,
      type: 'Visa',
      last4: '4242',
      expiryMonth: 12,
      expiryYear: 2025,
      isDefault: true,
    },
    {
      id: 2,
      type: 'Mastercard',
      last4: '5555',
      expiryMonth: 6,
      expiryYear: 2026,
      isDefault: false,
    },
  ],
  invoices: [
    {
      id: 'inv_001',
      amount: 49.99,
      status: 'paid',
      date: '2024-03-25',
      period: 'Mar 25 - Apr 25, 2024',
      downloadUrl: '/invoices/inv_001.pdf',
    },
    {
      id: 'inv_002',
      amount: 49.99,
      status: 'paid',
      date: '2024-02-25',
      period: 'Feb 25 - Mar 25, 2024',
      downloadUrl: '/invoices/inv_002.pdf',
    },
    {
      id: 'inv_003',
      amount: 49.99,
      status: 'pending',
      date: '2024-01-25',
      period: 'Jan 25 - Feb 25, 2024',
      downloadUrl: '/invoices/inv_003.pdf',
    },
  ],
  spending: {
    thisMonth: 49.99,
    lastMonth: 49.99,
    thisYear: 599.88,
    trend: 0,
  },
};

const plans = [
  {
    name: 'Starter',
    price: 19.99,
    yearlyPrice: 199.99,
    features: [
      '5 projects',
      '10GB storage',
      'Email support',
      'Basic analytics',
    ],
    recommended: false,
  },
  {
    name: 'Pro',
    price: 49.99,
    yearlyPrice: 499.99,
    features: [
      'Unlimited projects',
      '50GB storage',
      'Priority support',
      'Advanced analytics',
      'Team collaboration',
    ],
    recommended: true,
  },
  {
    name: 'Enterprise',
    price: 99.99,
    yearlyPrice: 999.99,
    features: [
      'Everything in Pro',
      '500GB storage',
      '24/7 phone support',
      'Custom integrations',
      'Advanced security',
      'Dedicated account manager',
    ],
    recommended: false,
  },
];

function UsageCard({
  title,
  current,
  limit,
  unit,
  icon: Icon,
  color,
}: {
  title: string;
  current: number;
  limit: number;
  unit: string;
  icon: any;
  color: string;
}) {
  const percentage = (current / limit) * 100;
  const isNearLimit = percentage > 80;

  return (
    <Card>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between mb-4'>
          <div className='flex items-center space-x-2'>
            <Icon className={`h-5 w-5 ${color}`} />
            <h3 className='font-medium text-gray-900'>{title}</h3>
          </div>
          {isNearLimit && <AlertTriangle className='h-4 w-4 text-orange-500' />}
        </div>
        <div className='space-y-2'>
          <div className='flex justify-between text-sm'>
            <span className='text-gray-600'>
              {current} {unit} of {limit} {unit}
            </span>
            <span
              className={`font-medium ${isNearLimit ? 'text-orange-600' : 'text-gray-900'}`}
            >
              {percentage.toFixed(1)}%
            </span>
          </div>
          <div className='w-full bg-gray-200 rounded-full h-2'>
            <div
              className={`h-2 rounded-full ${isNearLimit ? 'bg-orange-500' : 'bg-blue-500'}`}
              style={{ width: `${Math.min(percentage, 100)}%` }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function PaymentMethodCard({
  method,
  onEdit,
  onDelete,
  onSetDefault,
}: {
  method: (typeof billingData.paymentMethods)[0];
  onEdit: () => void;
  onDelete: () => void;
  onSetDefault: () => void;
}) {
  return (
    <Card className={method.isDefault ? 'ring-2 ring-blue-500' : ''}>
      <CardContent className='p-6'>
        <div className='flex items-center justify-between'>
          <div className='flex items-center space-x-3'>
            <CreditCard className='h-8 w-8 text-gray-400' />
            <div>
              <div className='flex items-center space-x-2'>
                <span className='font-medium'>
                  {method.type} •••• {method.last4}
                </span>
                {method.isDefault && (
                  <Badge variant='secondary' className='text-xs'>
                    Default
                  </Badge>
                )}
              </div>
              <p className='text-sm text-gray-500'>
                Expires {method.expiryMonth}/{method.expiryYear}
              </p>
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant='ghost' size='sm'>
                <MoreHorizontal className='h-4 w-4' />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align='end'>
              <DropdownMenuLabel>Actions</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onEdit}>
                <Edit className='h-4 w-4 mr-2' />
                Edit
              </DropdownMenuItem>
              {!method.isDefault && (
                <DropdownMenuItem onClick={onSetDefault}>
                  <Star className='h-4 w-4 mr-2' />
                  Set as Default
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onDelete} className='text-red-600'>
                <Trash2 className='h-4 w-4 mr-2' />
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  );
}

function InvoiceRow({
  invoice,
}: {
  invoice: (typeof billingData.invoices)[0];
}) {
  const statusColors = {
    paid: 'bg-green-100 text-green-800',
    pending: 'bg-yellow-100 text-yellow-800',
    failed: 'bg-red-100 text-red-800',
  };

  return (
    <TableRow>
      <TableCell>
        <div className='flex items-center space-x-2'>
          <Receipt className='h-4 w-4 text-gray-400' />
          <span className='font-medium'>{invoice.id}</span>
        </div>
      </TableCell>
      <TableCell>
        <Badge
          className={statusColors[invoice.status as keyof typeof statusColors]}
        >
          {invoice.status}
        </Badge>
      </TableCell>
      <TableCell>${invoice.amount}</TableCell>
      <TableCell>{invoice.date}</TableCell>
      <TableCell className='text-sm text-gray-600'>{invoice.period}</TableCell>
      <TableCell>
        <Button variant='ghost' size='sm' asChild>
          <a href={invoice.downloadUrl} download>
            <Download className='h-4 w-4' />
          </a>
        </Button>
      </TableCell>
    </TableRow>
  );
}

function PlanCard({
  plan,
  isCurrentPlan,
  onUpgrade,
}: {
  plan: (typeof plans)[0];
  isCurrentPlan: boolean;
  onUpgrade: () => void;
}) {
  return (
    <Card
      className={`relative ${plan.recommended ? 'ring-2 ring-blue-500' : ''}`}
    >
      {plan.recommended && (
        <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
          <Badge className='bg-blue-500 text-white'>Recommended</Badge>
        </div>
      )}
      <CardHeader className='text-center pb-2'>
        <CardTitle className='text-xl'>{plan.name}</CardTitle>
        <div className='space-y-1'>
          <div className='text-3xl font-bold'>${plan.price}</div>
          <div className='text-sm text-gray-500'>per month</div>
          <div className='text-xs text-gray-400'>
            ${plan.yearlyPrice}/year (save 17%)
          </div>
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <ul className='space-y-2'>
          {plan.features.map((feature, index) => (
            <li key={index} className='flex items-center space-x-2 text-sm'>
              <Check className='h-4 w-4 text-green-500' />
              <span>{feature}</span>
            </li>
          ))}
        </ul>
        <Button
          className='w-full'
          variant={isCurrentPlan ? 'outline' : 'default'}
          disabled={isCurrentPlan}
          onClick={onUpgrade}
        >
          {isCurrentPlan ? 'Current Plan' : 'Upgrade'}
        </Button>
      </CardContent>
    </Card>
  );
}

export default function AdvancedBilling() {
  const [billingInterval, setBillingInterval] = useState('monthly');

  return (
    <TooltipProvider>
      <div className='p-6 space-y-6'>
        <div className='flex items-center justify-between'>
          <div>
            <h1 className='text-3xl font-bold text-gray-900'>
              Billing & Usage
            </h1>
            <p className='text-gray-600'>
              Manage your subscription, usage, and billing preferences
            </p>
          </div>
          <div className='flex items-center space-x-2'>
            <Button variant='outline' size='sm'>
              <Download className='h-4 w-4 mr-2' />
              Export
            </Button>
            <Button variant='outline' size='sm'>
              <Settings className='h-4 w-4 mr-2' />
              Billing Settings
            </Button>
          </div>
        </div>

        {/* Current Plan & Spending Overview */}
        <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6'>
          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Current Plan
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {billingData.currentPlan.name}
                  </p>
                  <p className='text-sm text-gray-500'>
                    ${billingData.currentPlan.price}/
                    {billingData.currentPlan.interval}
                  </p>
                </div>
                <Shield className='h-8 w-8 text-blue-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    This Month
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    ${billingData.spending.thisMonth}
                  </p>
                  <div className='flex items-center text-sm text-gray-500'>
                    <TrendingUp className='h-3 w-3 mr-1' aria-hidden="true" />
                    <span>vs last month</span>
                  </div>
                </div>
                <DollarSign className='h-8 w-8 text-green-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Next Billing
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    {billingData.currentPlan.nextBilling}
                  </p>
                  <p className='text-sm text-gray-500'>Auto-renewal enabled</p>
                </div>
                <Calendar className='h-8 w-8 text-orange-600' />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className='p-6'>
              <div className='flex items-center justify-between'>
                <div>
                  <p className='text-sm font-medium text-gray-600'>
                    Annual Spending
                  </p>
                  <p className='text-2xl font-bold text-gray-900'>
                    ${billingData.spending.thisYear}
                  </p>
                  <p className='text-sm text-gray-500'>12 months</p>
                </div>
                <TrendingUp className='h-8 w-8 text-purple-600' />
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue='usage' className='space-y-6'>
          <TabsList>
            <TabsTrigger value='usage'>Usage & Limits</TabsTrigger>
            <TabsTrigger value='plans'>Plans & Pricing</TabsTrigger>
            <TabsTrigger value='payment'>Payment Methods</TabsTrigger>
            <TabsTrigger value='invoices'>Invoices & History</TabsTrigger>
          </TabsList>

          <TabsContent value='usage' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Current Usage</CardTitle>
                <CardDescription>
                  Monitor your usage across different plan limits
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
                  <UsageCard
                    title='Projects'
                    current={billingData.usage.projects.current}
                    limit={billingData.usage.projects.limit}
                    unit='projects'
                    icon={FileText}
                    color='text-blue-600'
                  />
                  <UsageCard
                    title='Storage'
                    current={billingData.usage.storage.current}
                    limit={billingData.usage.storage.limit}
                    unit='GB'
                    icon={FileText}
                    color='text-green-600'
                  />
                  <UsageCard
                    title='API Calls'
                    current={billingData.usage.apiCalls.current}
                    limit={billingData.usage.apiCalls.limit}
                    unit='calls'
                    icon={Zap}
                    color='text-yellow-600'
                  />
                  <UsageCard
                    title='Team Members'
                    current={billingData.usage.teamMembers.current}
                    limit={billingData.usage.teamMembers.limit}
                    unit='members'
                    icon={Users}
                    color='text-purple-600'
                  />
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='plans' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Choose Your Plan</CardTitle>
                <CardDescription>
                  Upgrade or downgrade your subscription at any time
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                  {plans.map((plan) => (
                    <PlanCard
                      key={plan.name}
                      plan={plan}
                      isCurrentPlan={plan.name === billingData.currentPlan.name}
                      onUpgrade={() => console.log(`Upgrading to ${plan.name}`)}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='payment' className='space-y-6'>
            <Card>
              <CardHeader>
                <div className='flex items-center justify-between'>
                  <div>
                    <CardTitle>Payment Methods</CardTitle>
                    <CardDescription>
                      Manage your payment methods and billing preferences
                    </CardDescription>
                  </div>
                  <Button>
                    <Plus className='h-4 w-4 mr-2' />
                    Add Payment Method
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className='space-y-4'>
                  {billingData.paymentMethods.map((method) => (
                    <PaymentMethodCard
                      key={method.id}
                      method={method}
                      onEdit={() => console.log('Edit payment method')}
                      onDelete={() => console.log('Delete payment method')}
                      onSetDefault={() => console.log('Set as default')}
                    />
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value='invoices' className='space-y-6'>
            <Card>
              <CardHeader>
                <CardTitle>Billing History</CardTitle>
                <CardDescription>
                  View and download your invoices and billing history
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Invoice</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Date</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {billingData.invoices.map((invoice) => (
                      <InvoiceRow key={invoice.id} invoice={invoice} />
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </TooltipProvider>
  );
}
