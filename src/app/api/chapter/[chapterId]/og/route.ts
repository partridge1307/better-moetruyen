import { db } from '@/lib/db';
import sharp from 'sharp';

export async function GET(
  req: Request,
  context: { params: { chapterId: string } }
) {
  try {
    const target = await db.chapter.findFirstOrThrow({
      where: {
        id: +context.params.chapterId,
      },
      select: {
        manga: {
          select: {
            image: true,
          },
        },
      },
    });

    const blob = await fetch(target.manga.image).then((res) => res.blob());

    const image = sharp(await new Blob([blob]).arrayBuffer())
      .png()
      .toFormat('png')
      .toBuffer();

    return new Response(JSON.stringify(image));
  } catch (error) {
    return new Response('Not found', { status: 404 });
  }
}
