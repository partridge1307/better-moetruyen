import SignIn from '@/components/Auth/SignIn';
import CloseModal from '@/components/CloseModal';

const Page = () => {
  return (
    <main className="absolute inset-0 z-[9999] inline-flex justify-center items-center bg-background/40">
      <section className="container relative h-fit max-w-sm md:max-w-md lg:max-w-lg p-3 space-y-4 rounded-md dark:bg-zinc-900">
        <div className="flex items-center justify-end">
          <CloseModal />
        </div>

        <SignIn />
      </section>
    </main>
  );
};

export default Page;
