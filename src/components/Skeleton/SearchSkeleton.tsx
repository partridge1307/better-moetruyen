const SearchSkeleton = ({ length = 10 }: { length?: number }) => {
  return (
    <div className="mt-4">
      <div className="p-1 h-10 inline-flex items-center justify-center rounded-md bg-muted">
        <div className="w-20 h-9 rounded animate-pulse bg-background" />
        <div className="w-16 h-10 rounded animate-pulse bg-muted" />
        <div className="w-16 h-10 rounded animate-pulse bg-muted" />
      </div>

      <div className="mt-2 grid md:grid-cols-2 gap-4">
        {Array.from(Array(length).keys()).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[.5fr_1fr] lg:grid-cols-[.2fr_1fr] gap-4 p-2"
          >
            <div className="aspect-[5/7] rounded-md animate-pulse bg-muted" />
            <div className="space-y-2">
              <div className="w-full h-6 rounded-full animate-pulse bg-muted" />
              <div className="w-2/3 h-4 rounded-full animate-pulse bg-muted" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default SearchSkeleton;
