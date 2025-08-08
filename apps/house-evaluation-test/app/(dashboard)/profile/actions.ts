"use server";

import { eq } from "drizzle-orm";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import { validatedActionWithUser } from "@/lib/auth/middleware";
import { db } from "@/lib/db/drizzle";
import { getUser } from "@/lib/db/queries";
import { type User, type UserType, users } from "@/lib/db/schema";

const updateProfileSchema = z.object({
  name: z.string().min(1).max(100),
  phone: z.string().max(20).optional(),
  userType: z.enum(["tenant", "buyer", "investor"]),
  companyName: z.string().max(200).optional(),
  investmentBudget: z.coerce.number().int().min(0).optional(),
});

export const updateProfile = validatedActionWithUser(
  updateProfileSchema,
  async (data, formData, user) => {
    const { name, phone, userType, companyName, investmentBudget } = data;

    try {
      await db
        .update(users)
        .set({
          name,
          phone: phone || null,
          userType: userType as UserType,
          companyName: companyName || null,
          investmentBudget: investmentBudget || null,
          updatedAt: new Date(),
        })
        .where(eq(users.id, user.id));

      revalidatePath("/profile");

      return {
        success: true,
        error: "",
      };
    } catch (error) {
      return {
        success: false,
        error: "Failed to update profile. Please try again.",
      };
    }
  },
);
