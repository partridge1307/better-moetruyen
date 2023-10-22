const RecommendationSkeleton = ({ length = 10 }: { length?: number }) => {
  return (
    <div className="flex gap-4 overflow-hidden">
      {Array.from(Array(length).keys()).map((_, idx) => (
        <div key={idx} className="space-y-1.5">
          <div className="w-24 h-32 lg:w-36 lg:h-48 rounded-md animate-pulse bg-primary-foreground" />
          <div className="h-7 rounded-full animate-pulse bg-primary-foreground/80" />
        </div>
      ))}
    </div>
  );
};

export default RecommendationSkeleton;
