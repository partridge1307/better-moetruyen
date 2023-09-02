'use client';

import { buttonVariants } from '@/components/ui/Button';
import { cn } from '@/lib/utils';
import { Loader2, RefreshCcw } from 'lucide-react';
import { FC } from 'react';

interface RefetchButtonProps {
  refetch: () => void;
  isRefetching: boolean;
}

const RefetchButton: FC<RefetchButtonProps> = ({ refetch, isRefetching }) => {
  return (
    <div className="mt-20 mb-10 flex justify-end">
      <button
        onClick={() => refetch()}
        disabled={isRefetching}
        className={cn(buttonVariants(), 'flex items-center gap-1')}
      >
        {isRefetching ? (
          <>
            <Loader2 className="w-5 h-5 animate-spin" />
            Đang tải
          </>
        ) : (
          <>
            <RefreshCcw className="w-5 h-5" />
            Làm mới
          </>
        )}
      </button>
    </div>
  );
};

export default RefetchButton;
