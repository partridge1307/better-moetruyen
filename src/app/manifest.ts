import type { MetadataRoute } from 'next';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'Moetruyen',
    short_name: 'Moe',
    description:
      'Web đọc truyện tranh online tiện ích nhất được cập nhật liên tục mỗi ngày - Cùng tham gia đọc truyện và thảo luận tại Moetruyen',
    start_url: '/',
    theme_color: '#18181B',
    display: 'standalone',
    background_color: '#18181B',
    orientation: 'any',
    icons: [
      {
        src: '/static/favicon.ico',
        sizes: 'any',
        type: 'image/x-icon',
      },
      {
        src: '/static/icon.png',
        sizes: '512x512',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  };
}
