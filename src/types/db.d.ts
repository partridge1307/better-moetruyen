import type {
  Chapter,
  DailyView,
  Manga,
  MangaAuthor,
  Tag,
  WeeklyView,
} from '@prisma/client';

export type ExtendedManga = Pick<Manga, 'id' | 'name' | 'image'> & {
  chapter?: Chapter[];
  author?: MangaAuthor[];
  tags?: Tag[];
  dailyView?: DailyView | null;
  weeklyView?: WeeklyView | null;
};
