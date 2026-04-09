"use client";

import Script from "next/script";

export function JsonLd() {
  const softwareApplicationSchema = {
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    name: "SQLAgnostic",
    applicationCategory: "DeveloperApplication",
    operatingSystem: "Any",
    url: "https://sql-agnostic.akm07.dev",
    image: "https://sql-agnostic.akm07.dev/opengraph-image",
    description:
      "Convert SQL queries between 31+ database dialects including PostgreSQL, MySQL, SQL Server, Oracle, Snowflake, BigQuery, DuckDB, ClickHouse, and more. Built with SQLGlot (MIT license). Features deterministic transpilation, optional AI-powered refinement, side-by-side Monaco editor, and visual diff view.",
    author: {
      "@type": "Person",
      name: "akm07",
      url: "https://akm07.dev",
    },
    publisher: {
      "@type": "Person",
      name: "akm07",
      url: "https://akm07.dev",
    },
    isPartOf: {
      "@type": "CreativeWork",
      name: "akm07 Portfolio",
      url: "https://akm07.dev",
    },
    featureList: [
      "31 SQL dialect support including PostgreSQL, MySQL, SQL Server, Oracle, Snowflake, BigQuery, DuckDB, ClickHouse, Redshift, Databricks, Spark, and more",
      "Deterministic SQL transpilation via SQLGlot",
      "AI-powered query refinement with Groq",
      "Side-by-side Monaco editor interface",
      "Visual diff view showing SQLGlot vs AI output",
      "Automatic model fallback for reliability",
      "Rate limiting for fair usage",
      "Free tier for anonymous users",
      "Authenticated tier for higher limits and AI features",
      "Copy-paste workflow with keyboard shortcuts",
    ],
    codeRepository: "https://github.com/akm07dev/sql-agnostic",
    programmingLanguage: ["TypeScript", "Python", "SQL"],
    softwareVersion: "1.0",
    license: "https://opensource.org/licenses/MIT",
    requirements: "Modern web browser with JavaScript enabled",
  };

  const personSchema = {
    "@context": "https://schema.org",
    "@type": "Person",
    name: "akm07",
    url: "https://akm07.dev",
    image: "https://sql-agnostic.akm07.dev/icon.png",
    sameAs: [
      "https://github.com/akm07dev",
      "https://www.linkedin.com/in/ankitkm07/",
    ],
  };

  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "SQLAgnostic",
    url: "https://sql-agnostic.akm07.dev",
    description:
      "Free online SQL converter supporting 31+ database dialects. Convert between PostgreSQL, MySQL, SQL Server, Oracle, Snowflake, BigQuery, DuckDB, ClickHouse, and more. Built with SQLGlot and AI refinement.",
    author: {
      "@type": "Person",
      name: "akm07",
      url: "https://akm07.dev",
    },
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://sql-agnostic.akm07.dev/?dialect={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    },
  };

  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: [
      {
        "@type": "Question",
        name: "What SQL dialects does SQLAgnostic support?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SQLAgnostic supports 31 SQL dialects including PostgreSQL, MySQL, SQL Server (T-SQL), Oracle, SQLite, Snowflake, Google BigQuery, DuckDB, ClickHouse, AWS Athena, Amazon Redshift, Databricks, Apache Spark, Trino, Presto, StarRocks, SingleStore, Teradata, Exasol, Materialize, RisingWave, Apache Druid, Apache Hive, Apache Drill, Apache Doris, Dremio, Dune, PRQL, Solr, Tableau, and Microsoft Fabric.",
        },
      },
      {
        "@type": "Question",
        name: "Is SQLAgnostic free to use?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "Yes, SQLAgnostic is free to use. Anonymous users can convert SQL queries at 5 requests per minute. Authenticated users get higher limits (20 requests per minute) and access to AI-powered refinement features.",
        },
      },
      {
        "@type": "Question",
        name: "How does SQLAgnostic convert SQL dialects?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "SQLAgnostic uses a two-stage pipeline. First, SQLGlot performs deterministic syntax transpilation. Then, users can optionally trigger AI refinement (powered by Groq) for semantic improvements with natural language instructions.",
        },
      },
      {
        "@type": "Question",
        name: "What is AI refinement in SQLAgnostic?",
        acceptedAnswer: {
          "@type": "Answer",
          text: "AI refinement is an optional feature that improves SQL queries beyond syntax conversion. It can optimize queries, add explicit aliases, format code, apply best practices, or follow custom instructions. The diff view shows exactly what changed between the SQLGlot output and AI-refined output.",
        },
      },
    ],
  };

  const schemas = [softwareApplicationSchema, personSchema, websiteSchema, faqSchema];

  return (
    <Script
      id="json-ld"
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(schemas) }}
      strategy="afterInteractive"
    />
  );
}
