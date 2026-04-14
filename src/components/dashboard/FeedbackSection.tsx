import { BarChart3, Loader2 } from "lucide-react";

interface FeedbackMetrics {
  total_feedback: number;
  positive_feedback: number;
  negative_feedback: number;
  positive_percentage: number;
  ai_refined_count: number;
}

interface FeedbackSectionProps {
  user: any;
  feedbackMetrics: FeedbackMetrics | null;
  publicFeedbackMetrics: FeedbackMetrics | null;
  feedbackLoading: boolean;
  publicFeedbackLoading: boolean;
  accordionValue: string[];
  onAccordionChange: (value: string[]) => void;
  loadFeedback: (type: "personal" | "public") => void;
}

export function FeedbackSection({
  user,
  feedbackMetrics,
  publicFeedbackMetrics,
  feedbackLoading,
  publicFeedbackLoading,
}: FeedbackSectionProps) {
  return (
    <div className="flex flex-wrap items-center gap-4 text-[13px] font-medium text-slate-500 dark:text-zinc-400 bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-md py-2.5 px-4 shadow-sm w-full font-mono uppercase tracking-tight">
      <div className="flex items-center gap-2 text-slate-800 dark:text-zinc-200 font-semibold border-r border-zinc-200 dark:border-zinc-800 pr-4">
        <BarChart3 className="w-4 h-4 text-blue-600 dark:text-blue-500" />
        Overview
      </div>

      <div className="flex items-center gap-2">
        <span>Community Translations:</span>
        {publicFeedbackLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <span className="text-slate-900 dark:text-white font-bold">{publicFeedbackMetrics?.total_feedback || 0}</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span>Community Positive Rate:</span>
        {publicFeedbackLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <span className="text-slate-900 dark:text-white font-bold">{publicFeedbackMetrics?.positive_percentage || 0}%</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <span>Community Refined:</span>
        {publicFeedbackLoading ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <span className="text-slate-900 dark:text-white font-bold">{publicFeedbackMetrics?.ai_refined_count || 0}</span>
        )}
      </div>

      {user && (
        <>
          <div className="hidden sm:block text-zinc-300 dark:text-zinc-700">|</div>
          <div className="flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">Personal Rating:</span>
            {feedbackLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
            ) : (
              <span className="text-slate-900 dark:text-white font-bold">{feedbackMetrics?.positive_percentage || 0}%</span>
            )}
          </div>

          <div className="flex items-center gap-2">
            <span className="text-blue-600 dark:text-blue-400">Personal Refined:</span>
            {feedbackLoading ? (
              <Loader2 className="w-3.5 h-3.5 animate-spin text-blue-500" />
            ) : (
              <span className="text-slate-900 dark:text-white font-bold">{feedbackMetrics?.ai_refined_count || 0}</span>
            )}
          </div>
        </>
      )}
    </div>
  );
}

