import type { Metadata } from "next";
import localFont from "next/font/local";
import { ReactNode } from "react";

import "./globals.css";
import { getServerLocale } from "@/lib/i18n-server";

const inter = localFont({
  src: "./fonts/InterVF.ttf",
  variable: "--font-inter",
  weight: "100 200 300 400 500 700 800 900",
});

const spaceGrotesk = localFont({
  src: "./fonts/SpaceGroteskVF.ttf",
  variable: "--font-space-grotesk",
  weight: "300 400 500 700",
});

export const metadata: Metadata = {
  title: "DevFlow",
  description:
    "A community-driven platform for asking and answering programming questions. Get help, share knowledge, and collaborate with developers from around the world. Explore topics in web development, mobile app development, algorithms, data structures, and more.",
};

const RootLayout = async ({ children }: { children: ReactNode }) => {
  const locale = await getServerLocale();

  return (
    <html lang={locale}>
      <body className={`${inter.className} ${spaceGrotesk.variable} antialiased`}>
        {children}
      </body>
    </html>
  );
};

export default RootLayout;
