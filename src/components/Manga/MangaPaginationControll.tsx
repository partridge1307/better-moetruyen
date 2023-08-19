'use client';

import { FC } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { cn } from '@/lib/utils';
import { buttonVariants } from '../ui/Button';

interface MangaPaginationControll {
  count: number;
  hasPrevPage: boolean;
  hasNextPage: boolean;
}

const MangaPaginationControll: FC<MangaPaginationControll> = ({
  count,
  hasPrevPage,
  hasNextPage,
}) => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const page = searchParams.get('page') ?? '1';
  const perPage = searchParams.get('per-page') ?? '10';

  return (
    <div className="flex justify-center items-center gap-6">
      <button
        disabled={!hasPrevPage}
        className={cn(buttonVariants())}
        onClick={() =>
          router.push(`/latest?page=${Number(page) - 1}&per-page=${perPage}`)
        }
      >
        <ChevronLeft />
      </button>

      <div>
        {page} / {Math.ceil(count / Number(perPage))}
      </div>

      <button
        disabled={!hasNextPage}
        className={cn(buttonVariants())}
        onClick={() =>
          router.push(`/latest?page=${Number(page) + 1}&per-page=${perPage}`)
        }
      >
        <ChevronRight />
      </button>
    </div>
  );
};

export default MangaPaginationControll;
