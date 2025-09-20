import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "ByteLedger - بايت ليدجر",
  description: "Sales management system with Arabic support",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return children;
}