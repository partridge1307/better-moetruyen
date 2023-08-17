import { buttonVariants } from '@/components/ui/Button';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { Pen } from 'lucide-react';
import dynamic from 'next/dynamic';
import Link from 'next/link';
const TagDeleteButton = dynamic(
  () => import('@/components/Admin/TagDeleteButton'),
  { ssr: false }
);

const Page = async () => {
  const tags = await db.tag.findMany({
    orderBy: {
      category: 'asc',
    },
  });

  return (
    <div className="space-y-2 p-2 rounded-md dark:bg-zinc-900/70">
      <Link href="/manage/manga/tag/add" className={cn(buttonVariants())}>
        Add Tag
      </Link>
      <table className="w-full">
        <thead>
          <tr>
            <th className="text-start">Name</th>
            <th className="text-start">Description</th>
            <th className="text-start">Category</th>
          </tr>
        </thead>

        <tbody>
          {tags.length ? (
            tags.map((tag, idx) => (
              <tr key={idx}>
                <td className="px-1">{tag.name}</td>
                <td className="px-1">{tag.description}</td>
                <td className="px-1">{tag.category}</td>
                <td className="flex items-center gap-4">
                  <TagDeleteButton id={tag.id} />
                  <Link href={`/manage/manga/tag/${tag.id}`}>
                    <Pen className="w-5 h-5" />
                  </Link>
                </td>
              </tr>
            ))
          ) : (
            <tr>
              <td>Không có tags</td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
};

export default Page;
