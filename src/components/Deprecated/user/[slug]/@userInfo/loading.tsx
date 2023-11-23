const loading = () => {
  return (
    <div className="space-y-2">
      <div className="flex justify-start items-center max-w-full w-fit overflow-auto gap-2 p-1 rounded-md bg-muted">
        <div className="w-16 h-8 rounded-md animate-pulse bg-background" />
        <div className="w-16 h-8 rounded-md animate-pulse dark:bg-zinc-700" />
        <div className="w-24 h-8 rounded-md animate-pulse dark:bg-zinc-700" />
        <div className="w-24 h-8 rounded-md animate-pulse dark:bg-zinc-700" />
      </div>

      <div className="space-y-4 max-h-[650px] overflow-hidden">
        <div className="w-full h-24 lg:h-28 rounded-md animate-pulse bg-background" />
        <div className="w-full h-24 lg:h-28 rounded-md animate-pulse bg-background" />
        <div className="w-full h-24 lg:h-28 rounded-md animate-pulse bg-background" />
        <div className="w-full h-24 lg:h-28 rounded-md animate-pulse bg-background" />
        <div className="w-full h-24 lg:h-28 rounded-md animate-pulse bg-background" />
        <div className="w-full h-24 lg:h-28 rounded-md animate-pulse bg-background" />
      </div>
    </div>
  );
};

export default loading;
