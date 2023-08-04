import { db } from './db';

export type Chapters =
  | {
      volume: number;
      data: {
        id: number;
        name: string | null;
        index: number;
        isPublished: boolean;
        teamId: string | null;
        teamName: string | null;
        teamImage: string | null;
        createdAt: string;
      }[];
    }[]
  | null;

export const mangaChapterGroupByVolume = (mangaId: number) =>
  db.$queryRaw`SELECT "volume", array_agg(json_build_object('id', c."id", 'name', c."name", 'index', "chapterIndex", 'isPublished', "isPublished", 'teamId', t."id", 'teamName', t."name", 'teamImage', t."image", 'createdAt', c."createdAt")) AS data FROM "Chapter" c LEFT JOIN "Team" t ON t."id" = c."teamId" WHERE "mangaId" = ${mangaId} GROUP BY "volume" ORDER BY "volume" DESC` as Promise<Chapters>;

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

export type Manga = {
  id: number;
  name: string;
  image: string;
  createdAt: Date;
};
export const randomManga = (take: number) =>
  db.$queryRaw`SELECT "id", "name", "image", "createdAt" FROM "Manga" WHERE "isPublished" = true ORDER BY random() LIMIT ${take}` as Promise<
    Manga[]
  >;
