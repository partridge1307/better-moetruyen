import Navbar from "@/components/Navbar";
import Providers from "@/components/Providers";
import { Toaster } from "@/components/ui/Toaster";
import { cn } from "@/lib/utils";
import "@/styles/globals.css";
import type { Metadata } from "next";
import { Inter } from "next/font/google";

export const metadata: Metadata = {
  title: "Moetruyen",
  description: "Powered by Yuri",
};

const inter = Inter({ subsets: ["vietnamese"] });

export default function RootLayout({
  children,
  authModal,
}: {
  children: React.ReactNode;
  authModal: React.ReactNode;
}) {
  return (
    <html lang="vi" className="dark">
      <body
        className={cn(
          "h-screen antialiased dark:bg-zinc-800 dark:text-slate-50",
          inter.className
        )}
      >
        <Providers>
          {authModal}

          <Navbar />
          {children}
        </Providers>
        <Toaster />
      </body>
    </html>
  );
}
