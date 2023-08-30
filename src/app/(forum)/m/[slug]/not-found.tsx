const NotFound = () => {
  return (
    <div className="h-full flex flex-col justify-center items-center rounded-md dark:bg-zinc-900/70">
      <p>Không tìm thấy nội dung yêu cầu</p>
      <a href="/m">
        <span className="underline underline-offset-2">Trở về Feed</span>
      </a>
    </div>
  );
};

export default NotFound;
