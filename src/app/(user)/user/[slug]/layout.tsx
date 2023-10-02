const layout = ({
  children,
  userInfo,
}: {
  children: React.ReactNode;
  userInfo: React.ReactNode;
}) => {
  return (
    <main className="container max-sm:px-2 grid grid-cols-1 lg:grid-cols-[.6fr_1fr] items-start gap-8 mb-4">
      <section className="p-2 rounded-md dark:bg-zinc-900/60">
        {children}
      </section>

      <section className="p-2 rounded-md dark:bg-zinc-900/60">
        {userInfo}
      </section>
    </main>
  );
};

export default layout;
