import { Globe, Activity, Sparkles, User, Lock, Loader2, ThumbsUp } from "lucide-react";

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
}

const MetricCard = ({ 
  title, 
  icon: Icon, 
  globalVal, 
  personalVal, 
  suffix = "", 
  globalLoading,
  personalLoading,
  user
}: any) => (
  <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl p-5 shadow-sm flex flex-col justify-between overflow-hidden">
    <div className="flex items-center gap-2 text-[12px] font-semibold tracking-wide uppercase text-slate-500 dark:text-zinc-500 mb-5">
      <Icon className="w-4 h-4 text-blue-500" />
      {title}
    </div>
    
    <div className="grid grid-cols-2 divide-x divide-zinc-100 dark:divide-zinc-800/60">
      {/* Global Side */}
      <div className="pr-4 flex flex-col justify-end">
        <div className="text-[10px] uppercase tracking-widest text-slate-400 dark:text-zinc-500 mb-1.5 font-bold">Global</div>
        {globalLoading ? (
          <div className="h-7 w-14 bg-slate-100 dark:bg-zinc-800 animate-pulse rounded" />
        ) : (
           <div className="text-2xl font-bold font-mono text-slate-800 dark:text-slate-200">
             {globalVal}{suffix}
           </div>
        )}
      </div>
      
      {/* Personal Side */}
      <div className="pl-4 flex flex-col justify-end">
        <div className="text-[10px] uppercase tracking-widest text-blue-500/80 dark:text-blue-400/80 mb-1.5 font-bold flex items-center gap-1">
          <User className="w-3 h-3" /> You
        </div>
        {!user ? (
          <div className="text-[11px] text-slate-400 dark:text-zinc-500 font-medium flex items-center gap-1.5 py-1">
             <Lock className="w-3 h-3" /> Sign in
          </div>
        ) : personalLoading ? (
          <div className="h-7 w-14 bg-blue-50 dark:bg-blue-900/20 animate-pulse rounded" />
        ) : (
          <div className="text-2xl font-bold font-mono text-blue-600 dark:text-blue-400">
             {personalVal}{suffix}
          </div>
        )}
      </div>
    </div>
  </div>
);

export function FeedbackSection({
  user,
  feedbackMetrics: personal,
  publicFeedbackMetrics: global,
  feedbackLoading: personalLoading,
  publicFeedbackLoading: globalLoading,
}: FeedbackSectionProps) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 w-full">
      <MetricCard 
        title="Total Usage" 
        icon={Globe} 
        globalVal={global?.total_feedback || 0} 
        personalVal={personal?.total_feedback || 0} 
        globalLoading={globalLoading}
        personalLoading={personalLoading}
        user={user}
      />
      <MetricCard 
        title="AI Refinements" 
        icon={Sparkles} 
        globalVal={global?.ai_refined_count || 0} 
        personalVal={personal?.ai_refined_count || 0} 
        globalLoading={globalLoading}
        personalLoading={personalLoading}
        user={user}
      />
      <MetricCard 
        title="Approval Rating" 
        icon={Activity} 
        globalVal={global?.positive_percentage || 0} 
        personalVal={personal?.positive_percentage || 0} 
        suffix="%"
        globalLoading={globalLoading}
        personalLoading={personalLoading}
        user={user}
      />
      <MetricCard 
         title="Positive Ratings"
         icon={ThumbsUp}
         globalVal={global?.positive_feedback || 0}
         personalVal={personal?.positive_feedback || 0}
         globalLoading={globalLoading}
         personalLoading={personalLoading}
         user={user}
      />
    </div>
  );
}

