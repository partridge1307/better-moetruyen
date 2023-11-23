import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import type { FC } from 'react';

interface UserForumSkeletonProps {
  length?: number;
}

const UserForumSkeleton: FC<UserForumSkeletonProps> = ({
  length = INFINITE_SCROLL_PAGINATION_RESULTS,
}) => {
  return (
    <div className="grid md:grid-cols-2 md:gap-6">
      {Array.from(Array(length).keys()).map((_, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[.5fr_1fr] gap-3 rounded-md animate-pulse bg-primary-foreground"
        >
          <div className="aspect-video" />
        </div>
      ))}
    </div>
  );
};

export default UserForumSkeleton;
