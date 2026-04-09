import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SQLAgnostic",
    short_name: "SQLAgnostic",
    description: "Convert SQL queries between 31+ database dialects. Features deterministic transpilation, AI-powered refinement, Monaco editor, and visual diff view. Built with SQLGlot (MIT license). Free to use.",
    start_url: "/",
    display: "standalone",
    background_color: "#f8fafc",
    theme_color: "#4f46e5",
    orientation: "any",
    scope: "/",
    lang: "en",
    categories: ["developer tools", "productivity", "utilities"],
    icons: [
      {
        src: "/icon.png",
        sizes: "32x32",
        type: "image/png",
      },
      {
        src: "/apple-icon.png",
        sizes: "180x180",
        type: "image/png",
      },
    ],
    screenshots: [
      {
        src: "https://sql-agnostic.akm07.dev/opengraph-image",
        sizes: "1200x630",
        type: "image/png",
        form_factor: "wide",
        label: "SQLAgnostic Interface",
      },
    ],
    shortcuts: [
      {
        name: "Convert SQL",
        short_name: "Convert",
        description: "Start converting SQL queries",
        url: "/",
        icons: [{ src: "/icon.png", sizes: "32x32" }],
      },
    ],
  };
}
