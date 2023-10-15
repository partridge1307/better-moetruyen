import { db } from '@/lib/db';
import Link from 'next/link';
import MoetruyenEditorOutput from '../Editor/MoetruyenEditorOutput';

const LatestComment = async () => {
  const comments = await db.comment.findMany({
    where: {
      replyToId: null,
    },
    orderBy: {
      createdAt: 'desc',
    },
    take: 10,
    select: {
      id: true,
      content: true,
      manga: {
        select: {
          slug: true,
          id: true,
          name: true,
        },
      },
      chapter: {
        select: {
          id: true,
          chapterIndex: true,
        },
      },
    },
  });

  return (
    <div className="space-y-3">
      {comments.map((comment) => (
        <Link
          key={comment.id}
          href={
            comment.chapter?.id
              ? `/chapter/${comment.chapter.id}`
              : `/manga/${comment.manga.slug}`
          }
          className="block p-2 space-y-1.5 rounded-md dark:bg-zinc-900/60"
        >
          <div className="flex items-center gap-2 text-sm">
            <p className="line-clamp-1">{comment.manga.name}</p>
            {!!comment.chapter && (
              <>
                <span>-</span>
                <p className="shrink-0">Chapter {comment.chapter?.id}</p>
              </>
            )}
          </div>

          <div className="relative max-h-40 overflow-hidden">
            <MoetruyenEditorOutput id={comment.id} content={comment.content} />
            <div className="absolute inset-0" />
          </div>
        </Link>
      ))}
    </div>
  );
};

export default LatestComment;
