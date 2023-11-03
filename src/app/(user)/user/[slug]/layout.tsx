const layout = ({
  children,
  userInfo,
}: {
  children: React.ReactNode;
  userInfo: React.ReactNode;
}) => {
  return (
    <main className="container max-sm:px-2 grid grid-cols-1 lg:grid-cols-[.6fr_1fr] gap-8 pb-4 mt-10">
      <section className="min-w-0 relative w-full">
        <div className="sticky top-2 p-2 rounded-md bg-primary-foreground">
          {children}
        </div>
      </section>
      <section className="p-2 rounded-md bg-primary-foreground">
        {userInfo}
      </section>
    </main>
  );
};

export default layout;
