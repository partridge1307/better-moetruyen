const LastestMangaSkeleton = ({ length = 10 }: { length?: number }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 md:gap-6">
      {Array.from(Array(length).keys()).map((_, idx) => (
        <div
          key={idx}
          className="grid grid-cols-[.5fr_1fr] gap-2 rounded-md bg-primary-foreground"
        >
          <div style={{ aspectRatio: 5 / 7 }} />
        </div>
      ))}
    </div>
  );
};

export default LastestMangaSkeleton;
