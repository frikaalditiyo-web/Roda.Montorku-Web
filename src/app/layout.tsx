import type { Metadata } from "next";
import { Poppins } from "next/font/google";
import "./globals.css";
import { ShowroomProvider } from "@/context/ShowroomContext";
import { NavigationManager } from "@/components/NavigationManager";

const poppins = Poppins({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-poppins",
});

export const metadata: Metadata = {
  title: "RODA.MOTORKU — Katalog & Penentuan Harga Jual Motor Bekas UMKM",
  description:
    "Sistem Katalog Digital dan Penentuan Harga Jual Menggunakan Machine Learning (Linear Regression, Decision Tree, dan Random Forest) pada Showroom Motor Bekas Roda.Motorku.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={poppins.variable}>
      <head>
        <link
          rel="stylesheet"
          href="https://fonts.googleapis.com/css2?family=Material+Symbols+Outlined:opsz,wght,FILL,GRAD@20..48,100..700,0..1,-50..200&display=swap"
        />
      </head>
      <body className="bg-surface font-sans text-body-md text-on-surface antialiased">
        <ShowroomProvider>
          {children}
          <NavigationManager />
        </ShowroomProvider>
      </body>
    </html>
  );
}
