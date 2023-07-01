import ChapterUpload from '@/components/Manage/ChapterUpload';

const page = ({ params }: { params: { id: string } }) => {
  return <ChapterUpload id={params.id} />;
};

export default page;
