import type { Metadata } from "next";
import { Noto_Sans_TC, Cactus_Classical_Serif  } from "next/font/google";
import "./globals.css";
import Background from "@/components/Background";
import { TransitionProvider } from "@/context/TransitionContext";

const notoSansTC = Noto_Sans_TC({
  subsets: ["latin"],
  weight: ["300", "400", "500", "700", "900"],
  variable: "--font-noto-sans",
});

const cactusSerif = Cactus_Classical_Serif({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-cactus-serif", 
});

export const metadata: Metadata = {
  title: "技 ⋅ 續 | Tech to be continued",
  description: "以技為始，續寫未來。科技應用與人力資源學系 專題展覽",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="zh-TW" className={cactusSerif.variable}>
      <body className="font-sans antialiased text-white">
        <Background />
        <TransitionProvider>
          <main className="relative z-10">
            {children}
          </main>
        </TransitionProvider>
      </body>
    </html>
  );
}