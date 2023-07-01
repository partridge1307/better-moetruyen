import SignIn from '@/components/Auth/SignIn';
import CloseModal from '@/components/CloseModal';

const Page = () => {
  return (
    <div className="fixed flex items-center inset-0 bg-white/30 dark:bg-zinc-900/30 z-20">
      <div className="container relative mx-auto h-3/4 bg-white dark:bg-zinc-800 max-w-2xl py-4 rounded-lg">
        <CloseModal className="absolute right-4 h-6 w-6 p-0 rounded-md" />
        <SignIn />
      </div>
    </div>
  );
};

export default Page;
