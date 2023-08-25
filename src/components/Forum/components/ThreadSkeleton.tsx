const ThreadSkeleton = () => {
  return (
    <div className="p-2 space-y-10">
      <div className="space-y-2">
        <label
          htmlFor="thumbnail-skeleton"
          className="text-sm font-medium leading-none"
        >
          Ảnh bìa (Nếu có)
        </label>
        <div
          id="thumbnail-skeleton"
          className="w-full pt-[56.25%] rounded-md animate-pulse dark:bg-zinc-900"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="title-skeleton"
          className="text-sm font-medium leading-none"
        >
          Tên cộng đồng
        </label>
        <div
          id="title-skeleton"
          className="w-full h-10 rounded-md animate-pulse dark:bg-zinc-900"
        />
      </div>

      <div className="space-y-2">
        <label
          htmlFor="canSend-skeleton"
          className="text-sm font-medium leading-none"
        >
          Cho phép người khác đăng bài
        </label>
        <div
          id="canSend-skeleton"
          className="w-full h-10 rounded-md animate-pulse dark:bg-zinc-900"
        />
      </div>
    </div>
  );
};

export default ThreadSkeleton;
