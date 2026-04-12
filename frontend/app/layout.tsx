import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { AuthProvider } from "@/contexts/AuthContext";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "Lá Lành — Nền tảng chia sẻ đồ dùng cũ cộng đồng",
    template: "%s | Lá Lành",
  },
  description:
    "Nền tảng kết nối người có đồ dùng cũ muốn tặng với người cần nhận, ưu tiên cá nhân khó khăn và tổ chức thiện nguyện.",
  keywords: [
    "Lá Lành",
    "chia sẻ đồ dùng",
    "thiện nguyện",
    "cộng đồng",
    "đồ cũ",
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="vi"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
