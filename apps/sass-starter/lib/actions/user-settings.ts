"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";
import {
  createUserProfile,
  getUserWithProfile,
  updateUserBasicInfo,
  updateUserProfile,
} from "@/lib/db/queries";

// Profile information schema
const profileSchema = z.object({
  firstName: z.string().min(1, "First name is required").max(50),
  lastName: z.string().min(1, "Last name is required").max(50),
  email: z.string().email("Invalid email address"),
  bio: z.string().max(500, "Bio must be less than 500 characters").optional(),
  phone: z.string().max(20, "Phone must be less than 20 characters").optional(),
  timezone: z.string().optional(),
  language: z.string().optional(),
});

// Company information schema
const companySchema = z.object({
  companyName: z
    .string()
    .max(100, "Company name must be less than 100 characters")
    .optional(),
  companyWebsite: z
    .string()
    .url("Invalid website URL")
    .optional()
    .or(z.literal("")),
  jobTitle: z
    .string()
    .max(100, "Job title must be less than 100 characters")
    .optional(),
});

export async function updateProfileAction(formData: FormData) {
  try {
    const userData = await getUserWithProfile();
    if (!userData) {
      redirect("/login");
    }

    // Extract and validate profile data
    const profileData = {
      firstName: formData.get("firstName") as string,
      lastName: formData.get("lastName") as string,
      email: formData.get("email") as string,
      bio: (formData.get("bio") as string) || "",
      phone: (formData.get("phone") as string) || "",
      timezone: (formData.get("timezone") as string) || "UTC",
      language: (formData.get("language") as string) || "en",
    };

    // Validate the data
    const validatedData = profileSchema.parse(profileData);

    // Update user basic info (name and email)
    const fullName = `${validatedData.firstName} ${validatedData.lastName}`;
    await updateUserBasicInfo(userData.id, {
      name: fullName,
      email: validatedData.email,
    });

    // Update or create profile
    const profileUpdateData = {
      firstName: validatedData.firstName,
      lastName: validatedData.lastName,
      bio: validatedData.bio,
      phone: validatedData.phone,
      timezone: validatedData.timezone,
      language: validatedData.language,
    };

    if (userData.profile) {
      await updateUserProfile(userData.id, profileUpdateData);
    } else {
      await createUserProfile(userData.id, profileUpdateData);
    }

    revalidatePath("/settings");
    return { success: true, message: "Profile updated successfully" };
  } catch (error) {
    console.error("Error updating profile:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation error",
        errors: error.flatten().fieldErrors,
      };
    }
    return { success: false, message: "Failed to update profile" };
  }
}

export async function updateCompanyAction(formData: FormData) {
  try {
    const userData = await getUserWithProfile();
    if (!userData) {
      redirect("/login");
    }

    // Extract and validate company data
    const companyData = {
      companyName: (formData.get("companyName") as string) || "",
      companyWebsite: (formData.get("companyWebsite") as string) || "",
      jobTitle: (formData.get("jobTitle") as string) || "",
    };

    // Validate the data
    const validatedData = companySchema.parse(companyData);

    // Update or create profile with company info
    if (userData.profile) {
      await updateUserProfile(userData.id, validatedData);
    } else {
      await createUserProfile(userData.id, validatedData);
    }

    revalidatePath("/settings");
    return {
      success: true,
      message: "Company information updated successfully",
    };
  } catch (error) {
    console.error("Error updating company info:", error);
    if (error instanceof z.ZodError) {
      return {
        success: false,
        message: "Validation error",
        errors: error.flatten().fieldErrors,
      };
    }
    return { success: false, message: "Failed to update company information" };
  }
}

export async function getUserSettingsData() {
  try {
    const userData = await getUserWithProfile();
    if (!userData) {
      return null;
    }

    return {
      user: {
        id: userData.id,
        name: userData.name,
        email: userData.email,
        role: userData.role,
      },
      profile: userData.profile || null,
    };
  } catch (error) {
    console.error("Error fetching user settings:", error);
    return null;
  }
}
