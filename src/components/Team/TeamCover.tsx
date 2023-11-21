import { cn } from '@/lib/utils';
import type { Team } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';

interface TeamCoverProps extends React.HTMLAttributes<HTMLImageElement> {
  team: Pick<Team, 'cover' | 'name'>;
  quality?: number;
  sizes?: string;
  priority?: boolean;
}

const TeamCover: FC<TeamCoverProps> = ({
  team,
  quality = 50,
  sizes = '(max-width: 640px) 45vw, 65vw',
  priority = true,
  className,
  placeholder,
  ...props
}) => {
  return (
    <div className={cn('relative aspect-[2.39/1]', className)}>
      {team.cover ? (
        <Image
          fill
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
