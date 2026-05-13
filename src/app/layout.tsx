import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/layout/Header";
import Footer from "@/components/layout/Footer";
import { AuthProvider } from "@/contexts/AuthContext";
import GlobalImageErrorFallback from "@/components/common/GlobalImageErrorFallback";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "연세대학교 미래캠퍼스 창업지원단",
  description: "혁신의 중심, 연세대학교 미래캠퍼스 창업지원단",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="ko"
      className={`${inter.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <AuthProvider>
          <GlobalImageErrorFallback />
          <Header />
          {children}
          <Footer />
        </AuthProvider>
      </body>
    </html>
  );
}
