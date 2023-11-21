import { cn } from '@/lib/utils';
import type { Team } from '@prisma/client';
import Image from 'next/image';
import { FC } from 'react';

interface TeamImageProps extends React.HTMLAttributes<HTMLImageElement> {
  team: Pick<Team, 'image' | 'name'>;
  quality?: number;
  sizes?: string;
  priority?: boolean;
}

const TeamImage: FC<TeamImageProps> = ({
  team,
  quality = 40,
  sizes = '(max-width: 640px) 25vw, 35vw',
  priority = false,
  className,
  placeholder,
  ...props
}) => {
  return (
    <div className={cn('relative aspect-square', className)}>
      <Image
        fill
        quality={quality}
        sizes={sizes}
        priority={priority}
        src={team.image}
        alt={`Ảnh nhóm ${team.name}`}
        className="object-cover rounded-full"
        {...props}
      />
    </div>
  );
};

export default TeamImage;
