import { db } from './db';
import { generateSearchPhrase } from './utils';

export type Chapters =
  | {
      volume: number;
      data: {
        id: number;
        name: string | null;
        index: number;
        teamId: string | null;
        teamName: string | null;
        teamImage: string | null;
        createdAt: string;
      }[];
    }[]
  | null;

export const mangaChapterGroupByVolume = (mangaId: number) =>
  db.$queryRaw`SELECT "volume", array_agg(json_build_object('id', c."id", 'name', c."name", 'index', "chapterIndex", 'teamId', t."id", 'teamName', t."name", 'teamImage', t."image", 'createdAt', c."createdAt"::varchar)) AS data FROM "Chapter" c LEFT JOIN "Team" t ON t."id" = c."teamId" WHERE "mangaId" = ${mangaId} AND "isPublished" = true GROUP BY "volume" ORDER BY "volume" DESC` as Promise<Chapters>;

export type Tags = {
  category: string;
  data: {
    id: number;
    name: string;
    description: string;
  }[];
};
export const tagGroupByCategory = () =>
  db.$queryRaw`SELECT "category", array_agg(json_build_object('id', "id", 'name', "name", 'description', "description")) AS data FROM "Tag" GROUP BY "category"` as Promise<
    Tags[]
  >;

export type Manga = {
  id: number;
  slug: string;
  name: string;
  image: string;
  createdAt: Date;
};
export const randomManga = (take: number) =>
  db.$queryRaw`SELECT "id", "slug", "name", "image" FROM "Manga" WHERE "isPublished" = true ORDER BY random() LIMIT ${take}` as Promise<
    Manga[]
  >;

export type SearchMangaResult = {
  id: number;
  slug: string;
  name: string;
  image: string;
  review: string;
};
export const searchManga = ({
  searchPhrase,
  take,
  skip = 0,
}: {
  searchPhrase: string;
  take: number;
  skip?: number;
}): Promise<SearchMangaResult[]> => {
  const query = generateSearchPhrase(searchPhrase);

  return db.$queryRaw`SELECT "id", "slug", "name", "image", "review" FROM "Manga" WHERE to_tsvector('english', "name") @@ to_tsquery(${query}) AND "isPublished" = true LIMIT ${take} OFFSET ${skip}`;
};

export type SearchUserResult = {
  name: string;
  image: string;
  color: string;
};
export const searchUser = ({
  searchPhrase,
  take,
  skip = 0,
}: {
  searchPhrase: string;
  take: number;
  skip?: number;
}): Promise<SearchUserResult[]> => {
  const query = generateSearchPhrase(searchPhrase);

  return db.$queryRaw`SELECT "name", "image", "color" FROM "User" WHERE to_tsvector('english', "name") @@ to_tsquery(${query}) LIMIT ${take} OFFSET ${skip}`;
};

export type SearchForumResult = {
  slug: string;
  banner: string;
  title: string;
};
export const searchForum = ({
  searchPhrase,
  take,
  skip = 0,
}: {
  searchPhrase: string;
  take: number;
  skip?: number;
}): Promise<SearchForumResult[]> => {
  const query = generateSearchPhrase(searchPhrase);

  return db.$queryRaw`SELECT "slug", "banner", "title" FROM "SubForum" WHERE to_tsvector('english', "title") @@ to_tsquery(${query}) LIMIT ${take} OFFSET ${skip}`;
};

export type SearchMentionResult = {
  id: string;
  name: string;
};
export const searchMentionUser = ({
  searchPhrase,
  take,
}: {
  searchPhrase: string;
  take: number;
}): Promise<SearchMentionResult[]> => {
  const query = generateSearchPhrase(searchPhrase);

  return db.$queryRaw`SELECT "id", "name" FROM "User" WHERE to_tsvector('english', "name") @@ to_tsquery(${query}) LIMIT ${take}`;
};

export const countFTResult = (
  searchPhrase: string,
  type: 'Manga' | 'SubForum' | 'User'
): Promise<{ count: number }[]> => {
  const query = generateSearchPhrase(searchPhrase);

  if (type === 'Manga')
    return db.$queryRaw`SELECT COUNT(*)::int FROM "Manga" WHERE to_tsvector('english', "name") @@ to_tsquery(${query}) AND "isPublished" = true`;
  else if (type === 'SubForum')
    return db.$queryRaw`SELECT COUNT(*)::int FROM "SubForum" WHERE to_tsvector('english', "title") @@ to_tsquery(${query})`;
  return db.$queryRaw`SELECT COUNT(*)::int FROM "User" WHERE to_tsvector('english', "name") @@ to_tsquery(${query})`;
};
