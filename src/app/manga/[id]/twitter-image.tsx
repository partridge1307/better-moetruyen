import { ImageResponse } from 'next/server';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

export default async function Image({ params }: { params: { id: string } }) {
  const image = await fetch(`/api/manga/${params.id}/og`).then((res) =>
    res.json()
  );

  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={image}
        alt="Image"
        style={{
          width: '100%',
          height: '100%',
        }}
      />
    ),
    {
      ...size,
    }
  );
}
