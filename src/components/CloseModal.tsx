'use client';

import { X } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { Button } from './ui/Button';

interface CloseModalProps extends React.HTMLAttributes<HTMLButtonElement> {}

const CloseModal: FC<CloseModalProps> = (props) => {
  const router = useRouter();

  return (
    <Button onClick={() => router.back()} aria-label="close modal" {...props}>
      <X className="h-4 w-4" />
    </Button>
  );
};

export default CloseModal;
