import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { redirect } from "next/navigation";
import DataChapterTable from "./DataChapterTable";
import { columns } from "./column";
import Link from "next/link";
import { buttonVariants } from "@/components/ui/Button";
import { cn } from "@/lib/utils";
import ForceSignOut from "@/components/ForceSignOut";

const page = async ({ params }: { params: { id: string } }) => {
  const session = await getAuthSession();
  if (!session) return <ForceSignOut />;
  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
  });
  if (!user) return <ForceSignOut />;

  const chapter = await db.chapter.findMany({
    where: {
      mangaId: +params.id,
      manga: {
        creatorId: user.id,
      },
    },
  });

  return !!chapter.length ? (
    <div className="flex flex-col">
      <Link
        href={`/me/manga/${params.id}/chapter/upload`}
        className={cn(
          buttonVariants({ variant: "outline" }),
          "self-end rounded-lg"
        )}
      >
        Thêm chapter
      </Link>
      <DataChapterTable columns={columns} data={chapter} />
    </div>
  ) : (
    <div className="flex h-full flex-col items-center justify-center gap-4">
      <p>Truyện chưa có chapter nào cả</p>
      <Link
        href={`/me/manga/${params.id}/chapter/upload`}
        className={buttonVariants()}
      >
        Thêm chapter
      </Link>
    </div>
  );
};

export default page;
