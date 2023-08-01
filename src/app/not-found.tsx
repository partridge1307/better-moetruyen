import Link from 'next/link';

const NotFound = () => {
  return (
    <div className="h-screen flex flex-col justify-center items-center">
      <p>Không tìm thấy nội dung yêu cầu</p>
      <Link href="/">
        <span className="underline underline-offset-2">Trở về trang chủ</span>
      </Link>
    </div>
  );
};

export default NotFound;
