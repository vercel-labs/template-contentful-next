import { Inter } from "next/font/google";
import "./globals.css";
import { Header } from "@/components/header";

const inter = Inter({ subsets: ["latin"] });

export const metadata = {
  title: "Knowledge Articles",
  description: "Browse our knowledge base articles",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className="[scrollbar-gutter:stable]">
      <body className={inter.className} suppressHydrationWarning={true}>
        <div className="min-h-screen">
          <Header title="Knowledge Articles" />
          {children}
        </div>
      </body>
    </html>
  );
}
