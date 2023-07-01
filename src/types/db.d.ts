import { Chapter, DailyView, Manga, WeeklyView } from '@prisma/client';

export type ExtendedManga = Manga & {
  chapter: Chapter[];
  dailyView?: DailyView | null;
  weeklyView?: WeeklyView | null;
};
