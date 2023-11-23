import { INFINITE_SCROLL_PAGINATION_RESULTS } from '@/config';
import { FC } from 'react';

interface UserFollowSkeletonProps {
  length?: number;
}

const UserFollowSkeleton: FC<UserFollowSkeletonProps> = ({
  length = INFINITE_SCROLL_PAGINATION_RESULTS,
}) => {
  return (
    <div className="grid md:grid-cols-3 gap-6">
      {Array.from(Array(length).keys()).map((_, idx) => (
        <div
          key={idx}
          className="h-44 rounded-md animate-pulse bg-background"
        />
      ))}
    </div>
  );
};

export default UserFollowSkeleton;
