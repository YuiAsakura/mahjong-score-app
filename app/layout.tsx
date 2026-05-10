// app/layout.tsx
import type { Metadata, Viewport } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "まーじゃんログ",
  description: "麻雀スコア管理アプリ",
  // スマホで「ホーム画面に追加」した時にアプリっぽく見せる設定
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "まーじゃんログ",
  },
};

// ビューポートの設定（ピンチズーム禁止などで操作性をアプリに近づける）
export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover", // ノッチ部分まで背景を広げる
  themeColor: "#f8fafc", // slate-50 の色
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ja">
      {/* body に背景色を設定することで、黒い隙間をなくす */}
      <body className="bg-slate-50 antialiased overflow-x-hidden">
        {children}
      </body>
    </html>
  );
}