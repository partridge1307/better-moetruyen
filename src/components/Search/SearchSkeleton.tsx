const SearchSkeleton = () => {
  return (
    <div className="mt-6 space-y-4">
      <div className="flex items-center gap-2">
        <div className="w-16 h-10 rounded animate-pulse dark:bg-zinc-800" />
        <div className="w-16 h-10 rounded animate-pulse dark:bg-zinc-800" />
      </div>

      <div className="mt-2">
        <div className="grid grid-cols-[.15fr_1fr] gap-4 p-2 px-4">
          <div className="h-24 rounded-md animate-pulse dark:bg-zinc-800" />
          <div className="w-full h-4 rounded-full animate-pulse dark:bg-zinc-800" />
        </div>

        <div className="grid grid-cols-[.15fr_1fr] gap-4 p-2 px-4">
          <div className="h-24 rounded-md animate-pulse dark:bg-zinc-800" />
          <div className="w-full h-4 rounded-full animate-pulse dark:bg-zinc-800" />
        </div>

        <div className="grid grid-cols-[.15fr_1fr] gap-4 p-2 px-4">
          <div className="h-24 rounded-md animate-pulse dark:bg-zinc-800" />
          <div className="w-full h-4 rounded-full animate-pulse dark:bg-zinc-800" />
        </div>

        <div className="grid grid-cols-[.15fr_1fr] gap-4 p-2 px-4">
          <div className="h-24 rounded-md animate-pulse dark:bg-zinc-800" />
          <div className="w-full h-4 rounded-full animate-pulse dark:bg-zinc-800" />
        </div>

        <div className="grid grid-cols-[.15fr_1fr] gap-4 p-2 px-4">
          <div className="h-24 rounded-md animate-pulse dark:bg-zinc-800" />
          <div className="w-full h-4 rounded-full animate-pulse dark:bg-zinc-800" />
        </div>
      </div>
    </div>
  );
};

export default SearchSkeleton;
