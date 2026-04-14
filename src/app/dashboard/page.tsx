"use client";

import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/useAuth";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3, Clock, Lock } from "lucide-react";
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
  ai_refined_count: number;
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
      loadFeedback("public");
      if (user) {
        loadFeedback("personal");
      }
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
    // Maintained for prop signature compatibility, though we won't use it in UI
    setAccordionValue(value);
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
    <div className="min-h-screen bg-zinc-50 dark:bg-zinc-950 relative selection:bg-blue-200 dark:selection:bg-blue-500/30 transition-colors">


      <Navbar user={user} authLoading={authLoading} onSignOut={signOut} />

      <main className="container mx-auto px-4 sm:px-6 py-8 max-w-[1700px] relative z-10 w-full lg:w-4/5 xl:w-[65%]">
        {/* Header */}
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white tracking-tight">
             Activity
          </h1>
        </div>

        {/* Top Analytics row */}
        <div className="mb-6">
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

        {/* History Row */}
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

        {/* Sign In Prompt */}
        {!user && (
          <Card className="mb-8 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-xl py-12">
            <CardHeader className="pb-4 items-center text-center">
              <CardTitle className="text-xl text-slate-900 dark:text-white flex flex-col items-center gap-4">
                <div className="p-3 bg-zinc-50 dark:bg-zinc-950 rounded-full border border-zinc-200 dark:border-zinc-800">
                  <Lock className="w-5 h-5 text-slate-400 dark:text-zinc-500" />
                </div>
                Sign in to view your activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex justify-center mt-2">
                <Button
                  onClick={() => window.location.href = "/login"}
                  className="bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-sm transition-colors px-6 h-10 rounded-md"
                >
                  Sign In
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