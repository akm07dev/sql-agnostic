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
  if (transactions.length === 0) {
    return (
      <Card className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 shadow-sm">
        <CardHeader className="pb-6">
          <CardTitle className="flex items-center gap-3 text-xl">
            <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
              <Database className="w-6 h-6 text-slate-600 dark:text-slate-400" />
            </div>
            Recent Translations
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-12">
            <div className="p-4 bg-slate-100 dark:bg-slate-800 rounded-full w-fit mx-auto mb-6">
              <Database className="w-12 h-12 text-slate-400 dark:text-slate-600" />
            </div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">No translations yet</h3>
            <p className="text-slate-600 dark:text-zinc-400 mb-6 max-w-md mx-auto">
              Start translating SQL to see your history here and track your activity!
            </p>
            <Button
              onClick={() => window.location.href = "/"}
              className="bg-blue-600 hover:bg-blue-700 text-white shadow-sm hover:shadow-md transition-all duration-200"
            >
              <Database className="w-4 h-4 mr-2" />
              Go to Translator
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 shadow-sm">
      <CardHeader className="pb-6">
        <CardTitle className="flex items-center gap-3 text-xl">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
            <Database className="w-6 h-6 text-slate-600 dark:text-slate-400" />
          </div>
          Recent Translations
        </CardTitle>
        <p className="text-base text-slate-600 dark:text-zinc-400">
          Your last {transactions.length} SQL translations
        </p>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {transactions.map((transaction) => (
            <TransactionItem key={transaction.id} transaction={transaction} />
          ))}
        </div>
        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-6 border-t border-slate-200 dark:border-slate-700">
            <div className="text-sm text-slate-600 dark:text-zinc-400">
              Page {currentPage} of {totalPages}
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage - 1)}
                disabled={currentPage === 1 || loading}
              >
                <ChevronLeft className="w-4 h-4" />
                Previous
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onPageChange?.(currentPage + 1)}
                disabled={currentPage === totalPages || loading}
              >
                Next
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
