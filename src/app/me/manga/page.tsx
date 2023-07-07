import DataMangaTable from "@/app/me/manga/DataMangaTable";
import ForceSignOut from "@/components/ForceSignOut";
import { getAuthSession } from "@/lib/auth";
import { db } from "@/lib/db";
import { columns } from "./column";

const page = async () => {
  const session = await getAuthSession();
  if (!session) return <ForceSignOut />;
  const user = await db.user.findFirst({
    where: {
      id: session.user.id,
    },
  });
  if (!user) return <ForceSignOut />;

  const manga = await db.user
    .findUnique({
      where: {
        id: user.id,
      },
    })
    .manga();

  return !!manga?.length ? (
    <DataMangaTable columns={columns} data={manga} />
  ) : (
    <div>Bạn chưa có manga nào. Hãy upload một bộ ngay thôi nhé</div>
  );
};

export default page;
