"use server";

import type { SignInOptions } from "next-auth/react";

import { signIn } from "@/auth";

export async function authenticateUser(
  provider: string,
  options?: SignInOptions,
) {
  await signIn(provider, options);
}
