import TeamImage from '@/components/Team/TeamImage';
import { db } from '@/lib/db';
import { nFormatter } from '@/lib/utils';
import { Eye } from 'lucide-react';
import Link from 'next/link';

const All = async () => {
  const results = await db.team.findMany({
    orderBy: {
      totalView: 'desc',
    },
    take: 10,
    select: {
      id: true,
      image: true,
      name: true,
      totalView: true,
    },
  });

  return (
    <div className="space-y-3">
      {results.map((team, idx) => (
        <Link
          key={team.id}
          href={`/team/${team.id}`}
          className="flex items-start gap-4 p-2 rounded-l-full transition-colors hover:bg-primary-foreground"
        >
          <TeamImage
            team={team}
            sizes="(max-width: 640px) 10vw, 15vw"
            className="w-16 h-16"
          />
          <div className="space-y-1.5">
            <p
              className={`flex items-center gap-1.5 ${
                idx === 0 ? 'text-xl font-semibold text-red-500' : ''
              }`}
            >
              <span>{++idx}.</span>
              {team.name}
            </p>
            <span className="flex items-center gap-1.5">
              {nFormatter(team.totalView, 1)} <Eye className="w-4 h-4" />
            </span>
          </div>
        </Link>
      ))}
    </div>
  );
};

export default All;
