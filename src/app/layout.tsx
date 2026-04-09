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
  title: "SQLAgnostic | AI-Powered SQL Dialect Transpiler",
  description: "Seamlessly convert SQL between 20+ database dialects. Powered by SQLGlot and refined by Llama 3 AI for lossless database migrations.",
  keywords: ["SQL Transpiler", "SQL Converter", "PostgreSQL to Snowflake", "Database Migration", "AI SQL", "SQLGlot", "Next.js SQL IDE"],
  authors: [{ name: "Ankit Megotia", url: "https://github.com/akm07dev" }],
  creator: "akm07dev",
  openGraph: {
    type: "website",
    locale: "en_US",
    url: "https://sql-agnostic.akm07.dev",
    title: "SQLAgnostic | Universal SQL Translation",
    description: "Convert any SQL dialect with AI-powered refinement. Free, open-source, and secure.",
    siteName: "SQLAgnostic",
    images: [{
      url: "/apple-icon.png",
      width: 512,
      height: 512,
      alt: "SQLAgnostic Logo"
    }],
  },
  twitter: {
    card: "summary_large_image",
    title: "SQLAgnostic | AI SQL Transpiler",
    description: "The professional workbench for SQL dialect conversion.",
    creator: "@akm07dev",
    images: ["/apple-icon.png"],
  },
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
          disableTransitionOnChange
        >
          {children}
          <Analytics />
        </ThemeProvider>
      </body>
    </html>
  );
}
