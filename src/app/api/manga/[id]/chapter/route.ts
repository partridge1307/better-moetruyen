import { UploadChapterImage } from '@/lib/contabo';
import { db } from '@/lib/db';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';
import { z } from 'zod';
import { zfd } from 'zod-form-data';

const chapterValidator = zfd.formData({
  images: zfd
    .repeatableOfType(
      zfd.json(
        z.object({
          image: zfd
            .file()
            .refine(
              (file) => file.size < 4 * 1000 * 1000,
              'Ảnh phải nhỏ hơn 4MB'
            )
            .refine(
              (file) =>
                ['image/jpg', 'image/png', 'image/jpeg'].includes(file.type),
              'Chỉ nhận định dạng .jpg, .png, .jpeg'
            ),
          index: z.number().min(0, 'Không hợp lệ'),
        })
      )
    )
    .refine((files) => files.length >= 1, 'Tối thiểu 1 ảnh'),
  volume: zfd.numeric(z.number().min(1, 'Số volume phải lớn hơn 0')),
  chapterIndex: zfd.numeric(z.number().min(0, 'Số thứ tự phải lớn hơn 0')),
  chapterName: zfd
    .text(z.string().min(3, 'Tối thiểu 3 kí tự').max(256, 'Tối đa 256 kí tự'))
    .optional(),
});

export async function POST(
  req: NextRequest,
  context: { params: { id: string } }
) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const { images, volume, chapterIndex, chapterName } =
      chapterValidator.parse(await req.formData());

    const [user, manga] = await db.$transaction([
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
          id: +context.params.id,
          creatorId: token.id,
        },
        select: {
          id: true,
          name: true,
        },
      }),
    ]);

    let index;
    if (chapterIndex === 0) {
      index = (
        await db.chapter.findFirst({
          where: {
            mangaId: manga.id,
          },
          orderBy: {
            chapterIndex: 'desc',
          },
          select: {
            chapterIndex: true,
          },
        })
      )?.chapterIndex;

      if (!index) index = 1;
      else index++;
    } else {
      index = chapterIndex;

      if (
        await db.chapter.findFirst({
          where: {
            mangaId: manga.id,
            chapterIndex: index,
          },
          select: {
            id: true,
          },
        })
      )
        return new Response('Forbidden', { status: 403 });
    }

    const uploadedImages = await UploadChapterImage(images, manga.id, index);

    const team = await db.memberOnTeam.findFirst({
      where: {
        userId: user.id,
      },
      select: {
        teamId: true,
      },
    });

    if (team) {
      await db.chapter.create({
        data: {
          chapterIndex: index,
          name: chapterName,
          volume,
          images: uploadedImages
            .sort((a, b) => a.index - b.index)
            .map((img) => img.url),
          manga: {
            connect: { id: manga.id },
          },
          team: {
            connect: { id: team.teamId },
          },
        },
      });
    } else {
      await db.chapter.create({
        data: {
          chapterIndex: index,
          name: chapterName,
          volume,
          images: uploadedImages
            .sort((a, b) => a.index - b.index)
            .map((img) => img.url),
          manga: {
            connect: { id: manga.id },
          },
        },
      });
    }

    return new Response('OK');
  } catch (error) {
    if (error instanceof z.ZodError)
      return new Response(error.message, { status: 422 });
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }
    return new Response('Không thể upload chapter', { status: 500 });
  }
}
