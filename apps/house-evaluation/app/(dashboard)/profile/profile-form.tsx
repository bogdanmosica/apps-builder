'use client';

import { useState } from 'react';
import { useActionState } from 'react';
import { Button } from '@workspace/ui/components/button';
import { Input } from '@workspace/ui/components/input';
import { Label } from '@workspace/ui/components/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@workspace/ui/components/select';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { Camera, Loader2 } from 'lucide-react';
import { USER_TYPE_OPTIONS } from '../../../lib/constants';
import { updateProfile } from './actions';
import { User } from '@/lib/db/schema';
import { ActionState } from '@/lib/auth/middleware';

interface ProfileFormProps {
  user: User;
}

export function ProfileForm({ user }: ProfileFormProps) {
  const [state, formAction, pending] = useActionState<ActionState, FormData>(
    updateProfile,
    { error: '' }
  );
  const [avatarUrl, setAvatarUrl] = useState(user.avatar || '');
  const [selectedUserType, setSelectedUserType] = useState(
    user.userType || 'tenant'
  );

  const handleAvatarChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      const url = URL.createObjectURL(file);
      setAvatarUrl(url);
    }
  };

  return (
    <form className='space-y-6' action={formAction}>
      {/* Avatar Section */}
      <div>
        <Label className='block text-sm font-medium text-gray-700'>
          Profile Picture
        </Label>
        <div className='mt-2 flex items-center space-x-4'>
          <Avatar className='h-16 w-16'>
            <AvatarImage src={avatarUrl} alt={user.name || ''} />
            <AvatarFallback className='text-lg'>
              {user.name
                ? user.name.charAt(0).toUpperCase()
                : user.email.charAt(0).toUpperCase()}
            </AvatarFallback>
          </Avatar>
          <div>
            <input
              type='file'
              id='avatar'
              name='avatar'
              accept='image/*'
              onChange={handleAvatarChange}
              className='hidden'
            />
            <Button
              type='button'
              variant='outline'
              onClick={() => document.getElementById('avatar')?.click()}
              className='flex items-center space-x-2'
            >
              <Camera className='h-4 w-4' />
              <span>Change Photo</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Basic Information */}
      <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
        <div>
          <Label
            htmlFor='name'
            className='block text-sm font-medium text-gray-700'
          >
            Full Name
          </Label>
          <div className='mt-1'>
            <Input
              id='name'
              name='name'
              type='text'
              defaultValue={user.name || ''}
              required
              maxLength={100}
              className='w-full'
            />
          </div>
        </div>

        <div>
          <Label
            htmlFor='email'
            className='block text-sm font-medium text-gray-700'
          >
            Email Address
          </Label>
          <div className='mt-1'>
            <Input
              id='email'
              name='email'
              type='email'
              defaultValue={user.email}
              required
              disabled
              className='w-full bg-gray-50'
            />
          </div>
        </div>
      </div>

      <div>
        <Label
          htmlFor='phone'
          className='block text-sm font-medium text-gray-700'
        >
          Phone Number
        </Label>
        <div className='mt-1'>
          <Input
            id='phone'
            name='phone'
            type='tel'
            defaultValue={user.phone || ''}
            maxLength={20}
            className='w-full'
            placeholder='+1 (555) 123-4567'
          />
        </div>
      </div>

      {/* User Type */}
      <div>
        <Label
          htmlFor='userType'
          className='block text-sm font-medium text-gray-700'
        >
          Account Type
        </Label>
        <div className='mt-1'>
          <Select
            name='userType'
            value={selectedUserType}
            onValueChange={setSelectedUserType}
          >
            <SelectTrigger className='w-full'>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {USER_TYPE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* Investor-specific fields */}
      {selectedUserType === 'investor' && (
        <div className='grid grid-cols-1 md:grid-cols-2 gap-6'>
          <div>
            <Label
              htmlFor='companyName'
              className='block text-sm font-medium text-gray-700'
            >
              Company Name
            </Label>
            <div className='mt-1'>
              <Input
                id='companyName'
                name='companyName'
                type='text'
                defaultValue={user.companyName || ''}
                maxLength={200}
                className='w-full'
                placeholder='Your company name'
              />
            </div>
          </div>

          <div>
            <Label
              htmlFor='investmentBudget'
              className='block text-sm font-medium text-gray-700'
            >
              Investment Budget
            </Label>
            <div className='mt-1'>
              <Input
                id='investmentBudget'
                name='investmentBudget'
                type='number'
                defaultValue={user.investmentBudget || ''}
                min='0'
                step='1000'
                className='w-full'
                placeholder='0'
              />
            </div>
          </div>
        </div>
      )}

      {state?.error && (
        <div className='text-red-500 text-sm'>{state.error}</div>
      )}

      {state?.success && (
        <div className='text-green-500 text-sm'>
          Profile updated successfully!
        </div>
      )}

      <div className='flex justify-end'>
        <Button
          type='submit'
          className='bg-blue-600 hover:bg-blue-700'
          disabled={pending}
        >
          {pending ? (
            <>
              <Loader2 className='animate-spin mr-2 h-4 w-4' />
              Saving...
            </>
          ) : (
            'Save Changes'
          )}
        </Button>
      </div>
    </form>
  );
}
