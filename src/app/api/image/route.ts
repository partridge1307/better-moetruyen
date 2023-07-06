import { upload } from '@/lib/discord';

export async function POST(req: Request) {
  try {
    const form = await req.formData();
    const imageBlob = form.get('file');
    const imageURL = await upload({ blobImage: imageBlob, retryCount: 5 });

    return new Response(imageURL, { status: 201 });
  } catch (error) {
    return new Response('Could not upload image', { status: 500 });
  }
}
