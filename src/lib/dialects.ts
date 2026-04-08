/**
 * @file dialects.ts
 * @description Provides precise JSDoc definitions and typings for all 20+ SQL dialects supported by SQLGlot.
 */

/**
 * Enumeration of supported SQL dialects.
 * These keys map to SQLGlot's expected `read` and `write` language namespaces.
 */
export const SQL_DIALECTS = [
  { value: "postgres", label: "PostgreSQL", popular: true },
  { value: "tsql", label: "T-SQL (SQL Server)", popular: true },
  { value: "snowflake", label: "Snowflake", popular: true },
  { value: "bigquery", label: "Google BigQuery", popular: true },
  { value: "mysql", label: "MySQL", popular: true },
  { value: "oracle", label: "Oracle", popular: true },
  { value: "sqlite", label: "SQLite", popular: false },
  { value: "athena", label: "AWS Athena", popular: false },
  { value: "clickhouse", label: "ClickHouse", popular: false },
  { value: "databricks", label: "Databricks", popular: false },
  { value: "doris", label: "Apache Doris", popular: false },
  { value: "drill", label: "Apache Drill", popular: false },
  { value: "duckdb", label: "DuckDB", popular: false },
  { value: "hive", label: "Apache Hive", popular: false },
  { value: "dremio", label: "Dremio", popular: false },
  { value: "druid", label: "Apache Druid", popular: false },
  { value: "dune", label: "Dune", popular: false },
  { value: "exasol", label: "Exasol", popular: false },
  { value: "fabric", label: "Microsoft Fabric", popular: false },
  { value: "materialize", label: "Materialize", popular: false },
  { value: "prql", label: "PRQL", popular: false },
  { value: "risingwave", label: "RisingWave", popular: false },
  { value: "singlestore", label: "SingleStore", popular: false },
  { value: "solr", label: "Apache Solr", popular: false },
  { value: "presto", label: "Presto", popular: false },
  { value: "redshift", label: "Amazon Redshift", popular: false },
  { value: "spark", label: "Apache Spark", popular: false },
  { value: "spark2", label: "Apache Spark 2", popular: false },
  { value: "starrocks", label: "StarRocks", popular: false },
  { value: "tableau", label: "Tableau", popular: false },
  { value: "teradata", label: "Teradata", popular: false },
  { value: "trino", label: "Trino", popular: false }
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
