'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { FC } from 'react';
import { Button } from './ui/Button';
import { X } from 'lucide-react';

interface CloseModalProps extends React.HTMLAttributes<HTMLButtonElement> {}

const CloseModal: FC<CloseModalProps> = (props) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const visited = parseInt(searchParams.get('visited') ?? '1');

  return (
    <Button
      variant={'ghost'}
      size={'sm'}
      aria-label="close modal"
      onClick={() => {
        for (let i = 0; i < visited; i++) {
          router.back();
        }
      }}
      {...props}
    >
      <X />
    </Button>
  );
};

export default CloseModal;
