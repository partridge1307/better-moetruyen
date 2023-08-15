import { buttonVariants } from '@/components/ui/Button';
import { db } from '@/lib/db';
import { cn } from '@/lib/utils';
import { Pen } from 'lucide-react';
import Image from 'next/image';
import Link from 'next/link';

const Page = async () => {
  const badges = await db.badge.findMany();

  return (
    <ul className="p-2 rounded-md flex flex-col gap-4 max-h-full overflow-auto dark:bg-zinc-900/70">
      <li>
        <Link href="/manage/user/badge/add" className={cn(buttonVariants())}>
          Add Badge
        </Link>
      </li>
      {!!badges.length ? (
        badges.map((badge, idx) => (
          <li
            key={idx}
            className="flex justify-between items-center px-2 rounded-md dark:bg-zinc-800"
          >
            <div className="flex items-center gap-4">
              <Image
                width={40}
                height={40}
                src={badge.image}
                alt="Badge Icon"
              />
              <p>{badge.name}</p>
              <p>{JSON.stringify(badge.color)}</p>
              <p>{badge.description}</p>
            </div>
            <Link href={`/manage/user/badge/${badge.id}/edit`}>
              <Pen className="w-5 h-5" />
            </Link>
          </li>
        ))
      ) : (
        <li>Không có badge</li>
      )}
    </ul>
  );
};

export default Page;
