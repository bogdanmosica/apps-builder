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
import { Progress } from '@workspace/ui/components/progress';
import {
  CheckCircle,
  ArrowRight,
  Users,
  CreditCard,
  Settings,
  Rocket,
  Star,
  Play,
} from 'lucide-react';
import { useState } from 'react';

const onboardingSteps = [
  {
    id: 1,
    title: 'Welcome to SaaS Starter',
    description: "Let's get you set up with everything you need to succeed.",
    icon: Rocket,
    content: 'welcome',
  },
  {
    id: 2,
    title: 'Create Your Profile',
    description: 'Tell us about yourself and your company.',
    icon: Users,
    content: 'profile',
  },
  {
    id: 3,
    title: 'Choose Your Plan',
    description: 'Select the plan that best fits your needs.',
    icon: CreditCard,
    content: 'plan',
  },
  {
    id: 4,
    title: 'Customize Settings',
    description: 'Configure your preferences and integrations.',
    icon: Settings,
    content: 'settings',
  },
  {
    id: 5,
    title: "You're All Set!",
    description: 'Welcome to your new SaaS dashboard.',
    icon: CheckCircle,
    content: 'complete',
  },
];

const plans = [
  {
    name: 'Starter',
    price: 0,
    description: 'Perfect for getting started',
    features: ['Up to 3 projects', '5GB storage', 'Community support'],
  },
  {
    name: 'Pro',
    price: 29,
    description: 'Everything you need to grow',
    features: ['Unlimited projects', '100GB storage', 'Priority support'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: 99,
    description: 'For large-scale operations',
    features: ['Everything in Pro', 'Unlimited storage', 'Dedicated support'],
  },
];

interface OnboardingFlowProps {
  onComplete: () => void;
}

export default function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    company: '',
    role: '',
    plan: 'pro',
    notifications: true,
    newsletter: false,
  });

  const progress = (currentStep / onboardingSteps.length) * 100;

  const handleNext = () => {
    if (currentStep < onboardingSteps.length) {
      setCurrentStep(currentStep + 1);
    } else {
      onComplete();
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const renderStepContent = () => {
    const step = onboardingSteps[currentStep - 1];

    switch (step.content) {
      case 'welcome':
        return (
          <div className='text-center space-y-6'>
            <div className='w-20 h-20 mx-auto bg-primary/10 rounded-full flex items-center justify-center'>
              <Rocket className='w-10 h-10 text-primary' />
            </div>
            <div>
              <h2 className='text-3xl font-bold mb-4'>
                Welcome to SaaS Starter!
              </h2>
              <p className='text-lg text-muted-foreground max-w-md mx-auto'>
                We're excited to help you build something amazing. This quick
                setup will get you started in just a few minutes.
              </p>
            </div>
            <div className='flex items-center justify-center gap-4 text-sm text-muted-foreground'>
              <span className='flex items-center gap-1'>
                <CheckCircle className='w-4 h-4 text-green-500' />
                5-minute setup
              </span>
              <span className='flex items-center gap-1'>
                <CheckCircle className='w-4 h-4 text-green-500' />
                No credit card required
              </span>
              <span className='flex items-center gap-1'>
                <CheckCircle className='w-4 h-4 text-green-500' />
                Cancel anytime
              </span>
            </div>
          </div>
        );

      case 'profile':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold mb-2'>
                Tell us about yourself
              </h2>
              <p className='text-muted-foreground'>
                This helps us personalize your experience.
              </p>
            </div>
            <div className='space-y-4 max-w-md mx-auto'>
              <div className='grid grid-cols-2 gap-4'>
                <div className='space-y-2'>
                  <Label htmlFor='firstName'>First Name</Label>
                  <Input
                    id='firstName'
                    value={formData.firstName}
                    onChange={(e) =>
                      updateFormData('firstName', e.target.value)
                    }
                    placeholder='John'
                  />
                </div>
                <div className='space-y-2'>
                  <Label htmlFor='lastName'>Last Name</Label>
                  <Input
                    id='lastName'
                    value={formData.lastName}
                    onChange={(e) => updateFormData('lastName', e.target.value)}
                    placeholder='Doe'
                  />
                </div>
              </div>
              <div className='space-y-2'>
                <Label htmlFor='company'>Company Name</Label>
                <Input
                  id='company'
                  value={formData.company}
                  onChange={(e) => updateFormData('company', e.target.value)}
                  placeholder='Acme Inc.'
                />
              </div>
              <div className='space-y-2'>
                <Label htmlFor='role'>Your Role</Label>
                <select
                  id='role'
                  className='w-full px-3 py-2 border border-input bg-background rounded-md text-sm'
                  value={formData.role}
                  onChange={(e) => updateFormData('role', e.target.value)}
                >
                  <option value=''>Select your role</option>
                  <option value='founder'>Founder/CEO</option>
                  <option value='developer'>Developer</option>
                  <option value='designer'>Designer</option>
                  <option value='marketing'>Marketing</option>
                  <option value='sales'>Sales</option>
                  <option value='other'>Other</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'plan':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold mb-2'>Choose your plan</h2>
              <p className='text-muted-foreground'>
                You can always change this later.
              </p>
            </div>
            <div className='grid gap-4 max-w-4xl mx-auto md:grid-cols-3'>
              {plans.map((plan) => (
                <Card
                  key={plan.name}
                  className={`cursor-pointer transition-all hover:shadow-lg ${
                    formData.plan === plan.name.toLowerCase()
                      ? 'ring-2 ring-primary'
                      : ''
                  } ${plan.popular ? 'relative' : ''}`}
                  onClick={() =>
                    updateFormData('plan', plan.name.toLowerCase())
                  }
                >
                  {plan.popular && (
                    <div className='absolute -top-3 left-1/2 transform -translate-x-1/2'>
                      <Badge className='bg-primary text-primary-foreground'>
                        Most Popular
                      </Badge>
                    </div>
                  )}
                  <CardHeader className='text-center'>
                    <CardTitle>{plan.name}</CardTitle>
                    <div className='text-3xl font-bold'>
                      ${plan.price}
                      <span className='text-sm text-muted-foreground'>
                        /month
                      </span>
                    </div>
                    <CardDescription>{plan.description}</CardDescription>
                  </CardHeader>
                  <CardContent>
                    <ul className='space-y-2'>
                      {plan.features.map((feature, index) => (
                        <li key={index} className='flex items-center gap-2'>
                          <CheckCircle className='w-4 h-4 text-green-500' />
                          <span className='text-sm'>{feature}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>
        );

      case 'settings':
        return (
          <div className='space-y-6'>
            <div className='text-center'>
              <h2 className='text-2xl font-bold mb-2'>
                Customize your experience
              </h2>
              <p className='text-muted-foreground'>
                Configure your preferences to get the most out of our platform.
              </p>
            </div>
            <div className='space-y-6 max-w-md mx-auto'>
              <div className='space-y-4'>
                <h3 className='font-semibold'>Notification Preferences</h3>
                <div className='space-y-3'>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='notifications'
                      checked={formData.notifications}
                      onChange={(e) =>
                        updateFormData('notifications', e.target.checked)
                      }
                      className='rounded'
                    />
                    <Label htmlFor='notifications' className='text-sm'>
                      Email notifications for important updates
                    </Label>
                  </div>
                  <div className='flex items-center space-x-2'>
                    <input
                      type='checkbox'
                      id='newsletter'
                      checked={formData.newsletter}
                      onChange={(e) =>
                        updateFormData('newsletter', e.target.checked)
                      }
                      className='rounded'
                    />
                    <Label htmlFor='newsletter' className='text-sm'>
                      Subscribe to our newsletter
                    </Label>
                  </div>
                </div>
              </div>

              <div className='space-y-4'>
                <h3 className='font-semibold'>Quick Actions</h3>
                <div className='grid gap-3'>
                  <Button variant='outline' className='justify-start'>
                    <Users className='w-4 h-4 mr-2' />
                    Invite team members
                  </Button>
                  <Button variant='outline' className='justify-start'>
                    <Settings className='w-4 h-4 mr-2' />
                    Connect integrations
                  </Button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'complete':
        return (
          <div className='text-center space-y-6'>
            <div className='w-20 h-20 mx-auto bg-green-100 rounded-full flex items-center justify-center'>
              <CheckCircle className='w-10 h-10 text-green-600' />
            </div>
            <div>
              <h2 className='text-3xl font-bold mb-4'>You're all set!</h2>
              <p className='text-lg text-muted-foreground max-w-md mx-auto'>
                Welcome to your new dashboard, {formData.firstName}! You're
                ready to start building something amazing.
              </p>
            </div>

            <div className='grid gap-4 max-w-lg mx-auto'>
              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center gap-3'>
                    <Play className='w-5 h-5 text-primary' />
                    <div className='text-left'>
                      <div className='font-medium'>
                        Watch our getting started guide
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        5-minute video tutorial
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardContent className='pt-6'>
                  <div className='flex items-center gap-3'>
                    <Star className='w-5 h-5 text-primary' />
                    <div className='text-left'>
                      <div className='font-medium'>
                        Explore example projects
                      </div>
                      <div className='text-sm text-muted-foreground'>
                        See what others have built
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className='min-h-screen bg-background flex items-center justify-center p-4'>
      <Card className='w-full max-w-4xl'>
        <CardContent className='p-8'>
          {/* Progress Bar */}
          <div className='mb-8'>
            <div className='flex justify-between text-sm text-muted-foreground mb-2'>
              <span>
                Step {currentStep} of {onboardingSteps.length}
              </span>
              <span>{Math.round(progress)}% complete</span>
            </div>
            <Progress value={progress} className='h-2' />
          </div>

          {/* Step Indicators */}
          <div className='flex justify-center mb-8'>
            <div className='flex items-center gap-2'>
              {onboardingSteps.map((step, index) => (
                <div key={step.id} className='flex items-center'>
                  <div
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                      index + 1 < currentStep
                        ? 'bg-green-500 text-white'
                        : index + 1 === currentStep
                          ? 'bg-primary text-primary-foreground'
                          : 'bg-muted text-muted-foreground'
                    }`}
                  >
                    {index + 1 < currentStep ? (
                      <CheckCircle className='w-4 h-4' />
                    ) : (
                      index + 1
                    )}
                  </div>
                  {index < onboardingSteps.length - 1 && (
                    <div
                      className={`w-8 h-0.5 mx-1 ${
                        index + 1 < currentStep ? 'bg-green-500' : 'bg-muted'
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Step Content */}
          <div className='min-h-[400px] flex items-center'>
            {renderStepContent()}
          </div>

          {/* Navigation */}
          <div className='flex justify-between mt-8'>
            <Button
              variant='outline'
              onClick={handleBack}
              disabled={currentStep === 1}
            >
              Back
            </Button>
            <Button onClick={handleNext}>
              {currentStep === onboardingSteps.length
                ? 'Get Started'
                : 'Continue'}
              <ArrowRight className='w-4 h-4 ml-2' aria-hidden='true' />
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
