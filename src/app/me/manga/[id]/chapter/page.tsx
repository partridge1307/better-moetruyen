import { db } from '@/lib/db';
import { FC } from 'react';

interface pageProps {
  params: {
    id: string;
  };
}

const page: FC<pageProps> = async ({ params }) => {
  const manga = await db.manga.findFirst({
    where: {
      id: +params.id,
    },
    include: {
      chapter: true,
    },
  });

  console.log(manga);

  return <div className="container h-full w-full pt-14">test</div>;
};

export default page;
