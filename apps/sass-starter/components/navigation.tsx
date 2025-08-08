import { Button } from "@workspace/ui/components/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@workspace/ui/components/dropdown-menu";
import { Rocket } from "lucide-react";
import Link from "next/link";
import { LogoutButton } from "./logout-button";

interface NavigationProps {
  isLoggedIn: boolean;
  userRole: string | null;
}

export default function Navigation({ isLoggedIn, userRole }: NavigationProps) {
  return (
    <div className="sticky top-0 z-50 w-full flex justify-center bg-white/80 backdrop-blur-sm border-b">
      <div className="w-full max-w-6xl px-4 py-4 flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Rocket className="h-8 w-8 text-primary" />
          <Link
            href="/"
            className="text-2xl font-bold text-gray-900 hover:text-gray-700 transition-colors"
          >
            SaaS Starter
          </Link>
        </div>
        <nav className="hidden md:flex items-center space-x-6">
          <Link
            href="/#features"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Features
          </Link>
          <Link
            href="/#pricing"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Pricing
          </Link>
          <Link
            href="/#testimonials"
            className="text-gray-600 hover:text-gray-900 transition-colors"
          >
            Testimonials
          </Link>
        </nav>
        <div className="flex items-center space-x-4">
          {isLoggedIn ? (
            <div className="flex items-center space-x-4">
              {userRole === "owner" || userRole === "admin" ? (
                <Button asChild>
                  <Link href="/dashboard">Go to Dashboard</Link>
                </Button>
              ) : (
                <Button asChild>
                  <Link href="/todo">Open Quest Board</Link>
                </Button>
              )}

              {/* User Avatar Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button
                    variant="outline"
                    size="icon"
                    className="overflow-hidden rounded-full"
                  >
                    <div className="h-8 w-8 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm">
                      U
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem asChild>
                    <Link href="/todo">Quest Board</Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem>Profile</DropdownMenuItem>
                  <DropdownMenuItem>Settings</DropdownMenuItem>
                  {userRole === "owner" || userRole === "admin" ? (
                    <DropdownMenuItem asChild>
                      <Link href="/dashboard">Dashboard</Link>
                    </DropdownMenuItem>
                  ) : null}
                  <DropdownMenuSeparator />
                  <LogoutButton />
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/sign-in">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
