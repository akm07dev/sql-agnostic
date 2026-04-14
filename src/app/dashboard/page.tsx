"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock } from "lucide-react";
import { TransactionsList } from "@/components/dashboard/TransactionsList";
import { FeedbackSection } from "@/components/dashboard/FeedbackSection";

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
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [transactionsLoading, setTransactionsLoading] = useState(false);

  useEffect(() => {
    const fetchTransactions = async () => {
      if (user) {
        try {
          const transRes = await fetch(`/api/dashboard/transactions?limit=10&page=${currentPage}`);
          if (transRes.ok) {
            const transData = await transRes.json();
            setTransactions(transData.transactions);
            setTotalPages(transData.totalPages || 1);
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
  }, [user, authLoading, currentPage]);

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

  const handlePageChange = async (page: number) => {
    setCurrentPage(page);
    setTransactionsLoading(true);
    
    try {
      const transRes = await fetch(`/api/dashboard/transactions?limit=10&page=${page}`);
      if (transRes.ok) {
        const transData = await transRes.json();
        setTransactions(transData.transactions);
        setTotalPages(transData.totalPages || 1);
      }
    } catch (error) {
      console.error("Failed to fetch transactions:", error);
    } finally {
      setTransactionsLoading(false);
    }
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
        <Navbar user={user} authLoading={authLoading} onSignOut={signOut} />
        <div className="flex items-center justify-center min-h-[calc(100vh-56px)]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 dark:border-blue-400 mx-auto mb-6"></div>
            <h2 className="text-xl font-semibold text-slate-900 dark:text-white mb-2">Loading your dashboard...</h2>
            <p className="text-slate-600 dark:text-zinc-400">Fetching your translation history and metrics</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-zinc-950">
      <Navbar user={user} authLoading={authLoading} onSignOut={signOut} />

      <main className="container mx-auto px-4 py-8 max-w-6xl">
        {/* Header */}
        <div className="mb-10">
          <div className="flex items-center gap-4 mb-4">
            <div className="p-3 bg-blue-600 rounded-xl shadow-lg">
              <BarChart3 className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold text-slate-900 dark:text-white mb-1">Dashboard</h1>
              <div className="h-1 w-20 bg-blue-600 rounded-full"></div>
            </div>
          </div>
          <p className="text-lg text-slate-600 dark:text-zinc-400 max-w-2xl">
            {user
              ? "Track your SQL translation activity, view detailed metrics, and see how your feedback contributes to the community."
              : "Community feedback is public and visible to everyone. Sign in to access your private query history and personal analytics."
            }
          </p>
        </div>

        {/* Recent Transactions */}
        {user && (
          <div className="mb-8">
            <TransactionsList 
              transactions={transactions} 
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              loading={transactionsLoading}
            />
          </div>
        )}

        {/* Feedback Section */}
        <div className="mb-8">
          <FeedbackSection
            user={user}
            feedbackMetrics={feedbackMetrics}
            publicFeedbackMetrics={publicFeedbackMetrics}
            feedbackLoading={feedbackLoading}
            publicFeedbackLoading={publicFeedbackLoading}
            accordionValue={accordionValue}
            onAccordionChange={handleAccordionChange}
            loadFeedback={loadFeedback}
          />
        </div>

        {/* Sign In Prompt */}
        {!user && (
          <Card className="mb-8 bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 shadow-sm">
            <CardHeader className="pb-4">
              <CardTitle className="text-xl text-amber-900 dark:text-amber-100 flex items-center gap-3">
                <div className="p-2 bg-amber-100 dark:bg-amber-900/50 rounded-full">
                  <Clock className="w-5 h-5 text-amber-600 dark:text-amber-400" />
                </div>
                Private History Remains Hidden
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-amber-800 dark:text-amber-200 mb-6 leading-relaxed">
                Your personal query history and individual feedback metrics are private and only visible after signing in.
                The community feedback shown above is aggregated and anonymized.
              </p>
              <div className="flex justify-center">
                <Button
                  onClick={() => window.location.href = "/login"}
                  className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200 px-8 py-3 text-lg"
                >
                  <BarChart3 className="w-5 h-5 mr-2" />
                  Sign In to View Your Dashboard
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </main>

      <Footer />
    </div>
  );
}