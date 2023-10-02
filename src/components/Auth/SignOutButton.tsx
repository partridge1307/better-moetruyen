'use client';

import { signOut } from 'next-auth/react';
import { Button, buttonVariants } from '../ui/Button';

const SignOutButton = () => {
  return (
    <Button
      type="button"
      className={buttonVariants({
        variant: 'destructive',
        className: 'w-full',
      })}
      onClick={() => {
        return signOut({
          callbackUrl: `/`,
        });
      }}
    >
      Đăng xuất
    </Button>
  );
};

export default SignOutButton;
