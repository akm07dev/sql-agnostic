import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Analytics } from "@vercel/analytics/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SQLAgnostic | SQL Dialect Converter for 31+ Databases",
  description: "Convert SQL queries between 31+ database dialects. Free online tool built with SQLGlot (MIT license) featuring AI-powered refinement, side-by-side Monaco editor, and visual diff view. Supports PostgreSQL, MySQL, SQL Server, Oracle, Snowflake, BigQuery, DuckDB, ClickHouse, and more.",
  keywords: [
    "SQL dialect converter",
    "SQL transpiler",
    "SQL query translator",
    "PostgreSQL",
    "MySQL",
    "SQL Server",
    "T-SQL",
    "Oracle",
    "SQLite",
    "Snowflake",
    "Google BigQuery",
    "DuckDB",
    "ClickHouse",
    "AWS Athena",
    "Amazon Redshift",
    "Databricks",
    "Apache Spark",
    "Trino",
    "Presto",
    "StarRocks",
    "SingleStore",
    "Teradata",
    "Exasol",
    "Materialize",
    "RisingWave",
    "Apache Druid",
    "Apache Hive",
    "Apache Drill",
    "Apache Doris",
    "Dremio",
    "Dune",
    "PRQL",
    "Solr",
    "Tableau",
    "Microsoft Fabric",
    "database migration",
    "SQL transpilation",
    "cross-database compatibility",
    "ETL pipeline",
    "SQL modernization",
    "query portability",
    "CRUD app migration",
    "online SQL converter",
    "SQL syntax checker",
    "MySQL to PostgreSQL",
    "SQL Server to PostgreSQL",
    "Oracle to PostgreSQL",
    "data warehouse migration"
  ],
  authors: [{ name: "akm07", url: "https://akm07.dev" }],
  creator: "akm07",
  applicationName: "SQLAgnostic",
  generator: "Next.js",
  metadataBase: new URL("https://sql-agnostic.akm07.dev"),
  alternates: {
    canonical: "/",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  openGraph: {
    title: "SQLAgnostic | SQL Dialect Converter for 31+ Databases",
    description: "Convert SQL between 31+ database dialects including PostgreSQL, MySQL, SQL Server, Oracle, Snowflake, BigQuery, DuckDB, ClickHouse, and more. Features AI-powered refinement, Monaco editor, and visual diff view.",
    url: "https://sql-agnostic.akm07.dev",
    siteName: "SQLAgnostic",
    locale: "en_US",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "SQLAgnostic | SQL Dialect Converter for 31+ Databases",
    description: "Convert SQL between 31+ database dialects. Features AI-powered refinement, Monaco editor, and visual diff view. Free to use.",
  },
  category: "developer tools",
  classification: "Software Application",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      suppressHydrationWarning
    >
      <body className="flex flex-col">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
