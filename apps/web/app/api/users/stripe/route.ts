import { getUserSubscriptionPlan } from "@hub/lib";
import { stripe } from "@hub/stripe";
import { proPlan } from "@hub/stripe/subscriptions";
import { absoluteUrl } from "@workspace/ui/lib/utils";
import { z } from "zod";
import { auth } from "@/auth";

const billingUrl = absoluteUrl("/dashboard/billing");

export async function GET(req: Request) {
  try {
    const session = await auth();

    if (!session?.user || !session?.user.email) {
      return new Response(null, { status: 403 });
    }
    // @ts-ignore
    const subscriptionPlan = await getUserSubscriptionPlan(session.user.id);

    // The user is on the pro plan.
    // Create a portal session to manage subscription.
    if (subscriptionPlan.isPro && subscriptionPlan.stripeCustomerId) {
      const stripeSession = await stripe.billingPortal.sessions.create({
        // @ts-ignore
        customer: subscriptionPlan.stripeCustomerId,
        return_url: billingUrl,
      });

      return new Response(JSON.stringify({ url: stripeSession.url }));
    }

    // The user is on the free plan.
    // Create a checkout session to upgrade.
    // @ts-ignore
    const stripeSession = await stripe.checkout.sessions.create({
      success_url: billingUrl,
      cancel_url: billingUrl,
      payment_method_types: ["card"],
      mode: "subscription",
      billing_address_collection: "auto",
      customer_email: session.user.email,
      line_items: [
        {
          price: proPlan.stripePriceId,
          quantity: 1,
        },
      ],
      metadata: {
        // @ts-ignore
        userId: session.user.id,
      },
    });

    return new Response(JSON.stringify({ url: stripeSession.url }));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 });
    }

    return new Response(null, { status: 500 });
  }
}
