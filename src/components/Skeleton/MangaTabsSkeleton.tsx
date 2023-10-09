import FBEmbedSkeleton from './FBEmbedSkeleton';

const MangaTabsSkeleton = ({ length = 12 }: { length?: number }) => {
  return (
    <div className="space-y-2">
      <div className="flex items-center w-fit p-1 gap-2 rounded-md bg-muted">
        <div className="w-20 h-9 rounded-md animate-pulse dark:bg-zinc-900" />
        <div className="w-16" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[.35fr_1fr] gap-6">
        <div className="space-y-6">
          <div className="w-full h-80 rounded-md animate-pulse dark:bg-zinc-900" />

          <FBEmbedSkeleton />

          <FBEmbedSkeleton />
        </div>

        <div>
          <div className="flex justify-end">
            <div className="flex justify-end items-center space-x-2 p-1 rounded-md bg-muted">
              <div className="w-12 h-9 rounded-md animate-pulse dark:bg-zinc-900" />
              <div className="w-12" />
            </div>
          </div>

          <div className="px-2 divide-y dark:divide-zinc-700">
            {Array.from(Array(length).keys()).map((_, i) => (
              <div key={i} className="grid grid-cols-[1fr_.3fr] gap-4 py-4">
                <div className="w-full h-16 -skew-x-12 animate-pulse dark:bg-zinc-900" />
                <div className="w-full h-16 -skew-x-12 animate-pulse dark:bg-zinc-900" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MangaTabsSkeleton;
