const manifest = {
  id: "/league/matchups",
  name: "familia de nuñez — Matchups",
  short_name: "Matchups",
  description: "Live matchups for the familia de nuñez FPL Draft league",
  start_url: "/league/matchups",
  scope: "/league/",
  display: "standalone",
  background_color: "#0a0f1e",
  theme_color: "#0a0f1e",
  icons: [
    { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
  ],
};

export function GET() {
  return Response.json(manifest, {
    headers: { "Content-Type": "application/manifest+json" },
  });
}
