import type { Metadata } from "next";
import { Inter, Calistoga, Baloo_2 } from "next/font/google";
import { AppDataProvider } from "./_lib/store";
import TopNav from "./_components/TopNav";

const inter = Inter({
  variable: "--font-alp-sans",
  subsets: ["latin"],
});

const calistoga = Calistoga({
  variable: "--font-alp-display",
  weight: "400",
  subsets: ["latin"],
});

const baloo = Baloo_2({
  variable: "--font-alp-logo",
  weight: ["600", "700"],
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "DVHS Academic Leadership Portal",
    template: "%s | DVHS Academic Leadership",
  },
  description:
    "Coordination portal for Dougherty Valley High School's Academic Leadership peer-tutoring program.",
};

export default function ALPortalLayout({ children }: { children: React.ReactNode }) {
  return (
    <div
      id="main-content"
      className={`al-portal ${inter.variable} ${calistoga.variable} ${baloo.variable} flex min-h-screen flex-col bg-alp-bg font-alp-sans text-alp-ink antialiased`}
    >
      <AppDataProvider>
        <TopNav />
        <main className="flex-1">{children}</main>
      </AppDataProvider>
    </div>
  );
}
