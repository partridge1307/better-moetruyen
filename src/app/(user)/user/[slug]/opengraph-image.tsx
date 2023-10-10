import { db } from '@/lib/db';
import { ImageResponse } from 'next/server';

export const alt = 'Thông tin người dùng';
export const contentType = 'image/png';

export default async function Image({ params }: { params: { slug: string } }) {
  const user = await db.user.findUnique({
    where: {
      name: params.slug.split('-').join(' '),
    },
    select: {
      image: true,
      banner: true,
      name: true,
    },
  });

  return new ImageResponse(
    (
      <div
        style={{
          position: 'relative',
          height: '100%',
          width: '100%',
          display: 'flex',
        }}
      >
        {!!user?.banner && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={user.banner}
            alt="Ảnh bìa"
            style={{
              position: 'absolute',
              top: 0,
              right: 0,
              bottom: 0,
              left: 0,
              filter: 'brightness(.3)',
              objectFit: 'cover',
            }}
          />
        )}

        <div
          style={{
            position: 'relative',
            width: '100%',
            display: 'flex',
            alignItems: 'center',
            WebkitAlignContent: 'center',
            justifyContent: 'center',
            WebkitJustifyContent: 'center',
            gap: '3rem',
          }}
        >
          {!!user?.image && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={user.image}
              alt="Ảnh đại diện"
              style={{
                width: '256px',
                height: '256px',
                objectFit: 'cover',
                borderRadius: 9999,
                WebkitBorderRadius: 9999,
              }}
            />
          )}
          <h1
            style={{
              fontWeight: 600,
              fontSize: 50,
              color: 'white',
            }}
          >
            {user?.name}
          </h1>
        </div>
      </div>
    ),
    {
      width: 1024,
      height: 576,
    }
  );
}
