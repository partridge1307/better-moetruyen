const LastestMangaSkeleton = ({ length = 10 }: { length?: number }) => {
  return (
    <div className="space-y-3">
      {Array.from(Array(length).keys()).map((_, i) => (
        <div
          key={i}
          className="grid grid-cols-[.6fr_1fr] lg:grid-cols-[.3fr_1fr] p-2 rounded-md animate-pulse dark:bg-zinc-900"
        >
          <div style={{ aspectRatio: 4 / 3 }} />
        </div>
      ))}
    </div>
  );
};

export default LastestMangaSkeleton;
