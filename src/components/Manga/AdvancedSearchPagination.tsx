'use client';

import { FC } from 'react';
import { Button } from '../ui/Button';
import { useRouter } from 'next/navigation';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface AdvancedSearchPaginationProps {
  page: number;
  paginationQuery: string;
  mangaCount: number;
}

const AdvancedSearchPagination: FC<AdvancedSearchPaginationProps> = ({
  page,
  paginationQuery,
  mangaCount,
}) => {
  const router = useRouter();

  return (
    <div className="flex justify-center items-center gap-6">
      <Button
        disabled={!(page - 1 > 0)}
        onClick={() =>
          router.push(
            `/advanced-search?page=${page - 1}&${
              paginationQuery.charAt(0) === '&'
                ? paginationQuery.slice(1)
                : paginationQuery
            }`
          )
        }
      >
        <ChevronLeft />
      </Button>
      <p>
        {page}/{Math.ceil(mangaCount / 10)}
      </p>
      <Button
        disabled={page * 10 > mangaCount}
        onClick={() =>
          router.push(
            `/advanced-search?page=${page + 1}&${
              paginationQuery.charAt(0) === '&'
                ? paginationQuery.slice(1)
                : paginationQuery
            }`
          )
        }
      >
        <ChevronRight />
      </Button>
    </div>
  );
};

export default AdvancedSearchPagination;
