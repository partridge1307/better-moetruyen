import {
  Chapter,
  DailyView,
  Manga,
  MangaAuthor,
  Tag,
  WeeklyView,
} from '@prisma/client';

export type ExtendedManga = Manga & {
  chapter?: Chapter[];
  author?: MangaAuthor[];
  tags?: Tag[];
  dailyView?: DailyView | null;
  weeklyView?: WeeklyView | null;
};
