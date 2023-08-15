'use client';

import { useRouter } from 'next/navigation';
import { FC } from 'react';
import { Button } from './ui/Button';

interface CloseModalProps extends React.HTMLAttributes<HTMLButtonElement> {}

const CloseModal: FC<CloseModalProps> = (props) => {
  const router = useRouter();

  return (
    <Button
      onClick={() => {
        const history = window.history.state.tree;
        if (history.length > 1) router.back();
      }}
      aria-label="close modal"
      {...props}
    >
      Trở về
    </Button>
  );
};

export default CloseModal;
