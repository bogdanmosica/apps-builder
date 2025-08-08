"use client";

import { UserAuthFormFallback } from "@workspace/ui/components/fallbacks/user-auth-form-fallback";
import { UserAuthForm } from "@workspace/ui/components/forms/user-auth-form";
import { Suspense } from "react";
import { authenticateUser } from "@/actions/authenticate-user";

export const LoginForm = async () => {
  return (
    <Suspense fallback={<UserAuthFormFallback />}>
      <UserAuthForm signIn={authenticateUser} />
    </Suspense>
  );
};
