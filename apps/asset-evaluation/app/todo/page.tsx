import { getUser } from '@/lib/db/queries';
import GamifiedTodo from '@/components/gamified-todo';
import Navigation from '@/components/navigation';
import { Button } from '@workspace/ui/components/button';
import { Card, CardContent, CardHeader, CardTitle } from '@workspace/ui/components/card';
import { Lock, LogIn } from 'lucide-react';
import Link from 'next/link';

// Force dynamic rendering since this page uses cookies
export const dynamic = 'force-dynamic';

export default async function TodoPage() {
  const user = await getUser();
  const isLoggedIn = !!user;
  
  const userName = user?.name || 'Explorer';
  const isPro = user?.role === 'owner' || user?.role === 'admin';

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Navigation */}
      <Navigation isLoggedIn={isLoggedIn} userRole={user?.role || null} />
      
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            Quest Board
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Level up by completing your daily quests! Earn XP, unlock achievements, and become the ultimate productivity hero.
          </p>
        </div>

        {/* Content based on login status */}
        <div className="max-w-4xl mx-auto">
          {isLoggedIn ? (
            <GamifiedTodo 
              userName={userName}
              isPro={isPro}
            />
          ) : (
            /* Empty Quest Board for non-logged users */
            <div className="space-y-6">
              {/* Login Prompt Card */}
              <Card className="border-2 border-dashed border-gray-300 bg-gray-50/50">
                <CardHeader className="text-center pb-4">
                  <div className="mx-auto w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mb-4">
                    <Lock className="w-6 h-6 text-blue-600" />
                  </div>
                  <CardTitle className="text-2xl text-gray-700">Sign In to Access Your Quest Board</CardTitle>
                </CardHeader>
                <CardContent className="text-center">
                  <p className="text-gray-600 mb-6 max-w-md mx-auto">
                    Your personal quests, XP progress, and achievements are waiting for you. Sign in to continue your journey!
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button asChild className="text-lg px-8 py-6">
                      <Link href="/sign-in">
                        <LogIn className="mr-2 h-5 w-5" />
                        Sign In
                      </Link>
                    </Button>
                    <Button variant="outline" asChild className="text-lg px-8 py-6">
                      <Link href="/sign-up">
                        Create Account
                      </Link>
                    </Button>
                  </div>
                </CardContent>
              </Card>

              {/* Empty Quest Board Preview */}
              <Card className="opacity-50">
                <CardHeader>
                  <CardTitle className="flex items-center justify-between">
                    <span>🎯 Daily Quests</span>
                    <span className="text-sm text-gray-500">Level ? • ? XP</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                    <div className="h-12 bg-gray-200 rounded-lg animate-pulse"></div>
                  </div>
                  <div className="mt-6 p-4 bg-gray-100 rounded-lg text-center">
                    <p className="text-gray-500 text-sm">
                      🔒 Your quests will appear here once you sign in
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
