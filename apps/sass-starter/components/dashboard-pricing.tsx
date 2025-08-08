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
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@workspace/ui/components/table";
import { DollarSign, Edit, Plus, Trash2 } from "lucide-react";
import { useEffect, useState } from "react";

interface PricingPlan {
  id: number;
  name: string;
  description: string;
  price: number;
  currency: string;
  billingPeriod: string;
  features: string[];
  isPopular: boolean;
  isActive: string;
  stripePriceId?: string;
  stripeProductId?: string;
  createdAt: string;
  updatedAt: string;
}

export default function DashboardPricing() {
  const [plans, setPlans] = useState<PricingPlan[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPricingPlans();
  }, []);

  const fetchPricingPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch("/api/pricing");
      if (response.ok) {
        const data = await response.json();
        setPlans(data);
      } else {
        console.error("Failed to fetch pricing plans");
      }
    } catch (error) {
      console.error("Error fetching pricing plans:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <DollarSign className="h-5 w-5" />
            Pricing Plans
          </CardTitle>
          <CardDescription>
            Manage your subscription pricing plans
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex justify-center py-8">
            <div className="flex flex-col items-center space-y-4">
              <div className="relative">
                <div className="w-10 h-10 border-4 border-gray-200 rounded-full"></div>
                <div className="absolute top-0 left-0 w-10 h-10 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
              <p className="text-sm text-gray-600">Loading pricing plans...</p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <DollarSign className="h-5 w-5" />
              Pricing Plans
            </CardTitle>
            <CardDescription>
              Manage your subscription pricing plans
            </CardDescription>
          </div>
          <Button>
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        {plans.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500 mb-4">No pricing plans found</p>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              Create Your First Plan
            </Button>
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Plan Name</TableHead>
                <TableHead>Price</TableHead>
                <TableHead>Billing Period</TableHead>
                <TableHead>Features</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {plans.map((plan) => (
                <TableRow key={plan.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <div>
                        <div className="font-medium">{plan.name}</div>
                        <div className="text-sm text-gray-500">
                          {plan.description}
                        </div>
                      </div>
                      {plan.isPopular && (
                        <Badge variant="secondary">Popular</Badge>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium">
                      ${plan.price}
                      <span className="text-sm text-gray-500 ml-1">
                        {plan.currency.toUpperCase()}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline">{plan.billingPeriod}</Badge>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm text-gray-500">
                      {plan.features.length} features
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        plan.isActive === "true" ? "default" : "secondary"
                      }
                    >
                      {plan.isActive === "true" ? "Active" : "Inactive"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <Button variant="ghost" size="sm">
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </CardContent>
    </Card>
  );
}
