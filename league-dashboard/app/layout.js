import { Oswald, IBM_Plex_Sans, IBM_Plex_Mono } from "next/font/google";
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
};

export default function RootLayout({ children }) {
  return (
    <html
      lang="en"
      className={`${oswald.variable} ${plexSans.variable} ${plexMono.variable} h-full`}
    >
      <body className="min-h-full bg-pitch-bg text-ink font-body antialiased">
        {children}
      </body>
    </html>
  );
}
