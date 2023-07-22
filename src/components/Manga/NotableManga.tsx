'use client';

import '@/styles/swiper.css';
import type { ExtendedManga } from '@/types/db';
import Image from 'next/image';
import Link from 'next/link';
import { FC } from 'react';
import { Autoplay, EffectCoverflow, Navigation, Pagination } from 'swiper';
import 'swiper/css';
import 'swiper/css/effect-coverflow';
import 'swiper/css/navigation';
import type { SwiperProps } from 'swiper/react';
import { Swiper, SwiperSlide } from 'swiper/react';

interface NotableMangaProps extends SwiperProps {
  manga: ExtendedManga[];
}

const NotableManga: FC<NotableMangaProps> = ({ manga, ...props }) => {
  return (
    <Swiper
      modules={[EffectCoverflow, Pagination, Navigation, Autoplay]}
      centeredSlides
      loop
      navigation
      spaceBetween={10}
      slidesPerView={'auto'}
      effect={'coverflow'}
      autoplay={{ delay: 15 * 1000 }}
      coverflowEffect={{ rotate: 0, stretch: 0, depth: 100, modifier: 2.5 }}
      {...props}
    >
      {manga.map((m) => (
        <SwiperSlide key={m.id}>
          <div className="relative mx-auto h-full w-[90%]">
            <Image
              fill
              priority
              src={m.image}
              alt="Manga Image Notable Card"
              className="object-cover"
            />
            <Link href={`/manga/${m.id}`}>
              <div className="absolute bottom-0 flex min-h-full w-full items-end bg-gradient-to-t from-slate-100 to-transparent p-4 pb-10 dark:from-zinc-900">
                <div className="flex w-full items-center justify-between">
                  <div className="flex max-w-[50%] flex-col gap-x-5">
                    <div className="flex flex-wrap items-center gap-x-2 text-xl">
                      <p>{m.name}</p>
                      <span>•</span>
                      <p className="truncate">
                        {!!m.author &&
                          (m.author.length >= 3 ? (
                            <>
                              {m.author
                                .slice(0, 4)
                                .map((a) => a.name)
                                .join(', ')}{' '}
                              <span>+{m.author.length - 3}</span>
                            </>
                          ) : (
                            m.author.map((a) => a.name).join(', ')
                          ))}
                      </p>
                    </div>
                  </div>

                  <ul className="flex max-w-[30%] flex-wrap items-center gap-3 text-sm">
                    {!!m.tags &&
                      (m.tags.length >= 5 ? (
                        <>
                          {m.tags.slice(0, 6).map((t) => (
                            <li
                              key={t.id}
                              title={t.description}
                              className="rounded-full bg-slate-200 p-1 px-2 dark:bg-sky-700"
                            >
                              {t.name}
                            </li>
                          ))}
                          <li className="rounded-full bg-slate-200 p-1 px-2 dark:bg-sky-700">
                            +{m.tags.length - 5}
                          </li>
                        </>
                      ) : (
                        m.tags.map((t) => (
                          <li
                            key={t.id}
                            title={t.description}
                            className="rounded-full bg-slate-200 p-1 px-2 dark:bg-sky-700"
                          >
                            {t.name}
                          </li>
                        ))
                      ))}
                  </ul>
                </div>
              </div>
            </Link>
          </div>
        </SwiperSlide>
      ))}
    </Swiper>
  );
};

export default NotableManga;
