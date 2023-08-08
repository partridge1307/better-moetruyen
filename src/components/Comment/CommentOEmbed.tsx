import type { Prisma } from '@prisma/client';
import { FC, memo } from 'react';

interface CommentOEmbedProps {
  oEmbed:
    | (Prisma.JsonValue & {
        link: string;
        meta: {
          title?: string;
          description?: string;
          image: {
            url?: string;
          };
        };
      })
    | null;
}

const CommentOEmbed: FC<CommentOEmbedProps> = ({ oEmbed }) => {
  return (
    oEmbed && (
      <a
        href={oEmbed.link}
        target="_blank"
        className="flex items-center w-fit rounded-lg dark:bg-zinc-800"
      >
        {oEmbed.meta.image.url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            width={100}
            height={100}
            loading="lazy"
            src={oEmbed.meta.image.url}
            alt="OEmbed Image"
            className="w-24 h-24 rounded-l-lg object-cover"
          />
        )}

        <div className="flex flex-col overflow-clip space-y-1 max-w-sm md:max-w-md lg:max-w-lg px-3 md:px-4">
          <p className="moetruyen-editor-link line-clamp-1">
            {new URL(oEmbed.link).host}
          </p>

          <dl>
            {oEmbed.meta.title && (
              <dt className="line-clamp-2 font-medium">{oEmbed.meta.title}</dt>
            )}

            {oEmbed.meta.description && (
              <dd className="text-xs md:text-sm line-clamp-2">
                {oEmbed.meta.description}
              </dd>
            )}
          </dl>
        </div>
      </a>
    )
  );
};

export default memo(CommentOEmbed);
