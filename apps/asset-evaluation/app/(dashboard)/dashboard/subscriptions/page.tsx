'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@workspace/ui/components/table';
import { Badge } from '@workspace/ui/components/badge';
import { Loader2, CreditCard } from 'lucide-react';
import { toast } from 'sonner';

interface Subscription {
  id: number;
  planName: string;
  status: string;
  amount: number;
  currency: string;
  billingPeriod: string;
  currentPeriodStart: string;
  currentPeriodEnd: string;
  createdAt: string;
  user: {
    name: string | null;
    email: string;
  };
}

export default function SubscriptionsPage() {
  const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchSubscriptions = async () => {
    try {
      const response = await fetch('/api/dashboard/subscriptions');
      if (response.ok) {
        const data = await response.json();
        setSubscriptions(data.subscriptions || []);
      } else {
        toast.error('Failed to load subscriptions');
      }
    } catch (error) {
      console.error('Error fetching subscriptions:', error);
      toast.error('Failed to load subscriptions');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSubscriptions();
  }, []);

  const formatAmount = (amount: number, currency: string, billingPeriod: string) => {
    const formattedAmount = `$${(amount / 100).toFixed(2)}`;
    const period = billingPeriod === 'monthly' ? 'month' : billingPeriod === 'yearly' ? 'year' : 'one-time';
    return billingPeriod === 'one_time' ? formattedAmount : `${formattedAmount}/${period}`;
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
        <Card>
          <CardHeader>
            <CardTitle>All Subscriptions</CardTitle>
            <CardDescription>
              Manage and view all customer subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin" />
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
      <div className="grid auto-rows-max items-start gap-4 md:gap-8">
        <div className="grid gap-4">
          <Card>
            <CardHeader>
              <CardTitle>All Subscriptions ({subscriptions.length})</CardTitle>
              <CardDescription>
                Manage and view all customer subscriptions
              </CardDescription>
            </CardHeader>
            <CardContent>
              {subscriptions.length === 0 ? (
                <div className="text-center py-8">
                  <CreditCard className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-muted-foreground mb-2">
                    No subscriptions yet
                  </h3>
                  <p className="text-sm text-muted-foreground mb-4">
                    Customer subscriptions will appear here once they start subscribing to your products
                  </p>
                </div>
              ) : (
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Customer</TableHead>
                      <TableHead>Email</TableHead>
                      <TableHead>Plan</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Amount</TableHead>
                      <TableHead>Period</TableHead>
                      <TableHead>Start Date</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {subscriptions.map((subscription) => (
                      <TableRow key={subscription.id}>
                        <TableCell className="font-medium">
                          {subscription.user.name || 'Unknown'}
                        </TableCell>
                        <TableCell>{subscription.user.email}</TableCell>
                        <TableCell>{subscription.planName}</TableCell>
                        <TableCell>
                          <Badge
                            variant={
                              subscription.status === 'active'
                                ? 'default'
                                : subscription.status === 'cancelled'
                                ? 'secondary'
                                : 'outline'
                            }
                          >
                            {subscription.status}
                          </Badge>
                        </TableCell>
                        <TableCell>
                          {formatAmount(subscription.amount, subscription.currency, subscription.billingPeriod)}
                        </TableCell>
                        <TableCell>
                          <Badge variant="outline">
                            {subscription.billingPeriod === 'monthly' ? 'Monthly' : 
                             subscription.billingPeriod === 'yearly' ? 'Yearly' : 'One-time'}
                          </Badge>
                        </TableCell>
                        <TableCell>{formatDate(subscription.createdAt)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
