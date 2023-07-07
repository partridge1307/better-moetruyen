import { db } from "@/lib/db";
import { Prisma } from "@prisma/client";
import { getToken } from "next-auth/jwt";
import { NextRequest } from "next/server";

export async function PATCH(
  req: NextRequest,
  context: { params: { chapterId: string } }
) {
  try {
    const token = await getToken({ req });
    if (!token) return new Response("Unauthorized", { status: 401 });

    const user = await db.user.findFirstOrThrow({
      where: {
        id: token.id,
      },
    });

    const targetChapter = await db.chapter.findFirstOrThrow({
      where: {
        id: +context.params.chapterId,
        manga: {
          creatorId: user.id,
        },
      },
    });
    const manga = await db.manga.findFirst({
      where: {
        id: targetChapter.mangaId,
      },
    });
    if (!manga?.isPublished) return new Response("Forbidden", { status: 400 });

    await db.chapter.update({
      where: {
        id: targetChapter.id,
      },
      data: {
        isPublished: true,
      },
    });

    return new Response("OK");
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError) {
      if (error.code === "P2025") {
        return new Response("Not found", { status: 404 });
      }
    }
    return new Response("Something went wrong", { status: 500 });
  }
}
