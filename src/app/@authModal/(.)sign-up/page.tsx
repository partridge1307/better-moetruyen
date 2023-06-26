import SignUp from '@/components/Auth/SignUp';
import CloseModal from '@/components/CloseModal';

const Page = () => {
  return (
    <div className="fixed inset-0 bg-zinc-900/30 z-10 flex items-center pt-14">
      <div className="container h-fit max-w-lg mx-auto">
        <div className="relative bg-zinc-700 w-full h-full py-7 px-2 rounded-lg space-y-14">
          <div className="absolute right-4">
            <CloseModal />
          </div>

          <SignUp />
        </div>
      </div>
    </div>
  );
};

export default Page;
