"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import axios from "axios";
import type * as z from "zod";
import { cn } from "@hub/utils";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../ui/card";
import { userNameSchema } from "@hub/validations";
import { Icons } from "../icons";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { buttonVariants } from "../ui/button";
import { User } from "@hub/types";
import { toast } from "../ui/use-toast";

type UserNameFormProps = React.HTMLAttributes<HTMLFormElement> & { user: User };

type FormData = z.infer<typeof userNameSchema>;

export function UserNameForm({
  className,
  user,
  ...props
}: UserNameFormProps): JSX.Element {
  const router = useRouter();
  const {
    handleSubmit,
    register,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(userNameSchema),
    defaultValues: {
      name: user?.name || "",
    },
  });
  const [isSaving, setIsSaving] = React.useState<boolean>(false);
  const [updateUser, setUpdateUser] = React.useState<User>(user);

  async function onSubmit(data: FormData) {
    setIsSaving(true);

    const response = await axios.patch(
      `/users/${user.id}`,
      { ...data },
      { withCredentials: true },
    );

    setIsSaving(false);

    if (!response) {
      return toast({
        title: "Something went wrong.",
        description: "Your name was not updated. Please try again.",
        variant: "destructive",
      });
    }
    setUpdateUser({ ...response.data });
    toast({
      description: "Your name has been updated.",
    });

    router.refresh();
  }

  return (
    <form
      className={cn(className)}
      onSubmit={handleSubmit(onSubmit)}
      {...props}
    >
      <Card className="w-full">
        <CardHeader>
          <CardTitle>Your Name</CardTitle>
          <CardDescription>Please enter your full name.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-1">
            <Label className="sr-only" htmlFor="firstName">
              First name
            </Label>
            <Input
              className=""
              id="firstName"
              placeholder="First name..."
              size={32}
              {...register("firstName")}
            />
            {errors?.firstName ? (
              <p className="px-1 text-xs text-red-600">
                {errors.firstName.message}
              </p>
            ) : null}
            <Label className="sr-only" htmlFor="lastName">
              Last name
            </Label>
            <Input
              className=""
              id="lastName"
              placeholder="Last name..."
              size={32}
              {...register("lastName")}
            />
            {errors?.lastName ? (
              <p className="px-1 text-xs text-red-600">
                {errors.lastName.message}
              </p>
            ) : null}
          </div>
        </CardContent>
        <CardFooter>
          <button
            className={cn(buttonVariants(), className)}
            disabled={isSaving}
            type="submit"
          >
            {isSaving ? (
              <Icons.Spinner className="mr-2 h-4 w-4 animate-spin" />
            ) : null}
            <span>Save</span>
          </button>
        </CardFooter>
      </Card>
    </form>
  );
}
