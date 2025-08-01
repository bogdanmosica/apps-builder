'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { ArrowRight, Star, Home } from 'lucide-react';
import Link from 'next/link';

export default function EvaluationRedirectPage() {
  const router = useRouter();

  return (
    <div className='min-h-screen bg-gray-50'>
      <div className='max-w-4xl mx-auto px-4 py-16'>
        <div className='text-center mb-8'>
          <div className='mx-auto w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mb-4'>
            <Star className='h-8 w-8 text-blue-600' />
          </div>
          <h1 className='text-3xl font-bold text-gray-900 mb-4'>
            Property Evaluation is Now Integrated
          </h1>
          <p className='text-lg text-gray-600 max-w-2xl mx-auto'>
            We've streamlined the property evaluation process! Quality ratings
            are now generated automatically when you add a new property.
          </p>
        </div>

        <div className='grid md:grid-cols-2 gap-8 mb-8'>
          <Card className='border-green-200 bg-green-50'>
            <CardHeader>
              <CardTitle className='flex items-center gap-2 text-green-800'>
                <Home className='h-5 w-5' />
                How It Works Now
              </CardTitle>
            </CardHeader>
            <CardContent className='space-y-3'>
              <div className='flex items-start gap-3'>
                <div className='w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5'>
                  1
                </div>
                <div>
                  <p className='font-medium text-green-800'>
                    Add Property Details
                  </p>
                  <p className='text-sm text-green-700'>
                    Fill in basic property information, location, and features
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <div className='w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5'>
                  2
                </div>
                <div>
                  <p className='font-medium text-green-800'>
                    Answer Quality Questions
                  </p>
                  <p className='text-sm text-green-700'>
                    Complete the integrated evaluation as part of the same form
                  </p>
                </div>
              </div>
              <div className='flex items-start gap-3'>
                <div className='w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-sm font-semibold mt-0.5'>
                  3
                </div>
                <div>
                  <p className='font-medium text-green-800'>
                    Get Instant Rating
                  </p>
                  <p className='text-sm text-green-700'>
                    Your property is listed with an automatic 1-5 star quality
                    rating
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Benefits of the New System</CardTitle>
            </CardHeader>
            <CardContent className='space-y-2'>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                <span className='text-sm'>Single streamlined process</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                <span className='text-sm'>
                  Automatic quality ratings for all properties
                </span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                <span className='text-sm'>Consistent evaluation standards</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                <span className='text-sm'>Better user experience</span>
              </div>
              <div className='flex items-center gap-2'>
                <div className='w-2 h-2 bg-blue-600 rounded-full'></div>
                <span className='text-sm'>
                  Ratings visible on all property listings
                </span>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className='text-center space-y-4'>
          <h2 className='text-xl font-semibold text-gray-900'>
            Ready to add your first property?
          </h2>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Link href='/properties/add'>
              <Button size='lg' className='flex items-center gap-2'>
                Add Property with Rating
                <ArrowRight className='h-4 w-4' />
              </Button>
            </Link>
            <Link href='/properties'>
              <Button variant='outline' size='lg'>
                View Existing Properties
              </Button>
            </Link>
          </div>
        </div>

        <div className='mt-12 p-4 bg-blue-50 rounded-lg border border-blue-200'>
          <h3 className='font-medium text-blue-900 mb-2'>
            For Property Owners & Investors
          </h3>
          <p className='text-sm text-blue-800'>
            The integrated evaluation ensures that every property in our system
            has a quality rating, making it easier for potential buyers and
            renters to make informed decisions. Your property's rating will be
            prominently displayed on listing cards and detail pages.
          </p>
        </div>
      </div>
    </div>
  );
}
