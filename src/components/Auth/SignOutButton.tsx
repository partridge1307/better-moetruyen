'use client';

import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/Button';
import { DropdownMenuItem } from '../ui/DropdownMenu';
import { signOut } from 'next-auth/react';

const SignOutButton = () => {
  return (
    <DropdownMenuItem
      className={cn(buttonVariants({ variant: 'destructive' }), 'w-full')}
      onClick={(e) => {
        e.preventDefault();
        return signOut({
          callbackUrl: `/`,
        });
      }}
    >
      Đăng xuất
    </DropdownMenuItem>
  );
};

export default SignOutButton;
