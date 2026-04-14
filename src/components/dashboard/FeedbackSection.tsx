import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarChart3, TrendingUp } from "lucide-react";
import { MetricCard } from "./MetricCard";
import { FeedbackChart } from "./FeedbackChart";

interface FeedbackMetrics {
  total_feedback: number;
  positive_feedback: number;
  negative_feedback: number;
  positive_percentage: number;
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
  accordionValue,
  onAccordionChange,
  loadFeedback
}: FeedbackSectionProps) {
  return (
    <div className="space-y-4 overflow-visible">
      <Accordion value={accordionValue} onValueChange={onAccordionChange} className="w-full space-y-4">
        {user && (
          <AccordionItem value="personal-feedback" className="border-0">
            <AccordionTrigger className="text-lg font-semibold bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-6 py-4 transition-all duration-200 shadow-sm hover:shadow-md data-[state=open]:shadow-md">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-100 dark:bg-blue-900/50 rounded-full">
                  <BarChart3 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                </div>
                <div className="text-left">
                  <div className="font-semibold text-blue-900 dark:text-blue-100">Your Personal Feedback Metrics</div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 font-normal">Insights from your translations</div>
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="pt-6 border-t border-slate-100 dark:border-slate-800">
              <FeedbackMetricsContent 
                metrics={feedbackMetrics} 
                loading={feedbackLoading} 
                title="From your translations"
                onLoad={() => loadFeedback("personal")}
              />
            </AccordionContent>
          </AccordionItem>
        )}

        <AccordionItem value="public-feedback" className="border-0">
          <AccordionTrigger className="text-lg font-semibold bg-slate-50 dark:bg-slate-900 hover:bg-slate-100 dark:hover:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-6 py-4 transition-all duration-200 shadow-sm hover:shadow-md data-[state=open]:shadow-md">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-emerald-100 dark:bg-emerald-900/50 rounded-full">
                <TrendingUp className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div className="text-left">
                <div className="font-semibold text-emerald-900 dark:text-emerald-100">
                  {user ? "Community Feedback Metrics" : "Public Feedback Metrics"}
                </div>
                <div className="text-sm text-emerald-700 dark:text-emerald-300 font-normal">
                  {user ? "Community insights and trends" : "See what others think"}
                </div>
              </div>
            </div>
          </AccordionTrigger>
          <AccordionContent className="pt-6 border-t border-slate-100 dark:border-slate-800">
            <FeedbackMetricsContent 
              metrics={publicFeedbackMetrics} 
              loading={publicFeedbackLoading} 
              title="Community feedback"
              onLoad={() => loadFeedback("public")}
            />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  );
}

interface FeedbackMetricsContentProps {
  metrics: FeedbackMetrics | null;
  loading: boolean;
  title: string;
  onLoad: () => void;
}

function FeedbackMetricsContent({ metrics, loading, title, onLoad }: FeedbackMetricsContentProps) {
  if (!metrics && !loading) {
    onLoad();
    return (
      <div className="flex items-center justify-center h-32">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <MetricCard
          title="Total Feedback"
          value={metrics?.total_feedback || 0}
          subtitle={title}
          icon={BarChart3}
          iconBg="bg-blue-100 dark:bg-blue-900/50"
          iconColor="text-blue-600 dark:text-blue-400"
          cardBg="bg-white dark:bg-slate-900/50"
          textColor="text-slate-900 dark:text-slate-100"
          loading={loading}
        />

        <MetricCard
          title="Positive Feedback"
          value={`${metrics?.positive_percentage || 0}%`}
          subtitle={loading ? "..." : `${metrics?.positive_feedback || 0} positive ratings`}
          icon={TrendingUp}
          iconBg="bg-green-100 dark:bg-green-900/50"
          iconColor="text-green-600 dark:text-green-400"
          cardBg="bg-white dark:bg-slate-900/50"
          textColor="text-slate-900 dark:text-slate-100"
          loading={loading}
        />
      </div>

      <FeedbackChart metrics={metrics} loading={loading} />
    </div>
  );
}
