const NotableMangaSkeleton = () => {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[.3fr_1fr] rounded-md animate-pulse dark:bg-zinc-900">
      <div style={{ aspectRatio: 4 / 3 }} />
      <div className="max-sm:block hidden h-14" />
    </div>
  );
};

export default NotableMangaSkeleton;
