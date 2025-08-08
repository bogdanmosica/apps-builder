"use client";

import { buttonVariants } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Icons } from "@workspace/ui/components/icons";
import { cn } from "@workspace/ui/lib/utils";
import { formatDate } from "@workspace/utils/formatDate";
import type { FormEvent, HTMLAttributes, JSX } from "react";
import { useState } from "react";
import { toast } from "sonner";

interface BillingFormProps extends HTMLAttributes<HTMLFormElement> {
  subscriptionPlan: unknown & {
    isCanceled: boolean;
    description: string;
    isPro: boolean;
    name: string;
    stripeCurrentPeriodEnd: string | number;
  };
}

export function BillingForm({
  subscriptionPlan,
  className,
  ...props
}: BillingFormProps): JSX.Element {
  const [isLoading, setIsLoading] = useState<boolean>(false);

  function onSubmit(event: FormEvent<HTMLFormElement>): void {
    event.preventDefault();
    setIsLoading(!isLoading);

    // Get a Stripe session URL.
    fetch("/api/users/stripe")
      .then((response: Response) => {
        if (!response.ok) {
          toast("Please refresh the page and try again.");
          return;
        }

        // Redirect to the Stripe session.
        // This could be a checkout page for initial upgrade.
        // Or portal to manage existing subscription.
        return response.json();
      })
      .then((session: { url: string } | null) => {
        if (session) {
          window.location.href = session.url;
        }
      })
      .catch((error: Error) => {
        toast(error.message);
      });
  }

  return (
    <form className={cn(className)} onSubmit={onSubmit} {...props}>
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plan</CardTitle>
          <CardDescription>
            You are currently on the <strong>{subscriptionPlan.name}</strong>{" "}
            plan.
          </CardDescription>
        </CardHeader>
        <CardContent>{subscriptionPlan.description}</CardContent>
        <CardFooter className="flex flex-col items-start py-2 md:flex-row md:justify-between md:px-0">
          <button
            className={cn(buttonVariants())}
            disabled={isLoading}
            type="submit"
          >
            {isLoading ? (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            {subscriptionPlan.isPro ? "Manage Subscription" : "Upgrade to PRO"}
          </button>
          {subscriptionPlan.isPro ? (
            <p className="rounded-full text-xs font-medium">
              {subscriptionPlan.isCanceled
                ? "Your plan will be canceled on "
                : "Your plan renews on "}
              {formatDate(subscriptionPlan.stripeCurrentPeriodEnd)}.
            </p>
          ) : null}
        </CardFooter>
      </Card>
    </form>
  );
}
