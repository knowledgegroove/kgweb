import type { Metadata } from "next";
import { Fraunces, Work_Sans, JetBrains_Mono } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/Navbar";
import { Footer } from "@/components/Footer";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  style: ["normal", "italic"],
});

const workSans = Work_Sans({
  variable: "--font-work-sans",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const jetbrainsMono = JetBrains_Mono({
  variable: "--font-jetbrains-mono",
  subsets: ["latin"],
  weight: ["400", "500"],
});

export const metadata: Metadata = {
  title: {
    default: "Knowledge Groove — Podcast, Academy & Courses by Ishaan Garg",
    template: "%s | Knowledge Groove",
  },
  description:
    "Knowledge Groove is an ecosystem for curious minds — a podcast on history, geopolitics, business, economics and science, hands-on workshops, and courses coming soon. Founded by Ishaan Garg.",
  keywords: [
    "Knowledge Groove",
    "Ishaan Garg",
    "podcast",
    "education podcast",
    "AI workshops",
    "English proficiency workshops",
    "student founder",
  ],
  openGraph: {
    title: "Knowledge Groove — Where curiosity meets insight",
    description:
      "A podcast, academy, and (soon) courses — built by high schooler Ishaan Garg to make useful knowledge more accessible.",
    type: "website",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${fraunces.variable} ${workSans.variable} ${jetbrainsMono.variable} h-full`}
    >
      <body className="flex min-h-full flex-col bg-background bg-noise antialiased">
        <a
          href="#main-content"
          className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[100] focus:bg-foreground focus:px-4 focus:py-2 focus:text-sm focus:font-semibold focus:text-background"
        >
          Skip to main content
        </a>
        <Navbar />
        <main id="main-content" className="flex-1">
          {children}
        </main>
        <Footer />
      </body>
    </html>
  );
}
