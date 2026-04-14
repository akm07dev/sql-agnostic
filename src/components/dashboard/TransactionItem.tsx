import { Badge } from "@/components/ui/badge";
import { ThumbsUp, ThumbsDown } from "lucide-react";
import { QueryModal } from "./QueryModal";
import { useState } from "react";
import { SQL_DIALECTS } from "@/lib/dialects";

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

interface TransactionItemProps {
  transaction: Transaction;
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const [showInputModal, setShowInputModal] = useState(false);
  const [showOutputModal, setShowOutputModal] = useState(false);

  const getDialectLabel = (dialect: string) => {
    const found = SQL_DIALECTS.find(d => d.value === dialect);
    return found ? found.label : dialect;
  };

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

  const isLongQuery = (sql: string) => sql.length > 100;

  return (
    <>
      <div className="bg-white dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-xl p-6 hover:shadow-lg transition-all duration-200 hover:border-slate-300 dark:hover:border-slate-600">
        <div className="flex items-start justify-between mb-4">
          <div className="flex items-center gap-3 flex-wrap">
            <Badge variant="outline" className="px-3 py-1 bg-blue-50 dark:bg-blue-950/50 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-300 font-medium">
              {getDialectLabel(transaction.source_dialect)} → {getDialectLabel(transaction.target_dialect)}
            </Badge>
            {transaction.was_ai_refined && (
              <Badge className="px-3 py-1 bg-purple-100 dark:bg-purple-900/50 text-purple-700 dark:text-purple-300 border-purple-200 dark:border-purple-800">
                ✨ AI Refined
              </Badge>
            )}
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            {transaction.rating === 1 && (
              <div className="flex items-center gap-1 text-green-600 dark:text-green-400">
                <ThumbsUp className="w-4 h-4" />
                <span className="text-sm font-medium">Liked</span>
              </div>
            )}
            {transaction.rating === -1 && (
              <div className="flex items-center gap-1 text-red-600 dark:text-red-400">
                <ThumbsDown className="w-4 h-4" />
                <span className="text-sm font-medium">Disliked</span>
              </div>
            )}
            <span className="text-sm text-slate-500 dark:text-zinc-400 bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-md">
              {formatDate(transaction.created_at)}
            </span>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
              <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
              Input SQL
              {isLongQuery(transaction.input_sql) && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-normal cursor-pointer hover:underline" onClick={() => setShowInputModal(true)}>
                  (Click to expand)
                </span>
              )}
            </h4>
            <div 
              className={`bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 min-h-[6rem] ${isLongQuery(transaction.input_sql) ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800' : ''}`}
              onClick={() => isLongQuery(transaction.input_sql) && setShowInputModal(true)}
            >
              <pre className="text-sm text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                {truncateSql(transaction.input_sql, 200)}
              </pre>
            </div>
          </div>
          <div className="space-y-2">
            <h4 className="text-sm font-semibold text-slate-700 dark:text-zinc-300 flex items-center gap-2">
              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
              Output SQL
              {isLongQuery(transaction.output_sql) && (
                <span className="text-xs text-blue-600 dark:text-blue-400 font-normal cursor-pointer hover:underline" onClick={() => setShowOutputModal(true)}>
                  (Click to expand)
                </span>
              )}
            </h4>
            <div 
              className={`bg-slate-50 dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 rounded-lg p-4 min-h-[6rem] ${isLongQuery(transaction.output_sql) ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800' : ''}`}
              onClick={() => isLongQuery(transaction.output_sql) && setShowOutputModal(true)}
            >
              <pre className="text-sm text-slate-800 dark:text-slate-200 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                {truncateSql(transaction.output_sql, 200)}
              </pre>
            </div>
          </div>
        </div>
      </div>

      <QueryModal
        isOpen={showInputModal}
        onClose={() => setShowInputModal(false)}
        title="Input SQL"
        query={transaction.input_sql}
      />
      <QueryModal
        isOpen={showOutputModal}
        onClose={() => setShowOutputModal(false)}
        title="Output SQL"
        query={transaction.output_sql}
      />
    </>
  );
}
