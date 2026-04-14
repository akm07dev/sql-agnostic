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
      <div className="flex flex-col py-5 gap-3 group">
        <div className="flex items-center justify-between text-xs mb-1">
          <div className="flex items-center gap-2">
            <span className="font-mono text-slate-800 dark:text-zinc-200 font-semibold border border-zinc-200 dark:border-zinc-800 px-1.5 py-0.5 rounded-sm bg-zinc-50 dark:bg-zinc-900/50">
              {getDialectLabel(transaction.source_dialect)} → {getDialectLabel(transaction.target_dialect)}
            </span>
          </div>
          <div className="flex items-center gap-3 text-slate-500 dark:text-zinc-400 font-mono text-[11px]">
            <div className="flex items-center gap-1">
              {transaction.rating === 1 && <ThumbsUp className="w-3.5 h-3.5 text-green-600 dark:text-green-500" />}
              {transaction.rating === -1 && <ThumbsDown className="w-3.5 h-3.5 text-red-600 dark:text-red-500" />}
            </div>
            {formatDate(transaction.created_at)}
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-widest flex items-center justify-between">
              Input
              {isLongQuery(transaction.input_sql) && (
                <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline normal-case tracking-normal" onClick={() => setShowInputModal(true)}>
                  expand
                </span>
              )}
            </h4>
            <div 
              className={`bg-zinc-50 dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded p-3 h-[92px] relative overflow-hidden ${isLongQuery(transaction.input_sql) ? 'cursor-pointer hover:bg-zinc-100 dark:hover:bg-zinc-900' : ''}`}
              onClick={() => isLongQuery(transaction.input_sql) && setShowInputModal(true)}
            >
              <pre className="text-[11px] text-slate-600 dark:text-zinc-400 whitespace-pre-wrap font-mono leading-relaxed">
                {truncateSql(transaction.input_sql, 200)}
              </pre>
              {isLongQuery(transaction.input_sql) && (
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-zinc-50 dark:from-zinc-950 to-transparent pointer-events-none" />
              )}
            </div>
          </div>
          <div className="space-y-1.5">
            <h4 className="text-[11px] font-semibold text-slate-500 dark:text-zinc-500 uppercase tracking-widest flex items-center justify-between">
              Output
              {isLongQuery(transaction.output_sql) && (
                <span className="text-blue-600 dark:text-blue-400 cursor-pointer hover:underline normal-case tracking-normal" onClick={() => setShowOutputModal(true)}>
                  expand
                </span>
              )}
            </h4>
            <div 
              className={`bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded p-3 h-[92px] relative overflow-hidden ${isLongQuery(transaction.output_sql) ? 'cursor-pointer hover:bg-zinc-50 dark:hover:bg-zinc-800/80' : ''}`}
              onClick={() => isLongQuery(transaction.output_sql) && setShowOutputModal(true)}
            >
              <pre className="text-[11px] text-slate-800 dark:text-zinc-300 whitespace-pre-wrap font-mono leading-relaxed">
                {truncateSql(transaction.output_sql, 200)}
              </pre>
              {isLongQuery(transaction.output_sql) && (
                <div className="absolute inset-x-0 bottom-0 h-8 bg-gradient-to-t from-white dark:from-zinc-900 to-transparent pointer-events-none" />
              )}
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
