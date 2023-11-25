import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Moetruyen',
    short_name: 'Moetruyen',
    description:
      'Web đọc truyện tranh online tiện ích nhất được cập nhật liên tục mỗi ngày - Cùng tham gia đọc truyện và thảo luận tại Moetruyen',
    start_url: '/',
    background_color: '#27272A',
    theme_color: '#27272A',
    display: 'standalone',
    orientation: 'any',
    icons: [
      {
        src: '/static/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
        purpose: 'any',
      },
      {
        src: '/static/icon-320x320.png',
        sizes: '320x320',
        type: 'image/png',
      },
      {
        src: '/static/icon-520x520.png',
        sizes: '520x520',
        type: 'image/png',
      },
    ],
    screenshots: [
      {
        src: '/static/homepage.webp',
        sizes: '1535x720',
        type: 'image/webp',
      },
      {
        src: '/static/manga-info.webp',
        sizes: '1548x720',
        type: 'image/webp',
      },
    ],
  };
}
