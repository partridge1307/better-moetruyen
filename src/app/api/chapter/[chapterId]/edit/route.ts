import { EditChapterImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { ZodError, z } from 'zod';
import { zfd } from 'zod-form-data';

const chapterValidator = zfd.formData({
  images: zfd
    .repeatableOfType(
      zfd
        .file()
        .refine((file) => file.size < 4 * 1000 * 1000, 'Ảnh phải nhỏ hơn 4MB')
        .refine((file) => {
          return [
            'image/jpg',
            'image/jpeg',
            'image/png',
            'application/octet-stream',
          ].includes(file.type);
        }, 'Chỉ nhận định dạng .jpg, .png, .jpeg')
    )
    .refine((files) => files.length >= 1, 'Tối thiểu 1 ảnh'),
  chapterName: zfd
    .text(z.string().min(3, 'Tối thiểu 3 kí tự').max(256, 'Tối đa 256 kí tự'))
    .optional(),
  chapterIndex: zfd.numeric(z.number().min(0, 'Số thứ tự phải lớn hơn 0')),
  volume: zfd.numeric(z.number().min(1, 'Volume phải lớn hơn 0')),
});

export async function PATCH(
  req: NextRequest,
  context: { params: { chapterId: string } }
) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const { images, chapterIndex, chapterName, volume } =
      chapterValidator.parse(await req.formData());

    const [, manga] = await db.$transaction([
      db.user.findFirstOrThrow({
        where: {
          id: token.id,
        },
        select: {
          id: true,
        },
      }),
      db.manga.findFirstOrThrow({
        where: {
          creatorId: token.id,
          chapter: {
            some: {
              id: +context.params.chapterId,
            },
          },
        },
        select: {
          id: true,
          name: true,
          chapter: {
            select: {
              images: true,
            },
          },
        },
      }),
    ]);

    const edittedImages = await EditChapterImage(
      images.map((img, index) => ({ image: img, index })),
      manga.chapter[0].images,
      manga.id,
      chapterIndex
    );

    await db.chapter.update({
      where: {
        id: +context.params.chapterId,
      },
      data: {
        chapterIndex,
        name: chapterName,
        volume,
        images: edittedImages
          .sort((a, b) => a.index - b.index)
          .map((img) => img.url),
      },
    });

    return new Response('OK');
  } catch (error) {
    if (error instanceof ZodError) {
      return new Response(error.message, { status: 422 });
    }
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
