import * as z from "zod";

import db from "@workspace/prisma";
import { RequiresProPlanError } from "@hub/lib";
import { getUserSubscriptionPlan } from "@hub/lib";
import { authConfig } from "@/config/auth";
import { auth } from "@/auth";

const postCreateSchema = z.object({
  title: z.string(),
  content: z.string().optional(),
});

export async function GET() {
  try {
    const session = await auth();

    if (!session) {
      return new Response("Unauthorized", { status: 403 });
    }

    const { user = {} } = session;
    const posts = await db.post.findMany({
      select: {
        id: true,
        title: true,
        published: true,
        createdAt: true,
      },
      where: {
        authorId: user.id,
      },
    });

    return new Response(JSON.stringify(posts));
  } catch (error) {
    return new Response(null, { status: 500 });
  }
}

export async function POST(req: Request) {
  try {
    const session = await auth();

    if (!session) {
      return new Response("Unauthorized", { status: 403 });
    }

    const { user = {} } = session;
    // @ts-ignore
    const subscriptionPlan = await getUserSubscriptionPlan(user.id);

    // If user is on a free plan.
    // Check if user has reached limit of 3 posts.
    if (!subscriptionPlan?.isPro) {
      const count = await db.post.count({
        where: {
          authorId: user.id,
        },
      });

      if (count >= 3) {
        throw new RequiresProPlanError();
      }
    }

    const json = await req.json();
    const body = postCreateSchema.parse(json);

    // const post = await db.post.create({
    //   data: {
    //     title: body.title,
    //     content: body.content,
    //   },
    //   select: {
    //     id: true,
    //   },
    // });
    const post = {};

    return new Response(JSON.stringify(post));
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response(JSON.stringify(error.issues), { status: 422 });
    }

    if (error instanceof RequiresProPlanError) {
      return new Response("Requires Pro Plan", { status: 402 });
    }

    return new Response(null, { status: 500 });
  }
}
