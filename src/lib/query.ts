import { db } from './db';

export type Chapters = {
  volume: number;
  data: {
    id: number;
    name: string;
    index: number;
    isPublished: boolean;
    createdAt: string;
  }[];
}[];

export const mangaChapterGroupByVolume = (mangaId: number) =>
  db.$queryRaw`SELECT "volume", array_agg(json_build_object('id', "id", 'name', "name", 'index', "chapterIndex", 'isPublished', "isPublished", 'createdAt', "createdAt")) AS data FROM "Chapter" WHERE "mangaId" = ${mangaId} GROUP BY "volume" ORDER BY "volume" DESC` as Promise<Chapters>;

export type Tags = {
  category: string;
  data: {
    id: number;
    name: string;
    description: string;
  }[];
}[];
export const tagGroupByCategory = () =>
  db.$queryRaw`SELECT "category", array_agg(json_build_object('id', "id", 'name', "name", 'description', "description")) AS data FROM "Tag" GROUP BY "category"` as Promise<Tags>;

export type View = {
  time: number;
  view: number;
  viewTimeCreatedAt: Date[];
}[];
export const dailyViewGroupByHour = (mangaId: number) =>
  db.$queryRaw`SELECT DATE_PART('hour', "createdAt") as time, COUNT("id") as view, array_agg("createdAt") as "viewTimeCreatedAt" FROM "DailyView" WHERE "mangaId" = ${mangaId} GROUP BY DATE_PART('hour', "createdAt")` as Promise<View>;

export const weeklyViewGroupByDay = (mangaId: number) =>
  db.$queryRaw`SELECT DATE_PART('day', "createdAt") as time, COUNT("id") as view, array_agg("createdAt") as "viewTimeCreatedAt" FROM "WeeklyView" WHERE "mangaId" = ${mangaId} GROUP BY DATE_PART('day', "createdAt")` as Promise<View>;
