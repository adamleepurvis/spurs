export default function manifest() {
  return {
    name: "familia de nuñez — FPL",
    short_name: "17th",
    description: "Live FPL Draft and Classic dashboard",
    start_url: "/matchups",
    scope: "/",
    display: "standalone",
    background_color: "#0a0f1e",
    theme_color: "#0a0f1e",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
