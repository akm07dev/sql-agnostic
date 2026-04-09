import type { MetadataRoute } from "next";

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "SQLAgnostic",
    short_name: "SQLAgnostic",
    description: "SQL Dialect Converter for 31+ Databases. Convert queries between PostgreSQL, MySQL, SQL Server, Oracle, Snowflake, BigQuery, and more with AI-powered refinement.",
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
