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
