import { cn } from '@/lib/utils';

const CustomImage = ({ data }: { data: any }) => {
  return (
    <div>
      <div
        className={cn(
          'relative h-56 w-48 md:h-72 md:w-64 mx-auto flex justify-center items-center p-1',
          data.withBorder && 'border-2 rounded-md dark:border-zinc-600',
          data.withBorder && 'dark:bg-zinc-800'
        )}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          loading="lazy"
          width={150}
          height={150}
          src={data.url}
          alt={data.caption ? data.caption : 'Manga Description Image'}
          className={cn(
            'w-32 h-44 md:h-52 md:w-44',
            data.stretched && 'h-full w-full'
          )}
        />
      </div>
      {data.caption && <p className="text-center text-sm">{data.caption}</p>}
    </div>
  );
};

export default CustomImage;
