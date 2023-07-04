'use client';

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
          <div className="relative w-[90%] h-full mx-auto">
            <Image
              fill
              priority
              src={m.image}
              alt="Manga Image Notable Card"
              className="object-cover"
            />
            <Link href={`/manga/${m.id}`}>
              <div className="absolute bottom-0 flex items-end w-full min-h-full p-4 pb-10 bg-gradient-to-t from-slate-100 dark:from-zinc-900 to-transparent">
                <div className="flex justify-between items-center w-full">
                  <div className="flex flex-col gap-x-5 max-w-[50%]">
                    <div className="flex flex-wrap gap-x-2 items-center text-xl">
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
                    <p className="truncate">{m.description}</p>
                  </div>

                  <ul className="text-sm flex items-center flex-wrap gap-3 max-w-[30%]">
                    {!!m.tags &&
                      (m.tags.length >= 5 ? (
                        <>
                          {m.tags.slice(0, 6).map((t) => (
                            <li
                              key={t.id}
                              title={t.description}
                              className="p-1 px-2 bg-slate-200 dark:bg-sky-700 rounded-full"
                            >
                              {t.name}
                            </li>
                          ))}
                          <li className="p-1 px-2 bg-slate-200 dark:bg-sky-700 rounded-full">
                            +{m.tags.length - 5}
                          </li>
                        </>
                      ) : (
                        m.tags.map((t) => (
                          <li
                            key={t.id}
                            title={t.description}
                            className="p-1 px-2 bg-slate-200 dark:bg-sky-700 rounded-full"
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
