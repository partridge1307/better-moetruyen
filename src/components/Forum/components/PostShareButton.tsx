'use client';

import { Icons } from '@/components/Icons';
import { Button, buttonVariants } from '@/components/ui/Button';
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/Dialog';
import { serverDomain } from '@/config';
import { cn } from '@/lib/utils';
import { useClipboard } from '@mantine/hooks';
import { Check, Copy, Facebook, Share2 } from 'lucide-react';
import { FC } from 'react';
import {
  FacebookMessengerIcon,
  FacebookMessengerShareButton,
  FacebookShareButton,
  TelegramIcon,
  TelegramShareButton,
  TwitterShareButton,
} from 'react-share';

interface PostShareButtonProps {
  url: string;
  subForumSlug: string;
}

const PostShareButton: FC<PostShareButtonProps> = ({ url, subForumSlug }) => {
  const clipboard = useClipboard({ timeout: 500 });

  return (
    <Dialog>
      <DialogTrigger
        className={cn(
          buttonVariants({ variant: 'ghost' }),
          'flex items-center gap-2 rounded-xl'
        )}
      >
        <Share2 className="w-5 h-5" /> Chỉa sẻ
      </DialogTrigger>
      <DialogContent>
        <DialogTitle>Chia sẻ</DialogTitle>
        <div className="space-y-6">
          <div className="flex flex-wrap items-center gap-2">
            <FacebookShareButton
              url={`${serverDomain}${url}`}
              title={`${subForumSlug.split('-').join(' ')}`}
              hashtag="#Moetruyen"
            >
              <Facebook className="w-8 h-8" />
            </FacebookShareButton>
            <FacebookMessengerShareButton
              url={`${serverDomain}${url}`}
              title={`${subForumSlug.split('-').join(' ')}`}
              appId="1042446022855517"
            >
              <FacebookMessengerIcon size={'2rem'} round />
            </FacebookMessengerShareButton>
            <TwitterShareButton
              url={`${serverDomain}${url}`}
              title={`${subForumSlug.split('-').join(' ')}`}
              hashtags={['Moetruyen', `${subForumSlug.split('-').join('')}`]}
            >
              <Icons.twitterX className="w-8 h-8 dark:fill-white" />
            </TwitterShareButton>
            <TelegramShareButton
              url={`${serverDomain}${url}`}
              title={`${subForumSlug.split('-').join(' ')}`}
            >
              <TelegramIcon size={'2rem'} round />
            </TelegramShareButton>
          </div>

          <div className="grid grid-cols-[1fr_.1fr] items-center gap-2">
            <p className="truncate p-2 rounded-md dark:bg-zinc-800">
              {serverDomain}
              {url}
            </p>
            <Button onClick={() => clipboard.copy(`${serverDomain}${url}`)}>
              {clipboard.copied ? (
                <Check className="w-6 h-6" />
              ) : (
                <Copy className="w-6 h-6" />
              )}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default PostShareButton;
