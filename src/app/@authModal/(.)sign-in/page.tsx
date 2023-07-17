import SignIn from '@/components/Auth/SignIn';
import CloseModal from '@/components/CloseModal';

const Page = () => {
  return (
    <div className="fixed inset-0 z-20 flex items-center bg-white/30 dark:bg-zinc-900/30">
      <div className="container relative mx-auto h-3/4 max-w-2xl rounded-lg bg-white py-4 dark:bg-zinc-800">
        <CloseModal className="absolute right-4 h-6 w-6 rounded-md p-0" />
        <SignIn />
      </div>
    </div>
  );
};

export default Page;
