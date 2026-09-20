import { Oswald, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import NavBar from "@/components/NavBar";
import "./globals.css";

const oswald = Oswald({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "500", "600"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-mono",
  subsets: ["latin"],
  weight: ["500", "600"],
});

export const metadata = {
  title: "familia de nuñez — League Status",
  description: "Live standings and squad status for the FPL Draft league",
  applicationName: "17th",
  appleWebApp: { capable: true, title: "17th", statusBarStyle: "black" },
  icons: { apple: "/apple-touch-icon.png" },
};

export const viewport = {
  themeColor: "#0a0f1e",
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${plexSans.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full bg-pitch-bg text-ink font-body antialiased">
        <NavBar />
        {children}
        <Analytics />
      </body>
    </html>
  );
}
