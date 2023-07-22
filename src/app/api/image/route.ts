import { db } from '@/lib/db';
import { upload } from '@/lib/discord';
import { Prisma } from '@prisma/client';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    await db.user.findFirstOrThrow({
      where: {
        id: token.id,
      },
      select: {
        id: true,
      },
    });

    const form = await req.formData();
    const imageBlob = form.get('file');
    const imageURL = await upload({ blobImage: imageBlob, retryCount: 5 });

    return new Response(imageURL, { status: 201 });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === 'P2025') {
        return new Response('Not found', { status: 404 });
      }
    }
    return new Response('Could not upload image', { status: 500 });
  }
}
