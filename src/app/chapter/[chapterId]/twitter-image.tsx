import { db } from '@/lib/db';
import { ImageResponse } from 'next/server';

export const size = {
  width: 1200,
  height: 630,
};
export const contentType = 'image/webp';

export default async function Image({ params }: { params: { id: string } }) {
  const id = Number(params.id);
  const chapter = await db.chapter.findFirst({
    where: {
      id,
      isPublished: true,
      manga: {
        isPublished: true,
      },
    },
    select: {
      manga: {
        select: {
          image: true,
          name: true,
        },
      },
    },
  });

  return new ImageResponse(
    (
      <div tw="relative w-full h-full">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          tw="object-cover"
          src={chapter?.manga.image}
          alt={`${chapter?.manga.name} Image`}
        />
      </div>
    ),
    size
  );
}
