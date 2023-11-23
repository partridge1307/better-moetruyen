import { Book, Clock, Loader2, Tv, Users2, Wifi } from 'lucide-react';

const UserInfoSkeleton = () => {
  return (
    <>
      <div className="flex items-center space-x-2 text-sm opacity-75">
        <Loader2 className="w-5 h-5 animate-spin" />
        <Clock className="w-4 h-4" />
      </div>
      <div className="flex flex-wrap items-center space-x-4 md:space-x-6 text-lg md:text-base">
        <dl className="flex items-center space-x-1.5">
          <dt className="font-semibold">
            <Loader2 className="w-5 h-5 animate-spin" />
          </dt>
          <dd className="flex items-center gap-0.5 text-sm">
            <span className="max-sm:hidden">Manga</span>
            <Book className="w-4 h-4" />
          </dd>
        </dl>
        <dl className="flex items-center space-x-1.5">
          <dt className="font-semibold">
            <Loader2 className="w-5 h-5 animate-spin" />
          </dt>
          <dd className="flex items-center gap-0.5 text-sm">
            <span className="max-sm:hidden">Forum</span>
            <Tv className="w-4 h-4" />
          </dd>
        </dl>

        <dl className="flex items-center space-x-1.5">
          <dt className="font-semibold">
            <Loader2 className="w-5 h-5 animate-spin" />
          </dt>
          <dd className="flex items-center gap-0.5 text-sm">
            <span className="max-sm:hidden">Theo dõi</span>
            <Wifi className="rotate-45 w-4 h-4" />
          </dd>
        </dl>
        <dl className="flex items-center space-x-1.5">
          <dt className="font-semibold">
            <Loader2 className="w-5 h-5 animate-spin" />
          </dt>
          <dd className="flex items-center gap-1 text-sm">
            <span className="max-sm:hidden">Đang theo dõi</span>
            <Users2 className="w-5 h-5" />
          </dd>
        </dl>
      </div>
    </>
  );
};

export default UserInfoSkeleton;
