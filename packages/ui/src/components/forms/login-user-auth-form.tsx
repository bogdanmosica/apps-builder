"use client";

import { zodResolver } from "@hookform/resolvers/zod";
import { buttonVariants } from "@workspace/ui/components/button";
import { Icons } from "@workspace/ui/components/icons";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import { Toaster } from "@workspace/ui/components/sonner";
import { cn } from "@workspace/ui/lib/utils";
import { userAuthSchema } from "@workspace/validations";
import { useRouter, useSearchParams } from "next/navigation";
import * as React from "react";
import { useForm } from "react-hook-form";
import { toast } from "sonner";
import type * as z from "zod";

// import { signIn } from '../../lib/session';
//import useMainStoreContext from '../../hooks/use-main-store-context';

type LoginUserAuthProps = React.HTMLAttributes<HTMLDivElement>;

type FormData = z.infer<typeof userAuthSchema>;

export function LoginUserAuthForm({
  className,
  ...props
}: LoginUserAuthProps): React.JSX.Element {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userAuthSchema),
  });
  //const { setIsUserAuthenticated, setUser } = useMainStoreContext();
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [isGitHubLoading, setIsGitHubLoading] = React.useState<boolean>(false);
  const searchParams = useSearchParams();
  const router = useRouter();

  function onSubmit(_data: FormData): void {
    setIsLoading(true);

    // const signInResult = await signIn('email', {
    //   email: data.email.toLowerCase(),
    //   password: data.password,
    // });
    const signInResult = { ok: true };

    setIsLoading(false);

    if (!signInResult.ok) {
      toast(
        "Something went wrong. Your sign in request failed. Please try again.",
      );
    }

    // setIsUserAuthenticated(signInResult?.ok);
    // setUser((state) => ({
    //   ...state,
    //   email: data.email.toLowerCase(),
    // }));
    router.push(`/${searchParams.get("from") || "dashboard"}`);
    toast("Success! You successfully logged in.");
  }

  return (
    <>
      <Toaster />
      <div className={cn("grid gap-6", className)} {...props}>
        <form onSubmit={handleSubmit(onSubmit)}>
          <div className="grid gap-2">
            <div className="grid gap-1">
              <Label className="sr-only" htmlFor="email">
                Email
              </Label>
              <Input
                autoCapitalize="none"
                autoComplete="email"
                autoCorrect="off"
                disabled={isLoading || isGitHubLoading}
                id="email"
                placeholder="name@example.com"
                type="email"
                {...register("email")}
              />
              {errors?.email ? (
                <p className="px-1 text-xs text-red-600">
                  {errors.email.message}
                </p>
              ) : null}
              <Label className="sr-only" htmlFor="password">
                Password
              </Label>
              <Input
                autoCapitalize="none"
                autoComplete="password"
                autoCorrect="off"
                disabled={isLoading || isGitHubLoading}
                id="password"
                placeholder="Password"
                type="password"
                {...register("password")}
              />
              {errors?.password ? (
                <p className="px-1 text-xs text-red-600">
                  {errors.password.message}
                </p>
              ) : null}
            </div>
            <button className={cn(buttonVariants())} disabled={isLoading}>
              {isLoading ? (
                <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : null}
              Sign In with Email
            </button>
          </div>
        </form>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
        <button
          className={cn(buttonVariants({ variant: "outline" }))}
          disabled={isLoading || isGitHubLoading}
          onClick={() => {
            setIsGitHubLoading(true);
            //signIn('github', {});
          }}
          type="button"
        >
          {isGitHubLoading ? (
            <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            <Icons.GitHub className="mr-2 h-4 w-4" />
          )}{" "}
          Github
        </button>
      </div>
    </>
  );
}
