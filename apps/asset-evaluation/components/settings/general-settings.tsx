"use client";

import { Badge } from "@workspace/ui/components/badge";
import { Button } from "@workspace/ui/components/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@workspace/ui/components/card";
import { Input } from "@workspace/ui/components/input";
import { Label } from "@workspace/ui/components/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@workspace/ui/components/select";
import { Textarea } from "@workspace/ui/components/textarea";
import { AlertCircle, CheckCircle, Loader2, Save, User } from "lucide-react";
import { useState, useTransition } from "react";
import { toast } from "sonner";
import {
  updateCompanyAction,
  updateProfileAction,
} from "@/lib/actions/user-settings";

interface UserData {
  user: {
    id: number;
    name: string | null;
    email: string;
    role: string;
  };
  profile: {
    id: number;
    firstName: string | null;
    lastName: string | null;
    bio: string | null;
    phone: string | null;
    timezone: string | null;
    language: string | null;
    companyName: string | null;
    companyWebsite: string | null;
    jobTitle: string | null;
  } | null;
}

interface GeneralSettingsProps {
  userData: UserData | null;
}

const TIMEZONES = [
  { value: "UTC", label: "UTC (Coordinated Universal Time)" },
  { value: "America/New_York", label: "Eastern Time (ET)" },
  { value: "America/Chicago", label: "Central Time (CT)" },
  { value: "America/Denver", label: "Mountain Time (MT)" },
  { value: "America/Los_Angeles", label: "Pacific Time (PT)" },
  { value: "Europe/London", label: "London (GMT/BST)" },
  { value: "Europe/Paris", label: "Paris (CET/CEST)" },
  { value: "Europe/Berlin", label: "Berlin (CET/CEST)" },
  { value: "Asia/Tokyo", label: "Tokyo (JST)" },
  { value: "Asia/Shanghai", label: "Shanghai (CST)" },
  { value: "Australia/Sydney", label: "Sydney (AEST/AEDT)" },
];

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "es", label: "Spanish" },
  { value: "fr", label: "French" },
  { value: "de", label: "German" },
  { value: "it", label: "Italian" },
  { value: "pt", label: "Portuguese" },
  { value: "zh", label: "Chinese" },
  { value: "ja", label: "Japanese" },
];

export default function GeneralSettings({ userData }: GeneralSettingsProps) {
  const [isPendingProfile, startTransitionProfile] = useTransition();
  const [isPendingCompany, startTransitionCompany] = useTransition();

  if (!userData) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="text-center">
            <AlertCircle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
            <p className="text-muted-foreground">Failed to load user data</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Parse name into first and last name
  const nameParts = userData.user.name?.split(" ") || [];
  const firstName = userData.profile?.firstName || nameParts[0] || "";
  const lastName =
    userData.profile?.lastName || nameParts.slice(1).join(" ") || "";

  const handleProfileSubmit = async (formData: FormData) => {
    startTransitionProfile(async () => {
      const result = await updateProfileAction(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  const handleCompanySubmit = async (formData: FormData) => {
    startTransitionCompany(async () => {
      const result = await updateCompanyAction(formData);
      if (result.success) {
        toast.success(result.message);
      } else {
        toast.error(result.message);
      }
    });
  };

  return (
    <div className="space-y-6">
      {/* Profile Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Profile Information
          </CardTitle>
          <CardDescription>
            Update your account profile information and email address.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleProfileSubmit} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="firstName">First Name</Label>
                <Input
                  id="firstName"
                  name="firstName"
                  defaultValue={firstName}
                  placeholder="John"
                  required
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="lastName">Last Name</Label>
                <Input
                  id="lastName"
                  name="lastName"
                  defaultValue={lastName}
                  placeholder="Doe"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={userData.user.email}
                placeholder="john.doe@example.com"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                defaultValue={userData.profile?.phone || ""}
                placeholder="+1 (555) 123-4567"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="bio">Bio</Label>
              <Textarea
                id="bio"
                name="bio"
                defaultValue={userData.profile?.bio || ""}
                placeholder="Tell us about yourself..."
                className="min-h-[100px]"
                maxLength={500}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="timezone">Timezone</Label>
                <Select
                  name="timezone"
                  defaultValue={userData.profile?.timezone || "UTC"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select timezone" />
                  </SelectTrigger>
                  <SelectContent>
                    {TIMEZONES.map((tz) => (
                      <SelectItem key={tz.value} value={tz.value}>
                        {tz.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="language">Language</Label>
                <Select
                  name="language"
                  defaultValue={userData.profile?.language || "en"}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select language" />
                  </SelectTrigger>
                  <SelectContent>
                    {LANGUAGES.map((lang) => (
                      <SelectItem key={lang.value} value={lang.value}>
                        {lang.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-4">
              <Button type="submit" disabled={isPendingProfile}>
                {isPendingProfile ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="mr-2 h-4 w-4" />
                    Save Changes
                  </>
                )}
              </Button>
              <div className="flex items-center gap-2">
                <Badge variant="outline" className="text-xs">
                  {userData.user.role.charAt(0).toUpperCase() +
                    userData.user.role.slice(1)}
                </Badge>
              </div>
            </div>
          </form>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card>
        <CardHeader>
          <CardTitle>Company Information</CardTitle>
          <CardDescription>
            Update your company details for billing and invoices.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form action={handleCompanySubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="companyName">Company Name</Label>
              <Input
                id="companyName"
                name="companyName"
                defaultValue={userData.profile?.companyName || ""}
                placeholder="Acme Inc."
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="companyWebsite">Website</Label>
              <Input
                id="companyWebsite"
                name="companyWebsite"
                type="url"
                defaultValue={userData.profile?.companyWebsite || ""}
                placeholder="https://acme.com"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="jobTitle">Job Title</Label>
              <Input
                id="jobTitle"
                name="jobTitle"
                defaultValue={userData.profile?.jobTitle || ""}
                placeholder="Software Engineer"
              />
            </div>

            <Button type="submit" disabled={isPendingCompany}>
              {isPendingCompany ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Updating...
                </>
              ) : (
                "Update Company"
              )}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
