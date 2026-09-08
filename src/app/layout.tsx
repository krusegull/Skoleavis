import type { Metadata } from "next";
import { Playfair_Display, Source_Serif_4, Inter } from "next/font/google";
import "./globals.css";
import { Providers } from "@/components/Providers";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

const headline = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-headline",
  weight: ["700", "900"],
});

const body = Source_Serif_4({
  subsets: ["latin"],
  variable: "--font-body",
});

const sans = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

export const metadata: Metadata = {
  title: "Skoleavisen",
  description: "Skoleavisen - skrevet av elever, for elever",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="nb">
      <body className={`${headline.variable} ${body.variable} ${sans.variable} font-serif`}>
        <Providers>
          <div className="flex min-h-screen flex-col">
            <Header />
            <main className="flex-1">{children}</main>
            <Footer />
          </div>
        </Providers>
      </body>
    </html>
  );
}
