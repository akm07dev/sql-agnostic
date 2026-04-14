"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { ThumbsUp, ThumbsDown, TrendingUp, BarChart3, Clock, Database } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface Transaction {
  id: string;
  input_sql: string;
  output_sql: string;
  source_dialect: string;
  target_dialect: string;
  was_ai_refined: boolean;
  rating: number | null;
  created_at: string;
}

interface FeedbackMetrics {
  total_feedback: number;
  positive_feedback: number;
  negative_feedback: number;
  positive_percentage: number;
}

export default function Dashboard() {
  const { user, authLoading, signOut } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [feedbackMetrics, setFeedbackMetrics] = useState<FeedbackMetrics | null>(null);
  const [publicFeedbackMetrics, setPublicFeedbackMetrics] = useState<FeedbackMetrics | null>(null);
  const [loading, setLoading] = useState(true);
  const [feedbackLoading, setFeedbackLoading] = useState(false);
  const [publicFeedbackLoading, setPublicFeedbackLoading] = useState(false);
  const [accordionValue, setAccordionValue] = useState<string[]>([]);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user) {
        try {
          const transRes = await fetch("/api/dashboard/transactions?limit=10");
          if (transRes.ok) {
            const transData = await transRes.json();
            setTransactions(transData.transactions);
          }
        } catch (error) {
          console.error("Failed to fetch transactions:", error);
        }
      }
      setLoading(false);
    };

    if (!authLoading) {
      fetchTransactions();
    }
  }, [user, authLoading]);

  const loadFeedback = async (type: "personal" | "public") => {
    if (type === "personal" && feedbackMetrics) return;
    if (type === "public" && publicFeedbackMetrics) return;

    const setLoading = type === "personal" ? setFeedbackLoading : setPublicFeedbackLoading;
    const setMetrics = type === "personal" ? setFeedbackMetrics : setPublicFeedbackMetrics;
    const url = type === "personal" ? "/api/dashboard/feedback" : "/api/feedback";

    setLoading(true);
    try {
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setMetrics(data);
      }
    } catch (error) {
      console.error(`Failed to fetch ${type} feedback:`, error);
    } finally {
      setLoading(false);
    }
  };

  const handleAccordionChange = (value: string[]) => {
    setAccordionValue(value);
    if (value.includes("personal-feedback") && !feedbackMetrics) {
      loadFeedback("personal");
    }
    if (value.includes("public-feedback") && !publicFeedbackMetrics) {
      loadFeedback("public");
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900">
        <Navbar user={user} authLoading={authLoading} onSignOut={signOut} />
        <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
        </div>
      </div>
    );
  }

  const feedbackChartData = (metrics: FeedbackMetrics | null) => metrics ? [
    { name: "Positive", value: metrics.positive_feedback, color: "#22c55e" },
    { name: "Negative", value: metrics.negative_feedback, color: "#ef4444" },
  ] : [];

  const renderFeedbackMetrics = (metrics: FeedbackMetrics | null, loading: boolean, title: string) => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Feedback</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{loading ? "..." : metrics?.total_feedback || 0}</div>
            <p className="text-xs text-muted-foreground">{title}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Positive Feedback</CardTitle>
            <ThumbsUp className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {loading ? "..." : `${metrics?.positive_percentage || 0}%`}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "..." : `${metrics?.positive_feedback || 0} positive ratings`}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Feedback Trend</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {loading ? "..." : (!metrics ? "N/A" : metrics.total_feedback === 0 ? "N/A" : (
                <>
                  {metrics.positive_percentage >= 50 ? "+" : ""}
                  {Math.round(metrics.positive_percentage - 50)}%
                </>
              ))}
            </div>
            <p className="text-xs text-muted-foreground">
              {loading ? "..." : (!metrics ? "No data" : metrics.total_feedback === 0 ? "No feedback yet" : "vs. neutral (50%)")}
            </p>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium">Feedback Distribution</CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center h-[200px]">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
            </div>
          ) : (
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie
                  data={feedbackChartData(metrics)}
                  cx="50%"
                  cy="50%"
                  innerRadius={40}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {feedbackChartData(metrics).map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          )}
        </CardContent>
      </Card>
    </div>
  );

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  const truncateSql = (sql: string, maxLength: number = 100) => {
    if (sql.length <= maxLength) return sql;
    return sql.substring(0, maxLength) + "...";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 dark:from-zinc-950 dark:to-zinc-900">
      <Navbar user={user} authLoading={authLoading} onSignOut={signOut} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-900 dark:text-white mb-2">Dashboard</h1>
          <p className="text-slate-600 dark:text-zinc-400">
            {user
              ? "Track your SQL translation activity and feedback metrics."
              : "Community feedback is public. Sign in to see your query history and your own feedback."
            }
          </p>
        </div>

        {/* Recent Transactions */}
        {user ? (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Database className="w-5 h-5" />
                Recent Translations
              </CardTitle>
              <CardDescription>
                Your last {transactions.length} SQL translations
              </CardDescription>
            </CardHeader>
            <CardContent>
              {transactions.length === 0 ? (
                <div className="text-center py-8 text-slate-500 dark:text-zinc-400">
                  <Database className="w-12 h-12 mx-auto mb-4 opacity-50" />
                  <p>No translations yet. Start translating SQL to see your history here!</p>
                  <Button
                    className="mt-4"
                    onClick={() => window.location.href = "/"}
                  >
                    Go to Translator
                  </Button>
                </div>
              ) : (
                <div className="space-y-4">
                  {transactions.map((transaction) => (
                    <div
                      key={transaction.id}
                      className="border border-slate-200 dark:border-zinc-700 rounded-lg p-4 hover:bg-slate-50 dark:hover:bg-zinc-800/50 transition-colors"
                    >
                      <div className="flex items-start justify-between mb-3">
                        <div className="flex items-center gap-2">
                          <Badge variant="outline" className="text-xs">
                            {transaction.source_dialect} → {transaction.target_dialect}
                          </Badge>
                          {transaction.was_ai_refined && (
                            <Badge variant="secondary" className="text-xs">
                              AI Refined
                            </Badge>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          {transaction.rating === 1 && <ThumbsUp className="w-4 h-4 text-green-600" />}
                          {transaction.rating === -1 && <ThumbsDown className="w-4 h-4 text-red-600" />}
                          <span className="text-xs text-slate-500 dark:text-zinc-400">
                            {formatDate(transaction.created_at)}
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Input SQL</h4>
                          <pre className="text-xs bg-slate-100 dark:bg-zinc-800 p-2 rounded overflow-x-auto">
                            {truncateSql(transaction.input_sql)}
                          </pre>
                        </div>
                        <div>
                          <h4 className="text-sm font-medium text-slate-700 dark:text-zinc-300 mb-2">Output SQL</h4>
                          <pre className="text-xs bg-slate-100 dark:bg-zinc-800 p-2 rounded overflow-x-auto">
                            {truncateSql(transaction.output_sql)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}

        {/* Feedback Accordions */}
        <Accordion value={accordionValue} onValueChange={handleAccordionChange} className="w-full">
          {user && (
            <AccordionItem value="personal-feedback">
              <AccordionTrigger className="text-lg font-semibold border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-700/50 transition-colors">
                Your Personal Feedback Metrics
              </AccordionTrigger>
              <AccordionContent>
                {renderFeedbackMetrics(feedbackMetrics, feedbackLoading, "From your translations")}
              </AccordionContent>
            </AccordionItem>
          )}

          <AccordionItem value="public-feedback">
            <AccordionTrigger className="text-lg font-semibold border border-slate-200 dark:border-zinc-700 rounded-lg px-4 py-3 bg-slate-50 dark:bg-zinc-800/50 hover:bg-slate-100 dark:hover:bg-zinc-700/50 transition-colors">
              {user ? "Community Feedback Metrics" : "Public Feedback Metrics"}
            </AccordionTrigger>
            <AccordionContent>
              {renderFeedbackMetrics(publicFeedbackMetrics, publicFeedbackLoading, "Community feedback")}
            </AccordionContent>
          </AccordionItem>
        </Accordion>

        {!user && (
          <Card className="mt-8">
            <CardHeader>
              <CardTitle className="text-lg">Private history remains hidden</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-slate-600 dark:text-zinc-400">
                Public feedback is visible here, but your personal query history and your own feedback are available only after signing in.
              </p>
              <div className="mt-4 flex flex-col sm:flex-row items-center gap-3 justify-center">
                <Button onClick={() => window.location.href = "/login"} className="px-5 py-2">
                  Sign In
                </Button>
                <Button variant="secondary" onClick={() => window.location.href = "/"} className="px-5 py-2">
                  Try the translator
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {/* Data Privacy Notice */}
          <Card className="mt-8 border-slate-200 dark:border-white/5 bg-slate-50 dark:bg-zinc-900/50">
            <CardContent className="pt-6">
              <div className="flex items-start gap-3">
                <Clock className="w-4 h-4 text-slate-500 dark:text-zinc-400 mt-0.5 flex-shrink-0" />
                <div>
                  <h3 className="font-medium text-slate-700 dark:text-slate-300 mb-1 text-sm">Your Privacy</h3>
                  <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed">
                    Your translation history is private and only visible to you. We store the source and target dialects, translation pairs, and your feedback (thumbs up/down).
                    We do not store the actual SQL queries beyond their initial processing. Your personal data is never shared or used for any other purpose.
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
      </main>

      <Footer />
    </div>
  );
}