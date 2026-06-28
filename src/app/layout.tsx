import type { Metadata } from "next";
import "./globals.css";
import Navbar from "@/components/Navbar";

export const metadata: Metadata = {
  title: "Community Hero — Hyperlocal Problem Solver",
  description: "Report, verify, and track local civic issues together.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased">
      <body className="min-h-full flex flex-col bg-neutral-50">
        <Navbar />
        <main className="flex-1">{children}</main>
      </body>
    </html>
  );
}
