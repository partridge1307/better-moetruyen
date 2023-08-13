import { ImageResponse } from 'next/server';

export const runtime = 'edge';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/webp';

export default async function Image() {
  return new ImageResponse(
    (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src="https://i.moetruyen.net/chapter/2/1/2.webp"
        alt="dhawda"
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
