import ProgressBarViewChapterSkeleton from './ProgressBarViewChapterSkeleton';
import VerticalViewChapterSkeleton from './VerticalViewChapterSkeleton';
import ViewChapterControllSkeleton from './ViewChapterControllSkeleton';

const ViewChapterSkeleton = () => {
  return (
    <>
      <ViewChapterControllSkeleton />
      <VerticalViewChapterSkeleton />
      <ProgressBarViewChapterSkeleton />
    </>
  );
};

export default ViewChapterSkeleton;
