import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "在日华人不动产调研",
  description: "帮助了解在日华人获取不动产信息的习惯与痛点",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className="bg-gray-50 min-h-screen">{children}</body>
    </html>
  );
}
