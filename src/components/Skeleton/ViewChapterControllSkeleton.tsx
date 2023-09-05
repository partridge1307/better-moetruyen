const ViewChapterControllSkeleton = () => {
  return (
    <div className="block space-y-8">
      <div className="block space-y-1">
        <div className="block h-6 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="block h-6 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>

      <div className="grid grid-cols-[1fr_.7fr_1fr] gap-2 lg:gap-6">
        <div className="block h-8 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="block h-8 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="block h-8 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>
    </div>
  );
};

export default ViewChapterControllSkeleton;
