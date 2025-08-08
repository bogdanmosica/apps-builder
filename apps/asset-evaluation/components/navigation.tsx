"use client";

import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Icons } from "@workspace/ui/components/icons";
import { Home, User } from "lucide-react";
import Link from "next/link";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/hooks/useAuth";
import LanguageSwitcher from "./LanguageSwitcher";
import { LogoutButton } from "./logout-button";
import { AddPropertyButton } from "./shared/AddPropertyButton";

interface NavigationProps {
  isLoggedIn?: boolean;
  userRole?: string | null;
}

export default function Navigation({
  isLoggedIn: propIsLoggedIn,
  userRole: propUserRole,
}: NavigationProps) {
  const { setTheme } = useTheme();
  const { t } = useTranslation([
    "common",
    "evaluation",
    "navigation",
    "property",
  ]);
  const { isLoggedIn: hookIsLoggedIn, user, isLoading } = useAuth();
  const [isScrolled, setIsScrolled] = useState(false);

  // Use hook data if available, fallback to props
  const isLoggedIn = !isLoading ? hookIsLoggedIn : propIsLoggedIn;
  const userRole = user?.role || propUserRole;

  // Handle scroll effect for navigation bar
  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 10);
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div
      className={`sticky top-0 z-50 w-full flex justify-center transition-all duration-200 ${
        isScrolled
          ? "bg-white/95 dark:bg-gray-900/95 backdrop-blur-md shadow-md"
          : "bg-white/80 dark:bg-gray-900/80 backdrop-blur-sm"
      } border-b border-gray-200 dark:border-gray-700`}
    >
      <div className="w-full max-w-6xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Home className="h-8 w-8 text-blue-600 dark:text-blue-400" />
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 dark:text-white hover:text-gray-700 dark:hover:text-gray-300 transition-colors"
          >
            PropertyEval
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          {/* Navigation links removed as requested */}
        </nav>
        <div className="flex items-center space-x-2">
          {/* Language Switcher - Always visible */}
          <LanguageSwitcher />

          {/* Theme Toggle - Always visible */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button className="h-9 w-9 px-0" size="sm" variant="ghost">
                <Icons.Sun className="rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Icons.Moon className="absolute rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => setTheme("light")}>
                <Icons.Sun className="mr-2 h-4 w-4" />
                <span>Light</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("dark")}>
                <Icons.Moon className="mr-2 h-4 w-4" />
                <span>Dark</span>
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => setTheme("system")}>
                <Icons.Laptop className="mr-2 h-4 w-4" />
                <span>System</span>
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>

          {isLoading ? (
            // Loading state
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gray-200 dark:bg-gray-700 rounded-full animate-pulse"></div>
            </div>
          ) : isLoggedIn ? (
            <div className="flex items-center space-x-4">
              {/* Add Property Dropdown */}
              <AddPropertyButton
                size="sm"
                className="bg-primary hover:bg-primary-dark"
                hideTextOnMobile={true}
              />

              {userRole === "owner" || userRole === "admin" ? (
                <Button asChild variant="outline" size="sm">
                  <Link href="/dashboard">
                    {t("dashboard", { ns: "navigation" })}
                  </Link>
                </Button>
              ) : null}

              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="overflow-hidden rounded-full"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm">
                      {user?.firstName ? (
                        user.firstName.charAt(0).toUpperCase()
                      ) : (
                        <User className="h-4 w-4" />
                      )}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>
                    {user?.firstName && user?.lastName
                      ? `${user.firstName} ${user.lastName}`
                      : user?.email || t("profile", { ns: "navigation" })}
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/evaluation">
                      {t("title", { ns: "evaluation" })}
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    {t("profile", { ns: "navigation" })}
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    {t("settings", { ns: "navigation" })}
                  </DropdownMenuItem>
                  {userRole === "owner" || userRole === "admin" ? (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">
                        {t("dashboard", { ns: "navigation" })}
                      </Link>
                    </DropdownMenuItem>
                  ) : null}

                  {/* Admin Menu */}
                  {userRole === "admin" && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuLabel>Admin</DropdownMenuLabel>
                      <DropdownMenuItem asChild>
                        <Link href="/dashboard/property-types">
                          Property Types
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  <DropdownMenuSeparator />
                  <LogoutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">{t("login", { ns: "common" })}</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">{t("register", { ns: "common" })}</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
