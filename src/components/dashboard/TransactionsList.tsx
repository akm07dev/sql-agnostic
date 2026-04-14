import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Database, ChevronLeft, ChevronRight } from "lucide-react";
import { TransactionItem } from "./TransactionItem";

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

interface TransactionsListProps {
  transactions: Transaction[];
  currentPage?: number;
  totalPages?: number;
  onPageChange?: (page: number) => void;
  loading?: boolean;
}

export function TransactionsList({ 
  transactions, 
  currentPage = 1, 
  totalPages = 1, 
  onPageChange,
  loading = false 
}: TransactionsListProps) {
  if (loading && transactions.length === 0) {
    return (
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-md overflow-hidden">
        <CardHeader className="pb-4 border-b border-zinc-200 dark:border-zinc-800 px-6 pt-5 flex flex-row items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
          <CardTitle className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-slate-800 dark:text-zinc-200">
            Recent Translations
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-zinc-200 dark:divide-zinc-800 px-6">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="flex flex-col py-5 gap-3">
                <div className="flex items-center justify-between mb-1">
                  <div className="h-5 w-24 bg-slate-100 dark:bg-zinc-800/80 animate-pulse rounded" />
                  <div className="h-4 w-32 bg-slate-100 dark:bg-zinc-800/80 animate-pulse rounded" />
                </div>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div className="h-[92px] bg-slate-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 rounded animate-pulse" />
                  <div className="h-[92px] bg-slate-50 dark:bg-zinc-900 border border-zinc-100 dark:border-zinc-800/50 rounded animate-pulse" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    );
  }

  if (transactions.length === 0) {
    return (
      <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-md">
        <CardHeader className="pb-4 border-b border-zinc-100 dark:border-zinc-800 px-6 pt-5">
          <CardTitle className="text-[13px] font-bold text-slate-800 dark:text-zinc-200 uppercase tracking-widest flex items-center gap-2">
            Recent Translations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-16">
            <div className="p-4 bg-zinc-100 dark:bg-zinc-800/50 rounded-full w-fit mx-auto mb-6">
              <Database className="w-8 h-8 text-slate-400 dark:text-zinc-500" />
            </div>
            <h3 className="text-sm font-semibold text-slate-900 dark:text-white mb-2">No translations yet</h3>
            <p className="text-sm text-slate-500 dark:text-zinc-400 mb-6 max-w-sm mx-auto">
              Start translating SQL to see your history here and track your activity.
            </p>
            <Button
              onClick={() => window.location.href = "/"}
              className="bg-blue-600 hover:bg-blue-700 text-white font-semibold transition-colors px-6 h-10 rounded-md"
            >
              Go to Translator
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm rounded-md overflow-hidden">
      <CardHeader className="pb-4 border-b border-zinc-200 dark:border-zinc-800 px-6 pt-5 flex flex-row items-center justify-between bg-zinc-50/50 dark:bg-zinc-900/50">
        <CardTitle className="flex items-center gap-2 text-[13px] font-bold uppercase tracking-widest text-slate-800 dark:text-zinc-200">
          Recent Translations
        </CardTitle>
        <p className="text-[11px] font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-widest hidden sm:block font-mono">
          {transactions.length} entries
        </p>
      </CardHeader>
      <CardContent className="p-0">
        <div className="divide-y divide-zinc-200 dark:divide-zinc-800 px-6">
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-4 bg-zinc-50/50 dark:bg-zinc-900/50 border-t border-zinc-200 dark:border-zinc-800">
            <div className="text-[11px] font-mono font-medium text-slate-500 dark:text-zinc-400 uppercase tracking-wider">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1 || loading}
                className="h-8 text-xs font-semibold px-3 border-zinc-200 dark:border-zinc-800"
              >
                Prev
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
                className="h-8 text-xs font-semibold px-3 border-zinc-200 dark:border-zinc-800"
              >
                Next
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
