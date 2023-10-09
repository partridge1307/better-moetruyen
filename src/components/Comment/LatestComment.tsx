import { db } from '@/lib/db';

const LatestComment = async () => {
  const comments = await db.comment.findMany({
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
    select: {
      mangaId: true,
      chapterId: true,
      content: true,
    },
  });

  return <div>LatestComment</div>;
};

export default LatestComment;
