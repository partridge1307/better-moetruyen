import dynamic from 'next/dynamic';
import { FC } from 'react';
const MoetruyenEditor = dynamic(
  () => import('@/components/Editor/MoetruyenEditor'),
  { ssr: false }
);

interface pageProps {}

const page: FC<pageProps> = ({}) => {
  return (
    <div className="pt-20 max-w-xl mx-auto">
      <MoetruyenEditor />
    </div>
  );
};

export default page;
