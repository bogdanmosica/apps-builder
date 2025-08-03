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
import { Separator } from '@workspace/ui/components/separator';
import {
  Eye,
  EyeOff,
  Github,
  Mail,
  Lock,
  ArrowRight,
  CheckCircle,
  AlertCircle,
  Loader2,
  Chrome,
} from 'lucide-react';
import Link from 'next/link';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';
import { triggerAuthRefresh } from '@/hooks/useAuth';

interface AuthFormProps {
  mode: 'signin' | 'signup' | 'forgot-password' | 'verify-email';
  onModeChange: (
    mode: 'signin' | 'signup' | 'forgot-password' | 'verify-email'
  ) => void;
}

export default function EnhancedAuth({ mode, onModeChange }: AuthFormProps) {
  const router = useRouter();
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
    firstName: '',
    lastName: '',
    acceptTerms: false,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const updateFormData = (field: string, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (mode !== 'forgot-password' && !formData.password) {
      newErrors.password = 'Password is required';
    } else if (mode !== 'forgot-password' && formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }

    if (mode === 'signup') {
      if (!formData.firstName) {
        newErrors.firstName = 'First name is required';
      }
      if (!formData.lastName) {
        newErrors.lastName = 'Last name is required';
      }
      if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
      if (!formData.acceptTerms) {
        newErrors.acceptTerms = 'You must accept the terms and conditions';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    setLoading(true);

    // Show loading toast
    const loadingToast = toast.loading(
      mode === 'signin'
        ? 'Signing you in...'
        : mode === 'signup'
          ? 'Creating your account...'
          : 'Sending reset link...'
    );

    try {
      if (mode === 'forgot-password') {
        // Handle forgot password
        await new Promise((resolve) => setTimeout(resolve, 2000)); // Simulate API call

        toast.dismiss(loadingToast);
        toast.success('Password reset link sent!', {
          description: 'Check your email for further instructions.',
        });

        // Switch to verify email mode
        onModeChange('verify-email');
        return;
      }

      const endpoint =
        mode === 'signin' ? '/api/auth/signin' : '/api/auth/signup';
      const payload =
        mode === 'signin'
          ? { email: formData.email, password: formData.password }
          : {
              firstName: formData.firstName,
              lastName: formData.lastName,
              email: formData.email,
              password: formData.password,
            };

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(payload),
      });

      const data = await response.json();

      if (!response.ok) {
        toast.dismiss(loadingToast);

        if (data.details) {
          // Handle validation errors
          const newErrors: Record<string, string> = {};
          data.details.forEach((error: any) => {
            newErrors[error.path[0]] = error.message;
          });
          setErrors(newErrors);
          toast.error('Please check the form for errors');
        } else {
          const errorMessage = data.error || 'An error occurred';
          setErrors({ general: errorMessage });
          toast.error(errorMessage);
        }
        return;
      }

      // Success
      toast.dismiss(loadingToast);
      
      // Trigger auth refresh for navigation component
      triggerAuthRefresh();
      
      // Check user role for appropriate redirect
      const userRole = data.user?.role || 'member';
      const isAdminUser = userRole === 'owner' || userRole === 'admin';
      
      toast.success(
        mode === 'signin'
          ? isAdminUser 
            ? 'Welcome back! Redirecting to your dashboard...'
            : 'Welcome back! Redirecting to your evaluations...'
          : isAdminUser
            ? 'Account created successfully! Redirecting to dashboard...'
            : 'Account created successfully! Redirecting to evaluations...'
      );

      // Small delay to show success message before redirect
      setTimeout(() => {
        if (isAdminUser) {
          router.push('/dashboard');
        } else {
          router.push('/'); // Redirect regular users to evaluations overview page
        }
      }, 1000);
    } catch (error) {
      console.error('Authentication error:', error);
      toast.dismiss(loadingToast);
      const errorMessage = 'Network error. Please try again.';
      setErrors({ general: errorMessage });
      toast.error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: string) => {
    setLoading(true);

    const loadingToast = toast.loading(`Connecting to ${provider}...`);

    try {
      // Simulate social login
      await new Promise((resolve) => setTimeout(resolve, 1500));

      toast.dismiss(loadingToast);
      toast.info(`${provider} login coming soon!`, {
        description: 'This feature is currently in development.',
      });
    } catch (error) {
      toast.dismiss(loadingToast);
      toast.error(`Failed to connect to ${provider}`);
    } finally {
      setLoading(false);
    }
  };

  const renderSignIn = () => (
    <>
      <CardHeader className='text-center pb-4'>
        <CardTitle className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent'>
          Welcome back
        </CardTitle>
        <CardDescription className='text-gray-600 dark:text-gray-400 mt-2'>
          Sign in to your account to continue
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {errors.general && (
          <div className='p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'>
            <p className='text-sm text-red-600 dark:text-red-400 flex items-center gap-2'>
              <AlertCircle className='w-4 h-4' />
              {errors.general}
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='Enter your email'
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              className={cn('', errors.email && 'border-destructive')}
            />
            {errors.email && (
              <p className='text-sm text-destructive flex items-center gap-1'>
                <AlertCircle className='w-4 h-4' />
                {errors.email}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <div className='flex items-center justify-between'>
              <Label htmlFor='password'>Password</Label>
              <button
                type='button'
                onClick={() => onModeChange('forgot-password')}
                className='text-sm text-primary hover:underline'
              >
                Forgot password?
              </button>
            </div>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Enter your password'
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                className={cn('', errors.password && 'border-destructive')}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                {showPassword ? (
                  <EyeOff className='w-4 h-4' aria-hidden='true' />
                ) : (
                  <Eye className='w-4 h-4' aria-hidden='true' />
                )}
              </button>
            </div>
            {errors.password && (
              <p className='text-sm text-destructive flex items-center gap-1'>
                <AlertCircle className='w-4 h-4' />
                {errors.password}
              </p>
            )}
          </div>

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                {mode === 'signin'
                  ? 'Signing in...'
                  : mode === 'signup'
                    ? 'Creating account...'
                    : 'Sending reset link...'}
              </>
            ) : (
              <>
                {mode === 'signin'
                  ? 'Sign In'
                  : mode === 'signup'
                    ? 'Create Account'
                    : 'Send Reset Link'}
                {mode !== 'forgot-password' && (
                  <ArrowRight className='w-4 h-4 ml-2' aria-hidden='true' />
                )}
                {mode === 'forgot-password' && (
                  <Mail className='w-4 h-4 ml-2' />
                )}
              </>
            )}
          </Button>
        </form>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <Separator className='w-full' aria-hidden='true' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <Button
            variant='outline'
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
          >
            <Chrome className='w-4 h-4 mr-2' aria-hidden='true' />
            Google
          </Button>
          <Button
            variant='outline'
            onClick={() => handleSocialLogin('github')}
            disabled={loading}
          >
            <Github className='w-4 h-4 mr-2' aria-hidden='true' />
            GitHub
          </Button>
        </div>

        <div className='text-center text-sm'>
          Don't have an account?{' '}
          <button
            onClick={() => onModeChange('signup')}
            className='text-primary hover:underline font-medium'
          >
            Sign up
          </button>
        </div>
      </CardContent>
    </>
  );

  const renderSignUp = () => (
    <>
      <CardHeader className='text-center pb-4'>
        <CardTitle className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent'>
          Create your account
        </CardTitle>
        <CardDescription className='text-gray-600 dark:text-gray-400 mt-2'>
          Get started with your free account today
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        {errors.general && (
          <div className='p-4 rounded-lg bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800'>
            <p className='text-sm text-red-600 dark:text-red-400 flex items-center gap-2'>
              <AlertCircle className='w-4 h-4' />
              {errors.general}
            </p>
          </div>
        )}
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='grid grid-cols-2 gap-4'>
            <div className='space-y-2'>
              <Label htmlFor='firstName'>First Name</Label>
              <Input
                id='firstName'
                placeholder='John'
                value={formData.firstName}
                onChange={(e) => updateFormData('firstName', e.target.value)}
                className={cn('', errors.firstName && 'border-destructive')}
              />
              {errors.firstName && (
                <p className='text-sm text-destructive'>{errors.firstName}</p>
              )}
            </div>
            <div className='space-y-2'>
              <Label htmlFor='lastName'>Last Name</Label>
              <Input
                id='lastName'
                placeholder='Doe'
                value={formData.lastName}
                onChange={(e) => updateFormData('lastName', e.target.value)}
                className={cn('', errors.lastName && 'border-destructive')}
              />
              {errors.lastName && (
                <p className='text-sm text-destructive'>{errors.lastName}</p>
              )}
            </div>
          </div>

          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='Enter your email'
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              className={cn('', errors.email && 'border-destructive')}
            />
            {errors.email && (
              <p className='text-sm text-destructive flex items-center gap-1'>
                <AlertCircle className='w-4 h-4' />
                {errors.email}
              </p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='password'>Password</Label>
            <div className='relative'>
              <Input
                id='password'
                type={showPassword ? 'text' : 'password'}
                placeholder='Create a password'
                value={formData.password}
                onChange={(e) => updateFormData('password', e.target.value)}
                className={cn('', errors.password && 'border-destructive')}
              />
              <button
                type='button'
                onClick={() => setShowPassword(!showPassword)}
                className='absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground'
              >
                {showPassword ? (
                  <EyeOff className='w-4 h-4' />
                ) : (
                  <Eye className='w-4 h-4' />
                )}
              </button>
            </div>
            {errors.password && (
              <p className='text-sm text-destructive'>{errors.password}</p>
            )}
          </div>

          <div className='space-y-2'>
            <Label htmlFor='confirmPassword'>Confirm Password</Label>
            <Input
              id='confirmPassword'
              type='password'
              placeholder='Confirm your password'
              value={formData.confirmPassword}
              onChange={(e) =>
                updateFormData('confirmPassword', e.target.value)
              }
              className={cn('', errors.confirmPassword && 'border-destructive')}
            />
            {errors.confirmPassword && (
              <p className='text-sm text-destructive'>
                {errors.confirmPassword}
              </p>
            )}
          </div>

          <div className='flex items-center space-x-2'>
            <input
              type='checkbox'
              id='acceptTerms'
              checked={formData.acceptTerms}
              onChange={(e) => updateFormData('acceptTerms', e.target.checked)}
              className='rounded'
            />
            <Label htmlFor='acceptTerms' className='text-sm'>
              I agree to the{' '}
              <Link href='/terms' className='text-primary hover:underline'>
                Terms of Service
              </Link>{' '}
              and{' '}
              <Link href='/privacy' className='text-primary hover:underline'>
                Privacy Policy
              </Link>
            </Label>
          </div>
          {errors.acceptTerms && (
            <p className='text-sm text-destructive'>{errors.acceptTerms}</p>
          )}

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Creating account...
              </>
            ) : (
              'Create Account'
            )}
          </Button>
        </form>

        <div className='relative'>
          <div className='absolute inset-0 flex items-center'>
            <Separator className='w-full' />
          </div>
          <div className='relative flex justify-center text-xs uppercase'>
            <span className='bg-background px-2 text-muted-foreground'>
              Or continue with
            </span>
          </div>
        </div>

        <div className='grid grid-cols-2 gap-4'>
          <Button
            variant='outline'
            onClick={() => handleSocialLogin('google')}
            disabled={loading}
          >
            <Chrome className='w-4 h-4 mr-2' aria-hidden='true' />
            Google
          </Button>
          <Button
            variant='outline'
            onClick={() => handleSocialLogin('github')}
            disabled={loading}
          >
            <Github className='w-4 h-4 mr-2' aria-hidden='true' />
            GitHub
          </Button>
        </div>

        <div className='text-center text-sm'>
          Already have an account?{' '}
          <button
            onClick={() => onModeChange('signin')}
            className='text-primary hover:underline font-medium'
          >
            Sign in
          </button>
        </div>
      </CardContent>
    </>
  );

  const renderForgotPassword = () => (
    <>
      <CardHeader className='text-center pb-4'>
        <CardTitle className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent'>
          Reset your password
        </CardTitle>
        <CardDescription className='text-gray-600 dark:text-gray-400 mt-2'>
          Enter your email address and we'll send you a reset link
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <form onSubmit={handleSubmit} className='space-y-4'>
          <div className='space-y-2'>
            <Label htmlFor='email'>Email</Label>
            <Input
              id='email'
              type='email'
              placeholder='Enter your email'
              value={formData.email}
              onChange={(e) => updateFormData('email', e.target.value)}
              className={cn('', errors.email && 'border-destructive')}
            />
            {errors.email && (
              <p className='text-sm text-destructive flex items-center gap-1'>
                <AlertCircle className='w-4 h-4' />
                {errors.email}
              </p>
            )}
          </div>

          <Button type='submit' className='w-full' disabled={loading}>
            {loading ? (
              <>
                <Loader2 className='w-4 h-4 mr-2 animate-spin' />
                Sending reset link...
              </>
            ) : (
              <>
                <Mail className='w-4 h-4 mr-2' />
                Send Reset Link
              </>
            )}
          </Button>
        </form>

        <div className='text-center text-sm'>
          Remember your password?{' '}
          <button
            onClick={() => onModeChange('signin')}
            className='text-primary hover:underline font-medium'
          >
            Sign in
          </button>
        </div>
      </CardContent>
    </>
  );

  const renderVerifyEmail = () => (
    <>
      <CardHeader className='text-center pb-4'>
        <div className='w-20 h-20 mx-auto mb-6 bg-gradient-to-br from-blue-100 to-indigo-100 dark:from-blue-900/30 dark:to-indigo-900/30 rounded-full flex items-center justify-center'>
          <Mail className='w-10 h-10 text-blue-600 dark:text-blue-400' />
        </div>
        <CardTitle className='text-3xl font-bold bg-gradient-to-r from-blue-600 to-indigo-600 dark:from-blue-400 dark:to-indigo-400 bg-clip-text text-transparent'>
          Check your email
        </CardTitle>
        <CardDescription className='text-gray-600 dark:text-gray-400 mt-2'>
          We've sent a verification link to {formData.email}
        </CardDescription>
      </CardHeader>
      <CardContent className='space-y-6'>
        <div className='text-center space-y-4'>
          <div className='p-4 bg-blue-50 dark:bg-blue-900/20 rounded-lg border border-blue-200 dark:border-blue-800'>
            <p className='text-sm text-blue-800 dark:text-blue-300'>
              Didn't receive the email? Check your spam folder or try again.
            </p>
          </div>

          <Button variant='outline' className='w-full border-blue-200 dark:border-blue-700 text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20'>
            Resend Verification Email
          </Button>

          <div className='text-sm text-gray-600 dark:text-gray-400'>
            Wrong email?{' '}
            <button
              onClick={() => onModeChange('signup')}
              className='text-blue-600 dark:text-blue-400 hover:underline font-medium'
            >
              Change email address
            </button>
          </div>
        </div>
      </CardContent>
    </>
  );

  return (
    <div className='min-h-screen flex items-center justify-center p-4 bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800'>
      <div className='w-full max-w-md'>
        <Card
          className={cn(
            'shadow-2xl border-0 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm',
            loading && 'opacity-75 pointer-events-none'
          )}
        >
          {mode === 'signin' && renderSignIn()}
          {mode === 'signup' && renderSignUp()}
          {mode === 'forgot-password' && renderForgotPassword()}
          {mode === 'verify-email' && renderVerifyEmail()}
        </Card>

        {/* Security Badge */}
        <div className='mt-6 text-center'>
          <Badge variant='secondary' className='text-xs bg-white/80 dark:bg-gray-800/80 text-gray-700 dark:text-gray-300 border-0'>
            <Lock className='w-3 h-3 mr-1' aria-hidden='true' />
            Your data is secure and encrypted
          </Badge>
        </div>
      </div>
    </div>
  );
}
