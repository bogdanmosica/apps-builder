'use client';

import { Badge } from '@workspace/ui/components/badge';
import { Button } from '@workspace/ui/components/button';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@workspace/ui/components/card';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import { Textarea } from '@workspace/ui/components/textarea';
import {
  Check,
  X,
  Star,
  ArrowRight,
  Zap,
  Shield,
  Users,
  BarChart3,
  Globe,
  Headphones,
} from 'lucide-react';
import { useState } from 'react';

const plans = [
  {
    name: 'Starter',
    price: 0,
    period: 'month',
    description: 'Perfect for getting started',
    features: [
      'Up to 3 projects',
      '5GB storage',
      'Community support',
      'Basic analytics',
    ],
    notIncluded: [
      'Advanced analytics',
      'Priority support',
      'Custom integrations',
      'Team collaboration',
    ],
    popular: false,
    cta: 'Get Started',
  },
  {
    name: 'Pro',
    price: 29,
    period: 'month',
    description: 'Everything you need to grow',
    features: [
      'Unlimited projects',
      '100GB storage',
      'Priority support',
      'Advanced analytics',
      'Team collaboration',
      'Custom integrations',
    ],
    notIncluded: ['White-label solution', 'Dedicated support'],
    popular: true,
    cta: 'Start Pro Trial',
  },
  {
    name: 'Enterprise',
    price: 99,
    period: 'month',
    description: 'For large-scale operations',
    features: [
      'Everything in Pro',
      'Unlimited storage',
      'White-label solution',
      'Dedicated support',
      'Custom development',
      'SLA guarantee',
      'Advanced security',
    ],
    notIncluded: [],
    popular: false,
    cta: 'Contact Sales',
  },
];

const testimonials = [
  {
    name: 'Sarah Chen',
    role: 'CTO, TechCorp',
    content:
      'This SaaS starter saved us months of development time. The code quality is excellent.',
    avatar: 'SC',
    rating: 5,
  },
  {
    name: 'Michael Rodriguez',
    role: 'Founder, StartupXYZ',
    content:
      'Amazing template with everything we needed. Great documentation and support.',
    avatar: 'MR',
    rating: 5,
  },
  {
    name: 'Emma Thompson',
    role: 'Product Manager, InnovateCo',
    content:
      'Clean, modern design with robust functionality. Highly recommended!',
    avatar: 'ET',
    rating: 5,
  },
];

const faqs = [
  {
    question: 'What payment methods do you accept?',
    answer:
      'We accept all major credit cards, PayPal, and bank transfers for enterprise plans.',
  },
  {
    question: 'Can I change my plan later?',
    answer:
      'Yes, you can upgrade or downgrade your plan at any time. Changes take effect immediately.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes, we offer a 14-day free trial for all paid plans. No credit card required.',
  },
  {
    question: 'Do you offer refunds?',
    answer:
      "We offer a 30-day money-back guarantee for all plans if you're not satisfied.",
  },
];

