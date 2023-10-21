const LeaderboardSkeletion = ({ length = 10 }: { length?: number }) => {
  return (
    <div className="space-y-2">
      <div className="inline-flex p-1 items-center rounded-md bg-primary-foreground">
        <p className="px-3 py-1.5 rounded-sm text-foreground bg-background">
          Manga
        </p>
        <p className="px-3 py-1.5 text-muted-foreground">Team</p>
      </div>

      <div className="w-full p-1 grid grid-cols-3 gap-2 items-center rounded-md bg-primary-foreground">
        <p className="px-3 py-1.5 inline-flex items-center justify-center rounded-sm text-foreground bg-background">
          Ngày
        </p>
        <p className="px-3 py-1.5 inline-flex items-center justify-center text-muted-foreground">
          Tuần
        </p>
        <p className="px-3 py-1.5 inline-flex items-center justify-center text-muted-foreground">
          Mọi lúc
        </p>
      </div>

      <div className="w-full space-y-3">
        {Array.from(Array(length).keys()).map((_, i) => (
          <div
            key={i}
            className="grid grid-cols-[.3fr_1fr] gap-4 rounded-md animate-pulse bg-primary-foreground"
          >
            <div style={{ aspectRatio: 5 / 7 }} />
          </div>
        ))}
      </div>
    </div>
  );
};

export default LeaderboardSkeletion;
