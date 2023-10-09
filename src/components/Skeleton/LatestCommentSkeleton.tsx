const LatestCommentSkeleton = ({ length = 10 }: { length?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from(Array(length).keys()).map((_, i) => (
        <div key={i} className="h-40 rounded-md animate-pulse bg-background" />
      ))}
    </div>
  );
};

export default LatestCommentSkeleton;
