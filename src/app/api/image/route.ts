import { db } from '@/lib/db';
import { upload } from '@/lib/discord';
import { getToken } from 'next-auth/jwt';
import { NextRequest } from 'next/server';

export async function POST(req: NextRequest) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response('Unauthorized', { status: 401 });

    const user = await db.user.findFirst({
      where: {
        id: token.id,
      },
    });
    if (!user) return new Response('Unauthorized', { status: 401 });

    const form = await req.formData();
    const imageBlob = form.get('file');
    const imageURL = await upload({ blobImage: imageBlob, retryCount: 5 });

    return new Response(imageURL, { status: 201 });
  } catch (error) {
    return new Response('Could not upload image', { status: 500 });
  }
}
