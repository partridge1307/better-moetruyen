const NotFound = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <p>Không tìm thấy nội dung yêu cầu</p>
      <a href="/">
        <span className="underline underline-offset-2">Trở về trang chủ</span>
      </a>
    </div>
  );
};

export default NotFound;