function PricingCard({
  plan,
  isAnnual,
}: {
  plan: (typeof plans)[0];
  isAnnual: boolean;
}) {
  const monthlyPrice = plan.price;
  const annualPrice = Math.floor(monthlyPrice * 12 * 0.8); // 20% discount
  const displayPrice = isAnnual ? Math.floor(annualPrice / 12) : monthlyPrice;
  const savings =
    isAnnual && monthlyPrice > 0 ? monthlyPrice * 12 - annualPrice : 0;

  return (
    <Card className={`relative ${plan.popular ? 'ring-2 ring-primary' : ''}`}>
      {plan.popular && (
        <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
          <Badge className='bg-primary text-primary-foreground'>
            Most Popular
          </Badge>
        </div>
      )}
      <CardHeader className='text-center'>
        <CardTitle className='text-2xl'>{plan.name}</CardTitle>
        <CardDescription>{plan.description}</CardDescription>
        <div className='mt-4'>
          <span className='text-4xl font-bold'>${displayPrice}</span>
          <span className='text-muted-foreground'>/{plan.period}</span>
          {isAnnual && savings > 0 && (
            <div className='text-sm text-green-600 mt-1'>
              Save ${savings}/year
            </div>
          )}
        </div>
      </CardHeader>
      <CardContent className='space-y-4'>
        <Button
          className='w-full'
          variant={plan.popular ? 'default' : 'outline'}
        >
          {plan.cta}
        </Button>
        <div className='space-y-2'>
          {plan.features.map((feature, index) => (
            <div key={index} className='flex items-center gap-2'>
              <Check className='h-4 w-4 text-green-500' />
              <span className='text-sm'>{feature}</span>
            </div>
          ))}
          {plan.notIncluded.map((feature, index) => (
            <div key={index} className='flex items-center gap-2'>
              <X className='h-4 w-4 text-muted-foreground' />
              <span className='text-sm text-muted-foreground'>{feature}</span>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function TestimonialCard({
  testimonial,
}: {
  testimonial: (typeof testimonials)[0];
}) {
  return (
    <Card>
      <CardContent className='pt-6'>
        <div className='flex items-center gap-1 mb-4'>
          {[...Array(testimonial.rating)].map((_, i) => (
            <Star key={i} className='h-4 w-4 fill-yellow-400 text-yellow-400' />
          ))}
        </div>
        <blockquote className='text-sm mb-4'>
          "{testimonial.content}"
        </blockquote>
        <div className='flex items-center gap-3'>
          <div className='h-10 w-10 rounded-full bg-primary flex items-center justify-center text-primary-foreground text-sm font-medium'>
            {testimonial.avatar}
          </div>
          <div>
            <div className='font-medium text-sm'>{testimonial.name}</div>
            <div className='text-xs text-muted-foreground'>
              {testimonial.role}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

function FAQItem({ faq }: { faq: (typeof faqs)[0] }) {
  const [isOpen, setIsOpen] = useState(false);

  return (
    <Card>
      <CardContent className='pt-6'>
        <button
          className='flex w-full items-center justify-between text-left'
          onClick={() => setIsOpen(!isOpen)}
        >
          <h3 className='font-medium'>{faq.question}</h3>
          <ArrowRight
            className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-90' : ''}`}
          />
        </button>
        {isOpen && (
          <div className='mt-3 text-sm text-muted-foreground'>{faq.answer}</div>
        )}
      </CardContent>
    </Card>
  );
}

export default function EnhancedPricing() {
  const [isAnnual, setIsAnnual] = useState(false);

  return (
    <div className='min-h-screen bg-background'>
      {/* Hero Section */}
      <section className='py-20 px-4'>
        <div className='max-w-7xl mx-auto text-center'>
          <h1 className='text-4xl font-bold tracking-tight sm:text-6xl mb-6'>
            Simple, transparent pricing
          </h1>
          <p className='text-xl text-muted-foreground mb-8 max-w-2xl mx-auto'>
            Choose the perfect plan for your needs. Upgrade or downgrade at any
            time.
          </p>

          {/* Billing Toggle */}
          <div className='flex items-center justify-center gap-4 mb-12'>
            <span
              className={`text-sm ${!isAnnual ? 'font-medium' : 'text-muted-foreground'}`}
            >
              Monthly
            </span>
            <button
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                isAnnual ? 'bg-primary' : 'bg-muted'
              }`}
              onClick={() => setIsAnnual(!isAnnual)}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span
              className={`text-sm ${isAnnual ? 'font-medium' : 'text-muted-foreground'}`}
            >
              Annual
              <Badge variant='secondary' className='ml-2'>
                Save 20%
              </Badge>
            </span>
          </div>

          {/* Pricing Cards */}
          <div className='grid gap-8 md:grid-cols-3 max-w-5xl mx-auto'>
            {plans.map((plan) => (
              <PricingCard key={plan.name} plan={plan} isAnnual={isAnnual} />
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className='py-20 px-4 bg-muted/40'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold mb-4'>
              Everything you need to succeed
            </h2>
            <p className='text-xl text-muted-foreground'>
              Powerful features to help you build and scale your SaaS business.
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-2 lg:grid-cols-3'>
            {[
              {
                icon: Zap,
                title: 'Lightning Fast',
                description:
                  'Built for performance with modern technologies and best practices.',
              },
              {
                icon: Shield,
                title: 'Enterprise Security',
                description:
                  'Bank-level security with encryption, 2FA, and compliance features.',
              },
              {
                icon: Users,
                title: 'Team Collaboration',
                description:
                  'Work together seamlessly with role-based permissions and sharing.',
              },
              {
                icon: BarChart3,
                title: 'Advanced Analytics',
                description:
                  'Deep insights into your business with comprehensive reporting.',
              },
              {
                icon: Globe,
                title: 'Global CDN',
                description:
                  'Fast loading times worldwide with our distributed infrastructure.',
              },
              {
                icon: Headphones,
                title: '24/7 Support',
                description:
                  'Get help when you need it with our dedicated support team.',
              },
            ].map((feature) => (
              <Card key={feature.title} className='text-center'>
                <CardContent className='pt-6'>
                  <feature.icon className='h-12 w-12 mx-auto mb-4 text-primary' />
                  <h3 className='text-xl font-semibold mb-2'>
                    {feature.title}
                  </h3>
                  <p className='text-muted-foreground'>{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Testimonials */}
      <section className='py-20 px-4'>
        <div className='max-w-7xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold mb-4'>Loved by thousands</h2>
            <p className='text-xl text-muted-foreground'>
              See what our customers have to say about their experience.
            </p>
          </div>

          <div className='grid gap-8 md:grid-cols-3'>
            {testimonials.map((testimonial) => (
              <TestimonialCard
                key={testimonial.name}
                testimonial={testimonial}
              />
            ))}
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className='py-20 px-4 bg-muted/40'>
        <div className='max-w-3xl mx-auto'>
          <div className='text-center mb-16'>
            <h2 className='text-3xl font-bold mb-4'>
              Frequently asked questions
            </h2>
            <p className='text-xl text-muted-foreground'>
              Got questions? We've got answers.
            </p>
          </div>

          <div className='space-y-4'>
            {faqs.map((faq) => (
              <FAQItem key={faq.question} faq={faq} />
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className='py-20 px-4'>
        <div className='max-w-4xl mx-auto text-center'>
          <h2 className='text-3xl font-bold mb-4'>Ready to get started?</h2>
          <p className='text-xl text-muted-foreground mb-8'>
            Join thousands of companies already using our platform.
          </p>
          <div className='flex flex-col sm:flex-row gap-4 justify-center'>
            <Button size='lg' className='text-lg px-8'>
              Start Free Trial
            </Button>
            <Button size='lg' variant='outline' className='text-lg px-8'>
              Contact Sales
            </Button>
          </div>
          <p className='text-sm text-muted-foreground mt-4'>
            No credit card required • 14-day free trial • Cancel anytime
          </p>
        </div>
      </section>
    </div>
  );
}
