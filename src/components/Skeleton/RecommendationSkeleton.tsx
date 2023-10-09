const RecommendationSkeleton = ({ length = 10 }: { length?: number }) => {
  return (
    <div className="max-sm:flex max-sm:items-center max-sm:snap-x max-sm:snap-mandatory lg:grid lg:grid-cols-2 gap-6 overflow-auto rounded-md dark:bg-zinc-900/60">
      {Array.from(Array(length).keys()).map((_, i) => (
        <div
          key={i}
          className="max-sm:shrink-0 grid grid-cols-2 lg:grid-cols-[.5fr_1fr] gap-4 p-2 rounded-md animate-pulse bg-background"
        >
          <div className="max-sm:min-w-[8rem]" style={{ aspectRatio: 4 / 3 }} />
        </div>
      ))}
    </div>
  );
};

export default RecommendationSkeleton;
