import { ImageResponse } from "next/og";

export const runtime = "edge";

export const alt = "SQLAgnostic - SQL Dialect Converter for 31+ Databases";
export const size = {
  width: 1200,
  height: 630,
};
export const contentType = "image/png";

export default async function Image() {
  return new ImageResponse(
    (
      <div
        style={{
          background: "linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4f46e5 100%)",
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          justifyContent: "center",
          padding: "60px",
          position: "relative",
        }}
      >
        {/* Background pattern */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            opacity: 0.1,
            backgroundImage: `radial-gradient(circle at 20% 50%, rgba(255,255,255,0.1) 0%, transparent 50%), radial-gradient(circle at 80% 80%, rgba(255,255,255,0.1) 0%, transparent 50%)`,
          }}
        />

        {/* Logo area */}
        <div
          style={{
            display: "flex",
            alignItems: "center",
            gap: "24px",
            marginBottom: "40px",
          }}
        >
          <div
            style={{
              width: "80px",
              height: "80px",
              borderRadius: "20px",
              background: "linear-gradient(135deg, #6366f1, #8b5cf6)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              boxShadow: "0 20px 40px rgba(99, 102, 241, 0.3)",
            }}
          >
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <ellipse cx="12" cy="5" rx="9" ry="3"/>
              <path d="M3 5V19A9 3 0 0 0 21 19V5"/>
              <path d="M3 12A9 3 0 0 0 21 12"/>
            </svg>
          </div>
          <span
            style={{
              fontSize: "64px",
              fontWeight: "800",
              color: "white",
              letterSpacing: "-0.02em",
            }}
          >
            SQLAgnostic
          </span>
        </div>

        {/* Main tagline */}
        <p
          style={{
            fontSize: "42px",
            color: "rgba(255,255,255,0.95)",
            textAlign: "center",
            fontWeight: "600",
            marginBottom: "20px",
            lineHeight: 1.3,
            maxWidth: "900px",
          }}
        >
          SQL Dialect Converter for 31+ Databases
        </p>

        {/* Subtitle */}
        <p
          style={{
            fontSize: "28px",
            color: "rgba(255,255,255,0.7)",
            textAlign: "center",
            fontWeight: "400",
            marginBottom: "50px",
            maxWidth: "800px",
            lineHeight: 1.4,
          }}
        >
          AI-powered refinement • Side-by-side diff • Monaco editor
        </p>

        {/* Database icons row */}
        <div
          style={{
            display: "flex",
            gap: "16px",
            alignItems: "center",
            justifyContent: "center",
            flexWrap: "wrap",
            maxWidth: "1000px",
          }}
        >
          {[
            "PostgreSQL",
            "MySQL",
            "SQL Server",
            "Oracle",
            "Snowflake",
            "BigQuery",
            "DuckDB",
            "ClickHouse",
            "+23 more",
          ].map((db, i) => (
            <div
              key={db}
              style={{
                background: "rgba(255,255,255,0.1)",
                backdropFilter: "blur(10px)",
                padding: "12px 24px",
                borderRadius: "100px",
                border: "1px solid rgba(255,255,255,0.2)",
                color: "white",
                fontSize: "20px",
                fontWeight: "500",
                display: "flex",
                alignItems: "center",
              }}
            >
              {db}
            </div>
          ))}
        </div>

        {/* URL at bottom */}
        <div
          style={{
            position: "absolute",
            bottom: "40px",
            display: "flex",
            alignItems: "center",
            gap: "12px",
          }}
        >
          <span
            style={{
              color: "rgba(255,255,255,0.5)",
              fontSize: "20px",
              fontWeight: "500",
            }}
          >
            sql-agnostic.akm07.dev
          </span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
