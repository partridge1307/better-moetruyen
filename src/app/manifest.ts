export default function manifest() {
  return {
    name: 'Moetruyen',
    short_name: 'Moetruyen',
    description:
      'Web đọc truyện tranh online tiện ích nhất được cập nhật liên tục mỗi ngày - Cùng tham gia đọc truyện và thảo luận tại Moetruyen',
    start_url: '/',
    display: 'standalone',
    background_color: '#27272A',
    theme_color: '#27272A',
    categories: ['books', 'entertainment', 'magazines'],
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
        src: '/static/homescreen-wide.webp',
        sizes: '1280x720',
        type: 'image/webp',
        form_factor: 'wide',
        label: 'Desktop homescreen of Moetruyen',
      },
      {
        src: '/static/manga-wide.webp',
        sizes: '1280x720',
        type: 'image/webp',
        form_factor: 'wide',
        label: 'List of Manga Resources in Moetruyen',
      },
      {
        src: '/static/homescreen-narrow.webp',
        sizes: '750x1243',
        type: 'image/webp',
        label: 'Mobile homescreen of Moetruyen',
      },
      {
        src: '/static/manga-narrow.webp',
        sizes: '750x1242',
        type: 'image/webp',
        label: 'List of Manga Resources in Moetruyen',
      },
    ],
  };
}
