'use client';

import { useCustomToast } from '@/hooks/use-custom-toast';
import { cn } from '@/lib/utils';
import type { Account } from '@prisma/client';
import { useMutation } from '@tanstack/react-query';
import axios, { AxiosError } from 'axios';
import { signIn } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { Icons } from '../Icons';
import { Button } from '../ui/Button';

interface LinkWithDiscordProps {
  account: Pick<Account, 'provider' | 'providerAccountId'>[];
}

const LinkWithDiscord: FC<LinkWithDiscordProps> = ({ account }) => {
  const { loginToast, serverErrorToast, successToast } = useCustomToast();
  const router = useRouter();

  const { mutate: Unlink, isLoading: isUnlinking } = useMutation({
    mutationFn: async () => {
      await axios.delete('/api/user');
    },
    onError: (err) => {
      if (err instanceof AxiosError) {
        if (err.response?.status === 401) return loginToast();
      }
      return serverErrorToast();
    },
    onSuccess: () => {
      router.refresh();

      return successToast();
    },
  });

  function onClickHandler(type: 'LINK' | 'UNLINK') {
    if (type === 'LINK') {
      signIn('discord');
    } else {
      Unlink();
    }
  }

  return (
    <div
      id="discord-link"
      className={cn('flex items-center gap-10 w-fit p-2 rounded-md', {
        'bg-green-900': account.length,
        'bg-red-900': !account.length,
      })}
    >
      <div className="flex items-center gap-2">
        <Icons.discord className="w-8 h-8 dark:fill-white" />
        <p>{!!account.length ? 'Đã liên kết' : 'Chưa liên kết'}</p>
      </div>
      <Button
        disabled={isUnlinking}
        isLoading={isUnlinking}
        onClick={() => onClickHandler(!!account.length ? 'UNLINK' : 'LINK')}
      >
        {!!account.length ? 'Gỡ' : 'Liên kết'}
      </Button>
    </div>
  );
};

export default LinkWithDiscord;
