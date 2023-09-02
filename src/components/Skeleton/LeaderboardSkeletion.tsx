const LeaderboardSkeletion = () => {
  return (
    <div className="flex flex-col gap-2 items-start">
      <div className="inline-flex p-1 rounded-md dark:bg-zinc-900/60">
        <div className="w-20 h-9 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="w-16 h-9" />
      </div>

      <div className="w-full inline-flex p-1 rounded-md dark:bg-zinc-900/60">
        <div className="w-36 h-9 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="w-16 h-9" />
        <div className="w-16 h-9" />
      </div>

      <div className="w-full space-y-3">
        <div className="w-full h-16 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="w-full h-16 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="w-full h-16 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="w-full h-16 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="w-full h-16 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="w-full h-16 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="w-full h-16 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="w-full h-16 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="w-full h-16 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="w-full h-16 rounded-md animate-pulse dark:bg-zinc-900" />
      </div>
    </div>
  );
};

export default LeaderboardSkeletion;
