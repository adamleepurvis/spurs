export const metadata = {
  manifest: "/league/manifest.webmanifest",
  applicationName: "Matchups",
  appleWebApp: { capable: true, title: "Matchups", statusBarStyle: "black" },
};

export default function LeagueLayout({ children }) {
  return children;
}
