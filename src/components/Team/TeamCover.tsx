import { cn } from '@/lib/utils';
import type { Team } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';

interface TeamCoverProps extends React.HTMLAttributes<HTMLImageElement> {
  team: Pick<Team, 'cover' | 'name'>;
  quality?: number;
  sizes?: string;
  priority?: boolean;
  loading?: 'eager' | 'lazy';
}

const TeamCover: FC<TeamCoverProps> = ({
  team,
  quality = 50,
  sizes = '(max-width: 640px) 55vw, 75vw',
  priority = true,
  loading = 'lazy',
  className,
  placeholder,
  ...props
}) => {
  return (
    <div className={cn('relative aspect-[2.39/1]', className)}>
      {team.cover ? (
        <Image
          fill
          loading={loading}
          quality={quality}
          sizes={sizes}
          priority={priority}
          src={team.cover}
          alt={`Ảnh nhóm ${team.name}`}
          className="object-cover rounded-md"
          {...props}
        />
      ) : (
        <div className="w-full h-full bg-background rounded-md" />
      )}
    </div>
  );
};

export default TeamCover;
