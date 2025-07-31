import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import {
  CheckCircle,
  Zap,
  Shield,
  Users,
  BarChart3,
  Rocket,
  Star,
  ArrowRight,
} from 'lucide-react';
import Link from 'next/link';
import PricingSection from './pricing-section';
import Navigation from './navigation';

interface MarketingLandingProps {
  isLoggedIn: boolean;
  userRole: string | null;
}

export default function MarketingLanding({
  isLoggedIn,
  userRole,
}: MarketingLandingProps) {
  return (
    <div className='min-h-screen bg-gradient-to-br from-gray-50 to-white'>
      {/* Navigation */}
      <Navigation isLoggedIn={isLoggedIn} userRole={userRole} />

      {/* Hero Section */}
      <section className='py-20 px-4'>
        <div className='container mx-auto text-center'>
          <div className='max-w-4xl mx-auto'>
            <h1 className='text-5xl md:text-6xl font-bold text-gray-900 mb-6'>
              Build Your SaaS
              <span className='text-primary block'>Faster Than Ever</span>
            </h1>
            <p className='text-xl text-gray-600 mb-8 max-w-2xl mx-auto'>
              Complete SaaS starter with authentication, payments, analytics,
              and team management. Everything you need to launch your next big
              idea.
            </p>
            <div className='flex flex-col sm:flex-row gap-4 justify-center'>
              {isLoggedIn ? (
                userRole === 'owner' || userRole === 'admin' ? (
                  <Button size='lg' asChild className='text-lg px-8 py-6'>
                    <Link href='/dashboard'>
                      Go to Dashboard
                      <ArrowRight className='ml-2 h-5 w-5' />
                    </Link>
                  </Button>
                ) : (
                  <Button size='lg' asChild className='text-lg px-8 py-6'>
                    <Link href='/todo'>
                      Open Quest Board
                      <ArrowRight className='ml-2 h-5 w-5' />
                    </Link>
                  </Button>
                )
              ) : (
                <>
                  <Button size='lg' asChild className='text-lg px-8 py-6'>
                    <Link href='/sign-up'>
                      Start Free Trial
                      <ArrowRight className='ml-2 h-5 w-5' />
                    </Link>
                  </Button>
                  <Button
                    size='lg'
                    variant='outline'
                    asChild
                    className='text-lg px-8 py-6'
                  >
                    <Link href='/sign-in'>Sign In</Link>
                  </Button>
                </>
              )}
            </div>
            <p className='text-sm text-gray-500 mt-4'>
              No credit card required • 14-day free trial • Cancel anytime
            </p>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id='features' className='py-20 bg-gray-50 px-4'>
        <div className='container mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              Everything You Need to Succeed
            </h2>
            <p className='text-xl text-gray-600 max-w-2xl mx-auto'>
              Built with modern tech stack and best practices to help you launch
              faster
            </p>
          </div>

          <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <Card className='border-0 shadow-lg hover:shadow-xl transition-shadow'>
              <CardHeader>
                <Zap className='h-12 w-12 text-primary mb-4' />
                <CardTitle>Lightning Fast</CardTitle>
                <CardDescription>
                  Built with Next.js 15 and optimized for performance
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2'>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Server-side rendering
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Edge optimization
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Instant page loads
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className='border-0 shadow-lg hover:shadow-xl transition-shadow'>
              <CardHeader>
                <Shield className='h-12 w-12 text-primary mb-4' />
                <CardTitle>Secure & Reliable</CardTitle>
                <CardDescription>
                  Enterprise-grade security and authentication
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2'>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    JWT authentication
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Role-based access
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Data encryption
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className='border-0 shadow-lg hover:shadow-xl transition-shadow'>
              <CardHeader>
                <Users className='h-12 w-12 text-primary mb-4' />
                <CardTitle>Team Management</CardTitle>
                <CardDescription>
                  Collaborate with your team efficiently
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2'>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    User roles & permissions
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Team invitations
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Activity tracking
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className='border-0 shadow-lg hover:shadow-xl transition-shadow'>
              <CardHeader>
                <BarChart3 className='h-12 w-12 text-primary mb-4' />
                <CardTitle>Analytics & Insights</CardTitle>
                <CardDescription>
                  Track your growth with detailed analytics
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2'>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Real-time metrics
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Revenue tracking
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    User behavior
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className='border-0 shadow-lg hover:shadow-xl transition-shadow'>
              <CardHeader>
                <Zap className='h-12 w-12 text-primary mb-4' />
                <CardTitle>Stripe Integration</CardTitle>
                <CardDescription>
                  Accept payments and manage subscriptions
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2'>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Subscription billing
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Webhook handling
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Payment security
                  </li>
                </ul>
              </CardContent>
            </Card>

            <Card className='border-0 shadow-lg hover:shadow-xl transition-shadow'>
              <CardHeader>
                <Rocket className='h-12 w-12 text-primary mb-4' />
                <CardTitle>Ready to Deploy</CardTitle>
                <CardDescription>
                  Deploy anywhere with one-click setup
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ul className='space-y-2'>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Vercel deployment
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    Environment configs
                  </li>
                  <li className='flex items-center'>
                    <CheckCircle className='h-4 w-4 text-green-500 mr-2' />
                    CI/CD pipeline
                  </li>
                </ul>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <PricingSection isLoggedIn={isLoggedIn} />

      {/* Testimonials Section */}
      <section id='testimonials' className='py-20 px-4'>
        <div className='container mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-4xl font-bold text-gray-900 mb-4'>
              Loved by Developers
            </h2>
            <p className='text-xl text-gray-600'>
              See what builders are saying about SaaS Starter
            </p>
          </div>

          <div className='grid md:grid-cols-3 gap-8'>
            <Card className='border-0 shadow-lg'>
              <CardContent className='pt-6'>
                <div className='flex mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className='h-4 w-4 text-yellow-400 fill-current'
                    />
                  ))}
                </div>
                <p className='text-gray-600 mb-4'>
                  "This starter saved me months of development time. Everything
                  I needed was already built and configured perfectly."
                </p>
                <div className='flex items-center'>
                  <div className='w-10 h-10 bg-gray-300 rounded-full mr-3'></div>
                  <div>
                    <p className='font-semibold text-gray-900'>Sarah Chen</p>
                    <p className='text-sm text-gray-500'>Founder, TechFlow</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-0 shadow-lg'>
              <CardContent className='pt-6'>
                <div className='flex mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className='h-4 w-4 text-yellow-400 fill-current'
                    />
                  ))}
                </div>
                <p className='text-gray-600 mb-4'>
                  "The code quality is exceptional. Clean, well-documented, and
                  follows all the best practices."
                </p>
                <div className='flex items-center'>
                  <div className='w-10 h-10 bg-gray-300 rounded-full mr-3'></div>
                  <div>
                    <p className='font-semibold text-gray-900'>
                      Michael Rodriguez
                    </p>
                    <p className='text-sm text-gray-500'>CTO, StartupCo</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card className='border-0 shadow-lg'>
              <CardContent className='pt-6'>
                <div className='flex mb-4'>
                  {[...Array(5)].map((_, i) => (
                    <Star
                      key={i}
                      className='h-4 w-4 text-yellow-400 fill-current'
                    />
                  ))}
                </div>
                <p className='text-gray-600 mb-4'>
                  "Finally, a SaaS starter that doesn't cut corners.
                  Authentication, payments, everything works flawlessly."
                </p>
                <div className='flex items-center'>
                  <div className='w-10 h-10 bg-gray-300 rounded-full mr-3'></div>
                  <div>
                    <p className='font-semibold text-gray-900'>Emily Johnson</p>
                    <p className='text-sm text-gray-500'>
                      Lead Developer, InnovateLab
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-primary text-white px-4'>
        <div className='container mx-auto text-center'>
          <h2 className='text-4xl font-bold mb-4'>
            Ready to Build Something Amazing?
          </h2>
          <p className='text-xl mb-8 opacity-90 max-w-2xl mx-auto'>
            Join thousands of developers who are building their SaaS faster with
            our starter kit.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            {isLoggedIn ? (
              <Button
                size='lg'
                variant='secondary'
                asChild
                className='text-lg px-8 py-6'
              >
                <Link href='/dashboard'>
                  Go to Dashboard
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Link>
              </Button>
            ) : (
              <Button
                size='lg'
                variant='secondary'
                asChild
                className='text-lg px-8 py-6'
              >
                <Link href='/sign-up'>
                  Start Your Free Trial
                  <ArrowRight className='ml-2 h-5 w-5' />
                </Link>
              </Button>
            )}
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12 px-4'>
        <div className='container mx-auto'>
          <div className='grid md:grid-cols-4 gap-8'>
            <div>
              <div className='flex items-center space-x-2 mb-4'>
                <Rocket className='h-6 w-6' />
                <span className='text-xl font-bold'>SaaS Starter</span>
              </div>
              <p className='text-gray-400'>
                The fastest way to build and launch your SaaS application.
              </p>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Product</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link
                    href='#features'
                    className='hover:text-white transition-colors'
                  >
                    Features
                  </Link>
                </li>
                <li>
                  <Link
                    href='#pricing'
                    className='hover:text-white transition-colors'
                  >
                    Pricing
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    Documentation
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Company</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    About
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    Blog
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    Contact
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Support</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    Help Center
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    Community
                  </Link>
                </li>
                <li>
                  <Link href='#' className='hover:text-white transition-colors'>
                    Status
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className='border-t border-gray-800 mt-8 pt-8 text-center text-gray-400'>
            <p>&copy; 2025 SaaS Starter. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}
