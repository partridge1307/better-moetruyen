const NotableMangaSkeleton = () => {
  return (
    <div className="grid md:grid-cols-[.2fr_1.1fr_.24fr] gap-6 mt-8">
      {Array.from(Array(3).keys()).map((_, idx) => (
        <div
          key={idx}
          className={`${
            idx !== 0 ? 'max-sm:hidden' : ''
          } p-2 grid grid-cols-[.5fr_1fr] md:grid-cols-[.3fr_1fr] gap-6 rounded-md animate-pulse bg-primary-foreground`}
        >
          <div style={{ aspectRatio: 5 / 7 }} />
          <div className="md:hidden" />
          <div className="md:hidden h-8" />
        </div>
      ))}
    </div>
  );
};

export default NotableMangaSkeleton;
