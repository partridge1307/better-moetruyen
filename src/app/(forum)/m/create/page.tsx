import dynamic from 'next/dynamic';

const CreateThreadForm = dynamic(
  () => import('@/components/Forum/CreateThreadForm'),
  { ssr: false }
);

const page = () => {
  return (
    <div className="rounded-md p-2 space-y-4 dark:bg-zinc-900/70">
      <h1 className="text-xl font-medium p-2">Tạo cộng đồng</h1>

      <hr className="dark:bg-zinc-700 rounded-full h-[2px]" />

      <CreateThreadForm />
    </div>
  );
};

export default page;
