import {
  serializedExcludeQuery,
  serializedIncludeQuery,
  serializedOrderByQuery,
} from '@/lib/advanced-search';
import { db } from '@/lib/db';
import type { Prisma } from '@prisma/client';
import { z } from 'zod';

const AdvancedSearchValidator = z.object({
  include: z.string().optional(),
  exclude: z.string().optional(),
  includeMode: z.enum(['or', 'and']),
  excludeMode: z.enum(['or', 'and']),
  sortBy: z
    .enum(['createdAt', 'name', 'mangaFollow', 'view'])
    .optional()
    .default('createdAt'),
  order: z.enum(['desc', 'asc']).optional().default('desc'),
  name: z.string().optional(),
  author: z.string().optional(),
  limit: z.string(),
  cursor: z.string().nullish().optional(),
});

export async function GET(req: Request) {
  const url = new URL(req.url);

  try {
    const {
      include,
      exclude,
      includeMode,
      excludeMode,
      order,
      sortBy,
      name,
      author,
      limit,
      cursor: userCursor,
    } = AdvancedSearchValidator.parse({
      include: url.searchParams.get('include') ?? undefined,
      exclude: url.searchParams.get('exclude') ?? undefined,
      includeMode: url.searchParams.get('includeMode'),
      excludeMode: url.searchParams.get('excludeMode'),
      sortBy: url.searchParams.get('sortBy') ?? undefined,
      order: url.searchParams.get('order') ?? undefined,
      name: url.searchParams.get('name') ?? undefined,
      author: url.searchParams.get('author') ?? undefined,
      limit: url.searchParams.get('limit'),
      cursor: url.searchParams.get('cursor'),
    });

    // Merge
    let whereQuery: Prisma.MangaWhereInput = {};

    // Where
    // Include tags
    const includeQuery = serializedIncludeQuery(include, includeMode);
    if (includeQuery && includeQuery.AND) {
      whereQuery.AND = [...includeQuery.AND];
    } else if (includeQuery && includeQuery.OR) {
      whereQuery.OR = [...includeQuery.OR];
    }

    // Exclude tags
    const excludeQuery = serializedExcludeQuery(exclude, excludeMode);
    if (excludeQuery && excludeQuery.AND) {
      whereQuery.AND = [...excludeQuery.AND];
    } else if (excludeQuery && excludeQuery.OR) {
      whereQuery.OR = [...excludeQuery.OR];
    }

    // Include Name
    !!name &&
      (whereQuery.name = {
        contains: name,
        mode: 'insensitive',
      });

    // Include author
    !!author &&
      (whereQuery.author = {
        some: {
          name: {
            contains: author,
            mode: 'insensitive',
          },
        },
      });

    const cursor = userCursor ? Number(userCursor) : undefined;
    let mangas;

    if (cursor) {
      mangas = await db.manga.findMany({
        where: whereQuery,
        orderBy: serializedOrderByQuery(sortBy, order),
        select: {
          id: true,
          slug: true,
          name: true,
          image: true,
          review: true,
          author: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              chapter: true,
            },
          },
        },
        take: parseInt(limit),
        skip: 1,
        cursor: {
          id: cursor,
        },
      });
    } else {
      mangas = await db.manga.findMany({
        where: whereQuery,
        orderBy: serializedOrderByQuery(sortBy, order),
        select: {
          id: true,
          slug: true,
          name: true,
          image: true,
          review: true,
          createdAt: true,
          author: {
            select: {
              name: true,
            },
          },
          _count: {
            select: {
              chapter: true,
            },
          },
        },
        take: parseInt(limit),
      });
    }

    return new Response(
      JSON.stringify({
        mangas,
        lastCursor:
          mangas.length === parseInt(limit)
            ? mangas[mangas.length - 1].id
            : undefined,
      })
    );
  } catch (error) {
    if (error instanceof z.ZodError) {
      return new Response('Invalid', { status: 422 });
    }

    return new Response('Something went wrong', { status: 500 });
  }
}
