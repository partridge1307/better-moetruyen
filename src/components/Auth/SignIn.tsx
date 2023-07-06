import Link from "next/link";
import UserSignInForm from "./UserSignInForm";

const SignIn = () => {
  return (
    <div className="container mx-auto flex h-full flex-col gap-24">
      <div className="text-center text-2xl font-semibold">
        <p>Moetruyen</p>
      </div>
      <div className="space-y-4">
        <UserSignInForm />
        <p className="text-center">
          Lần đầu tới Moetruyen?{" "}
          <Link href="/sign-up" className="underline underline-offset-4">
            Đăng ký
          </Link>
        </p>
      </div>
    </div>
  );
};

export default SignIn;
