/**
 * @file dialects.ts
 * @description Provides precise JSDoc definitions and typings for all 20+ SQL dialects supported by SQLGlot.
 */

/**
 * Self-hosted Simple Icons from /public/icons/ for dialect logos.
 * These are served from the same origin, avoiding corporate network CDN blocks.
 */
const SI = (slug: string) => `/icons/${slug}.svg`;

/**
 * Generic database SVG icon as a data URI fallback for dialects without a brand icon.
 */
const DB_ICON = `data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M3 5V19A9 3 0 0 0 21 19V5"/><path d="M3 12A9 3 0 0 0 21 12"/></svg>')}`;

/**
 * Enumeration of supported SQL dialects.
 * These keys map to SQLGlot's expected `read` and `write` language namespaces.
 */
export const SQL_DIALECTS = [
  { value: "postgres", label: "PostgreSQL", popular: true, icon: SI("postgresql") },
  { value: "tsql", label: "T-SQL (SQL Server)", popular: true, icon: SI("microsoftsqlserver") },
  { value: "snowflake", label: "Snowflake", popular: true, icon: SI("snowflake") },
  { value: "bigquery", label: "Google BigQuery", popular: true, icon: SI("googlecloud") },
  { value: "mysql", label: "MySQL", popular: true, icon: SI("mysql") },
  { value: "oracle", label: "Oracle", popular: true, icon: SI("oracle") },
  { value: "sqlite", label: "SQLite", popular: false, icon: SI("sqlite") },
  { value: "athena", label: "AWS Athena", popular: false, icon: SI("amazonaws") },
  { value: "clickhouse", label: "ClickHouse", popular: false, icon: SI("clickhouse") },
  { value: "databricks", label: "Databricks", popular: false, icon: SI("databricks") },
  { value: "doris", label: "Apache Doris", popular: false, icon: SI("apache") },
  { value: "drill", label: "Apache Drill", popular: false, icon: SI("apache") },
  { value: "duckdb", label: "DuckDB", popular: false, icon: SI("duckdb") },
  { value: "hive", label: "Apache Hive", popular: false, icon: SI("apachehive") },
  { value: "dremio", label: "Dremio", popular: false, icon: DB_ICON },
  { value: "druid", label: "Apache Druid", popular: false, icon: SI("apache") },
  { value: "dune", label: "Dune", popular: false, icon: DB_ICON },
  { value: "exasol", label: "Exasol", popular: false, icon: DB_ICON },
  { value: "fabric", label: "Microsoft Fabric", popular: false, icon: SI("microsoftazure") },
  { value: "materialize", label: "Materialize", popular: false, icon: DB_ICON },
  { value: "prql", label: "PRQL", popular: false, icon: DB_ICON },
  { value: "risingwave", label: "RisingWave", popular: false, icon: DB_ICON },
  { value: "singlestore", label: "SingleStore", popular: false, icon: SI("singlestore") },
  { value: "solr", label: "Apache Solr", popular: false, icon: SI("apachesolr") },
  { value: "presto", label: "Presto", popular: false, icon: DB_ICON },
  { value: "redshift", label: "Amazon Redshift", popular: false, icon: SI("amazonredshift") },
  { value: "spark", label: "Apache Spark", popular: false, icon: SI("apachespark") },
  { value: "spark2", label: "Apache Spark 2", popular: false, icon: SI("apachespark") },
  { value: "starrocks", label: "StarRocks", popular: false, icon: DB_ICON },
  { value: "tableau", label: "Tableau", popular: false, icon: SI("tableau") },
  { value: "teradata", label: "Teradata", popular: false, icon: DB_ICON },
  { value: "trino", label: "Trino", popular: false, icon: SI("trino") }
] as const;

/**
 * A derived type representing the valid dialect strings for SQLAgnostic.
 */
export type SqlDialect = typeof SQL_DIALECTS[number]['value'];

/**
 * Returns dialect objects separated by tier (Popular vs. Other)
 * 
 * @returns {Record<'popular'|'other', typeof SQL_DIALECTS>} Categorized dialects.
 */
export function getCategorizedDialects() {
  // Deduplicate in case of misconfiguration above
  const unique = Array.from(new Map(SQL_DIALECTS.map(item => [item.value, item])).values());
  return {
    popular: unique.filter(d => d.popular).sort((a, b) => a.label.localeCompare(b.label)),
    other: unique.filter(d => !d.popular).sort((a, b) => a.label.localeCompare(b.label))
  };
}
