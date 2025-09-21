import type { Metadata } from "next";
import { Noto_Kufi_Arabic } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import "./globals.css";

const notoKufiArabic = Noto_Kufi_Arabic({
  variable: "--font-noto-kufi-arabic",
  subsets: ["arabic"],
});

export const metadata: Metadata = {
  title: "ByteLedger - إدارة الفواتير",
  description: "نظام إدارة الفواتير والمبيعات - بواسطة عصام برغش",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ar" dir="rtl" className='overflow-hidden'>
      <body
        className={`${notoKufiArabic.variable} antialiased`}
      >
        {children}
        <Toaster position="bottom-left" />
      </body>
    </html>
  );
}
