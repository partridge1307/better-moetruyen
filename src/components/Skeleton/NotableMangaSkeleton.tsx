const NotableMangaSkeleton = () => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-[.3fr_1fr] p-2 max-sm:pb-10 rounded-md animate-pulse bg-background">
      <div style={{ aspectRatio: 4 / 3 }} />
      <div className="h-24" />
    </div>
  );
};

export default NotableMangaSkeleton;
