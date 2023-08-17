import { db } from '@/lib/db';
import dynamic from 'next/dynamic';
import { notFound } from 'next/navigation';
import { FC } from 'react';
const TagModifier = dynamic(() => import('@/components/Admin/TagModifier'), {
  ssr: false,
});

interface pageProps {
  params: {
    id: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const tag = await db.tag.findFirst({
    where: {
      id: +params.id,
    },
  });
  if (!tag) return notFound();

  return (
    <div className="p-2 rounded-md dark:bg-zinc-900/70">
      <TagModifier tag={tag} />
    </div>
  );
};

export default page;
