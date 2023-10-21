const LastActivityPostSkeletion = ({ length = 10 }: { length?: number }) => {
  return (
    <div className="space-y-2 md:space-y-3">
      {Array.from(Array(length).keys()).map((_, idx) => (
        <div
          key={idx}
          className="p-1 space-y-1.5 rounded-md bg-primary-foreground"
        >
          <p className="w-3/4 h-7 rounded-full animate-pulse bg-muted" />
          <p className="w-1/2 h-6 rounded-full animate-pulse bg-muted" />
        </div>
      ))}
    </div>
  );
};

export default LastActivityPostSkeletion;
