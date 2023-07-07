import { db } from "@/lib/db";

export async function GET(req: Request, context: { params: { name: string } }) {
  try {
    const author = await db.mangaAuthor.findMany({
      where: {
        name: {
          contains: context.params.name,
          mode: "insensitive",
        },
      },
    });

    return new Response(JSON.stringify({ author: [...author] }), {
      status: 200,
    });
  } catch (error) {
    return new Response("Không thể tìm tên tác giả", { status: 500 });
  }
}
