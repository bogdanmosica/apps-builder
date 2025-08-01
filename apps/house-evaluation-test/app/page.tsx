import { Button } from '@workspace/ui/components/button';
import {
  ArrowRight,
  Home,
  TrendingUp,
  Users,
  Star,
  MapPin,
  Calendar,
} from 'lucide-react';
import Link from 'next/link';
import Image from 'next/image';

export default function LandingPage() {
  return (
    <main className='min-h-screen'>
      {/* Navigation */}
      <nav className='border-b border-gray-200 bg-white/95 backdrop-blur-sm sticky top-0 z-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='flex justify-between items-center py-4'>
            <div className='flex items-center'>
              <Home className='h-8 w-8 text-blue-600' />
              <span className='ml-2 text-xl font-bold text-gray-900'>
                RoProperty
              </span>
            </div>
            <div className='hidden md:flex items-center space-x-8'>
              <Link
                href='/properties'
                className='text-gray-600 hover:text-gray-900'
              >
                Properties
              </Link>
              <Link
                href='#guides'
                className='text-gray-600 hover:text-gray-900'
              >
                Guides
              </Link>
              <Link
                href='#testimonials'
                className='text-gray-600 hover:text-gray-900'
              >
                Reviews
              </Link>
              <Link href='#about' className='text-gray-600 hover:text-gray-900'>
                About
              </Link>
            </div>
            <div className='flex items-center space-x-4'>
              <Link href='/sign-in'>
                <Button variant='ghost'>Sign In</Button>
              </Link>
              <Link href='/sign-up'>
                <Button>Get Started</Button>
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className='py-20 bg-gradient-to-br from-blue-50 to-indigo-100'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='lg:grid lg:grid-cols-12 lg:gap-8 items-center'>
            <div className='lg:col-span-6'>
              <h1 className='text-4xl font-bold text-gray-900 tracking-tight sm:text-5xl md:text-6xl'>
                Navigate Romania's
                <span className='block text-blue-600'>Real Estate Market</span>
              </h1>
              <p className='mt-6 text-xl text-gray-600 leading-8'>
                Whether you're buying your first home, investing in rental
                properties, or searching for the perfect rental, our platform
                connects you with opportunities and expertise in Romania's
                dynamic real estate market.
              </p>
              <div className='mt-8 flex flex-col sm:flex-row gap-4'>
                <Link href='/sign-up'>
                  <Button size='lg' className='w-full sm:w-auto'>
                    Start Exploring
                    <ArrowRight className='ml-2 h-5 w-5' />
                  </Button>
                </Link>
                <Link href='#properties'>
                  <Button
                    variant='outline'
                    size='lg'
                    className='w-full sm:w-auto'
                  >
                    View Properties
                  </Button>
                </Link>
              </div>

              {/* User Types */}
              <div className='mt-12 grid grid-cols-3 gap-4'>
                <div className='text-center'>
                  <div className='bg-green-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center'>
                    <Home className='h-6 w-6 text-green-600' />
                  </div>
                  <h3 className='text-sm font-medium text-gray-900'>Buyers</h3>
                  <p className='text-xs text-gray-500'>Find your dream home</p>
                </div>
                <div className='text-center'>
                  <div className='bg-blue-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center'>
                    <Users className='h-6 w-6 text-blue-600' />
                  </div>
                  <h3 className='text-sm font-medium text-gray-900'>Tenants</h3>
                  <p className='text-xs text-gray-500'>
                    Discover rental options
                  </p>
                </div>
                <div className='text-center'>
                  <div className='bg-purple-100 rounded-full p-3 w-12 h-12 mx-auto mb-2 flex items-center justify-center'>
                    <TrendingUp className='h-6 w-6 text-purple-600' />
                  </div>
                  <h3 className='text-sm font-medium text-gray-900'>
                    Investors
                  </h3>
                  <p className='text-xs text-gray-500'>Build your portfolio</p>
                </div>
              </div>
            </div>
            <div className='mt-12 lg:mt-0 lg:col-span-6'>
              <div className='relative'>
                <div className='bg-white rounded-lg shadow-xl p-8'>
                  <div className='flex items-center justify-between mb-4'>
                    <h3 className='text-lg font-semibold text-gray-900'>
                      Featured Property
                    </h3>
                    <span className='bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full'>
                      Available
                    </span>
                  </div>
                  <div className='aspect-video bg-gray-200 rounded-lg mb-4 flex items-center justify-center'>
                    <Home className='h-12 w-12 text-gray-400' />
                  </div>
                  <h4 className='font-semibold text-gray-900 mb-2'>
                    Modern Apartment in Bucharest
                  </h4>
                  <div className='flex items-center text-gray-600 mb-2'>
                    <MapPin className='h-4 w-4 mr-1' />
                    <span className='text-sm'>Herastrau, Bucharest</span>
                  </div>
                  <div className='flex justify-between items-center'>
                    <span className='text-2xl font-bold text-blue-600'>
                      €180,000
                    </span>
                    <span className='text-sm text-gray-500'>
                      3 bed • 2 bath • 95m²
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Properties Section */}
      <section id='properties' className='py-16 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              Featured Properties
            </h2>
            <p className='text-xl text-gray-600 max-w-3xl mx-auto'>
              Discover hand-picked properties across Romania's most desirable
              locations
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            {/* Property Card 1 */}
            <div className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'>
              <div className='aspect-video bg-gray-200 flex items-center justify-center'>
                <Home className='h-12 w-12 text-gray-400' />
              </div>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='bg-blue-100 text-blue-800 text-xs font-medium px-2 py-1 rounded-full'>
                    For Sale
                  </span>
                  <span className='text-lg font-bold text-blue-600'>
                    €250,000
                  </span>
                </div>
                <h3 className='font-semibold text-gray-900 mb-2'>
                  Luxury Villa in Cluj-Napoca
                </h3>
                <div className='flex items-center text-gray-600 mb-3'>
                  <MapPin className='h-4 w-4 mr-1' />
                  <span className='text-sm'>Gheorgheni, Cluj-Napoca</span>
                </div>
                <p className='text-gray-600 text-sm mb-4'>
                  Beautiful villa with garden, perfect for families looking for
                  space and comfort.
                </p>
                <div className='flex justify-between items-center text-sm text-gray-500'>
                  <span>4 bed • 3 bath</span>
                  <span>120m²</span>
                </div>
              </div>
            </div>

            {/* Property Card 2 */}
            <div className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'>
              <div className='aspect-video bg-gray-200 flex items-center justify-center'>
                <Home className='h-12 w-12 text-gray-400' />
              </div>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='bg-green-100 text-green-800 text-xs font-medium px-2 py-1 rounded-full'>
                    For Rent
                  </span>
                  <span className='text-lg font-bold text-green-600'>
                    €800/mo
                  </span>
                </div>
                <h3 className='font-semibold text-gray-900 mb-2'>
                  City Center Apartment
                </h3>
                <div className='flex items-center text-gray-600 mb-3'>
                  <MapPin className='h-4 w-4 mr-1' />
                  <span className='text-sm'>Old Town, Brasov</span>
                </div>
                <p className='text-gray-600 text-sm mb-4'>
                  Charming apartment in the heart of Brasov's historic center,
                  close to all amenities.
                </p>
                <div className='flex justify-between items-center text-sm text-gray-500'>
                  <span>2 bed • 1 bath</span>
                  <span>65m²</span>
                </div>
              </div>
            </div>

            {/* Property Card 3 */}
            <div className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'>
              <div className='aspect-video bg-gray-200 flex items-center justify-center'>
                <Home className='h-12 w-12 text-gray-400' />
              </div>
              <div className='p-6'>
                <div className='flex items-center justify-between mb-2'>
                  <span className='bg-purple-100 text-purple-800 text-xs font-medium px-2 py-1 rounded-full'>
                    Investment
                  </span>
                  <span className='text-lg font-bold text-purple-600'>
                    €150,000
                  </span>
                </div>
                <h3 className='font-semibold text-gray-900 mb-2'>
                  Renovation Opportunity
                </h3>
                <div className='flex items-center text-gray-600 mb-3'>
                  <MapPin className='h-4 w-4 mr-1' />
                  <span className='text-sm'>Central, Timisoara</span>
                </div>
                <p className='text-gray-600 text-sm mb-4'>
                  Great investment potential in upcoming area with high rental
                  demand.
                </p>
                <div className='flex justify-between items-center text-sm text-gray-500'>
                  <span>3 bed • 2 bath</span>
                  <span>85m²</span>
                </div>
              </div>
            </div>
          </div>

          <div className='text-center mt-12'>
            <Link href='/sign-up'>
              <Button size='lg'>
                View All Properties
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Success Stories */}
      <section className='py-16 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              Success Stories
            </h2>
            <p className='text-xl text-gray-600'>
              Real people, real results in Romanian real estate
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 gap-8'>
            <div className='bg-white rounded-lg p-8 shadow-md'>
              <div className='flex items-center mb-4'>
                <div className='bg-blue-100 rounded-full p-2 mr-4'>
                  <Users className='h-6 w-6 text-blue-600' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>
                    First-Time Buyers
                  </h3>
                  <p className='text-gray-600 text-sm'>Maria & Alexandru</p>
                </div>
              </div>
              <p className='text-gray-700 mb-4'>
                "We found our perfect first home in Bucharest within 3 weeks.
                The platform made it easy to compare properties and understand
                the buying process in Romania."
              </p>
              <div className='flex items-center text-sm text-gray-500'>
                <Calendar className='h-4 w-4 mr-1' />
                <span>Purchased in March 2024</span>
              </div>
            </div>

            <div className='bg-white rounded-lg p-8 shadow-md'>
              <div className='flex items-center mb-4'>
                <div className='bg-purple-100 rounded-full p-2 mr-4'>
                  <TrendingUp className='h-6 w-6 text-purple-600' />
                </div>
                <div>
                  <h3 className='font-semibold text-gray-900'>
                    Investment Success
                  </h3>
                  <p className='text-gray-600 text-sm'>David Chen</p>
                </div>
              </div>
              <p className='text-gray-700 mb-4'>
                "Built a portfolio of 5 rental properties in Cluj-Napoca. The
                market insights and investment guides helped me make informed
                decisions with great returns."
              </p>
              <div className='flex items-center text-sm text-gray-500'>
                <Calendar className='h-4 w-4 mr-1' />
                <span>Started investing in 2023</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section id='testimonials' className='py-16 bg-white'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              What Our Users Say
            </h2>
            <p className='text-xl text-gray-600'>
              Trusted by thousands across Romania
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-3 gap-8'>
            <div className='text-center'>
              <div className='flex justify-center mb-4'>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className='h-5 w-5 text-yellow-400 fill-current'
                  />
                ))}
              </div>
              <blockquote className='text-gray-700 mb-4'>
                "The best platform for finding rental properties in Bucharest.
                Clean interface, accurate listings, and helpful market
                insights."
              </blockquote>
              <div className='font-semibold text-gray-900'>Ana Popescu</div>
              <div className='text-gray-600 text-sm'>Tenant, Bucharest</div>
            </div>

            <div className='text-center'>
              <div className='flex justify-center mb-4'>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className='h-5 w-5 text-yellow-400 fill-current'
                  />
                ))}
              </div>
              <blockquote className='text-gray-700 mb-4'>
                "As a foreign investor, the educational content and market
                guides were invaluable. Made my first Romanian property purchase
                with confidence."
              </blockquote>
              <div className='font-semibold text-gray-900'>Marcus Weber</div>
              <div className='text-gray-600 text-sm'>Investor, Germany</div>
            </div>

            <div className='text-center'>
              <div className='flex justify-center mb-4'>
                {[...Array(5)].map((_, i) => (
                  <Star
                    key={i}
                    className='h-5 w-5 text-yellow-400 fill-current'
                  />
                ))}
              </div>
              <blockquote className='text-gray-700 mb-4'>
                "Excellent support throughout our home buying journey. The team
                understands the Romanian market and provides great advice."
              </blockquote>
              <div className='font-semibland text-gray-900'>Ioana & Mihai</div>
              <div className='text-gray-600 text-sm'>Buyers, Cluj-Napoca</div>
            </div>
          </div>
        </div>
      </section>

      {/* Guides Section */}
      <section id='guides' className='py-16 bg-gray-50'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='text-center mb-12'>
            <h2 className='text-3xl font-bold text-gray-900 mb-4'>
              Romanian Real Estate Guides
            </h2>
            <p className='text-xl text-gray-600'>
              Expert insights to help you make informed decisions
            </p>
          </div>

          <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8'>
            <article className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'>
              <div className='p-6'>
                <div className='bg-blue-100 rounded-full p-3 w-12 h-12 mb-4 flex items-center justify-center'>
                  <Home className='h-6 w-6 text-blue-600' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                  Buying vs. Renting in Romania
                </h3>
                <p className='text-gray-600 mb-4'>
                  Complete guide to help you decide whether buying or renting
                  makes more sense for your situation in Romania's current
                  market.
                </p>
                <Link
                  href='#'
                  className='text-blue-600 hover:text-blue-800 font-medium'
                >
                  Read Guide →
                </Link>
              </div>
            </article>

            <article className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'>
              <div className='p-6'>
                <div className='bg-green-100 rounded-full p-3 w-12 h-12 mb-4 flex items-center justify-center'>
                  <TrendingUp className='h-6 w-6 text-green-600' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                  Investment Guide for Beginners
                </h3>
                <p className='text-gray-600 mb-4'>
                  Learn the fundamentals of real estate investing in Romania,
                  from market analysis to financing options and legal
                  requirements.
                </p>
                <Link
                  href='#'
                  className='text-blue-600 hover:text-blue-800 font-medium'
                >
                  Read Guide →
                </Link>
              </div>
            </article>

            <article className='bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow'>
              <div className='p-6'>
                <div className='bg-purple-100 rounded-full p-3 w-12 h-12 mb-4 flex items-center justify-center'>
                  <MapPin className='h-6 w-6 text-purple-600' />
                </div>
                <h3 className='text-xl font-semibold text-gray-900 mb-3'>
                  Best Neighborhoods Guide
                </h3>
                <p className='text-gray-600 mb-4'>
                  Discover the most promising neighborhoods in Bucharest,
                  Cluj-Napoca, Timisoara, and other major Romanian cities.
                </p>
                <Link
                  href='#'
                  className='text-blue-600 hover:text-blue-800 font-medium'
                >
                  Read Guide →
                </Link>
              </div>
            </article>
          </div>

          <div className='text-center mt-12'>
            <Link href='/guides'>
              <Button variant='outline' size='lg'>
                View All Guides
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 bg-blue-600'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center'>
          <h2 className='text-3xl font-bold text-white mb-4'>
            Ready to Start Your Real Estate Journey?
          </h2>
          <p className='text-xl text-blue-100 mb-8 max-w-3xl mx-auto'>
            Join thousands of successful buyers, renters, and investors who
            trust our platform to navigate Romania's real estate market.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link href='/sign-up'>
              <Button
                size='lg'
                className='bg-white text-blue-600 hover:bg-gray-100 w-full sm:w-auto'
              >
                Get Started Free
                <ArrowRight className='ml-2 h-5 w-5' />
              </Button>
            </Link>
            <Link href='#properties'>
              <Button
                variant='outline'
                size='lg'
                className='text-white border-white hover:bg-white hover:text-blue-600 w-full sm:w-auto'
              >
                Browse Properties
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className='bg-gray-900 text-white py-12'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
          <div className='grid grid-cols-1 md:grid-cols-4 gap-8'>
            <div>
              <div className='flex items-center mb-4'>
                <Home className='h-8 w-8 text-blue-400' />
                <span className='ml-2 text-xl font-bold'>RoProperty</span>
              </div>
              <p className='text-gray-400'>
                Your trusted partner in Romanian real estate, connecting buyers,
                renters, and investors with their perfect properties.
              </p>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>For Users</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link href='/sign-up' className='hover:text-white'>
                    Sign Up
                  </Link>
                </li>
                <li>
                  <Link href='/properties' className='hover:text-white'>
                    Browse Properties
                  </Link>
                </li>
                <li>
                  <Link href='/guides' className='hover:text-white'>
                    Market Guides
                  </Link>
                </li>
                <li>
                  <Link href='/pricing' className='hover:text-white'>
                    Pricing
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Resources</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link href='/guides' className='hover:text-white'>
                    Investment Guides
                  </Link>
                </li>
                <li>
                  <Link href='/blog' className='hover:text-white'>
                    Market Blog
                  </Link>
                </li>
                <li>
                  <Link href='/testimonials' className='hover:text-white'>
                    Success Stories
                  </Link>
                </li>
                <li>
                  <Link href='/faq' className='hover:text-white'>
                    FAQ
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <h3 className='font-semibold mb-4'>Company</h3>
              <ul className='space-y-2 text-gray-400'>
                <li>
                  <Link href='/about' className='hover:text-white'>
                    About Us
                  </Link>
                </li>
                <li>
                  <Link href='/contact' className='hover:text-white'>
                    Contact
                  </Link>
                </li>
                <li>
                  <Link href='/privacy' className='hover:text-white'>
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link href='/terms' className='hover:text-white'>
                    Terms of Service
                  </Link>
                </li>
              </ul>
            </div>
          </div>
          <div className='border-t border-gray-800 mt-8 pt-8 text-center text-gray-400'>
            <p>&copy; 2025 RoProperty. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </main>
  );
}
