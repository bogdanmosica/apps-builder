import type { AvatarProps } from '@radix-ui/react-avatar';
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from '@workspace/ui/components/avatar';
import { Icons } from '@workspace/ui/components/icons';
import { JSX } from 'react';

interface UserAvatarProps extends AvatarProps {
  user: Record<string, unknown>;
}

export function UserAvatar({ user, ...props }: UserAvatarProps): JSX.Element {
  return (
    <Avatar {...props}>
      {user.image ? (
        <AvatarImage alt='Picture' src={user.image} />
      ) : (
        <AvatarFallback>
          <span className='sr-only'>{user.name}</span>
          <Icons.User className='h-4 w-4' />
        </AvatarFallback>
      )}
    </Avatar>
  );
}
