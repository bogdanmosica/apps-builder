"use server";

import { SignInOptions } from "next-auth/react";

import { signIn } from "@/auth";

export async function authenticateUser(
  provider: string,
  options?: SignInOptions,
) {
  try {
    await signIn(provider, options);
  } catch (error) {
    throw error;
  }
}
