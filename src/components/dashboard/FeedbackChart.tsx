import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";

interface FeedbackMetrics {
  total_feedback: number;
  positive_feedback: number;
  negative_feedback: number;
  positive_percentage: number;
}

interface FeedbackChartProps {
  metrics: FeedbackMetrics | null;
  loading: boolean;
  accent?: "indigo" | "emerald";
}

export function FeedbackChart({ metrics, loading, accent = "indigo" }: FeedbackChartProps) {
  const chartData = metrics ? [
    { name: "Positive", value: metrics.positive_feedback, color: accent === "indigo" ? "#818cf8" : "#34d399" }, // indigo-400 / emerald-400
    { name: "Negative", value: metrics.negative_feedback, color: accent === "indigo" ? "#c7d2fe" : "#a7f3d0" }, // indigo-200 / emerald-200
  ] : [];

  return (
    <Card className="bg-white dark:bg-zinc-900 border-slate-200 dark:border-white/10 shadow-[0_0_20px_rgba(0,0,0,0.03)] dark:shadow-[0_0_20px_rgba(0,0,0,0.2)] h-full">
      <CardHeader className="pb-2 border-b border-slate-100 dark:border-white/5 mx-6 px-0 pt-6">
        <CardTitle className="text-xs font-bold uppercase tracking-wider text-slate-700 dark:text-zinc-300 flex items-center gap-2">
          <div className={`p-1.5 ${accent === "indigo" ? "bg-indigo-100 dark:bg-indigo-500/20" : "bg-emerald-100 dark:bg-emerald-500/20"} rounded-md`}>
            <BarChart3 className={`h-3 w-3 ${accent === "indigo" ? "text-indigo-600 dark:text-indigo-400" : "text-emerald-600 dark:text-emerald-400"}`} />
          </div>
          Feedback Distribution
        </CardTitle>
      </CardHeader>
      <CardContent>
        {loading ? (
          <div className="flex items-center justify-center h-[240px]">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-900 dark:border-white"></div>
          </div>
        ) : metrics && metrics.total_feedback > 0 ? (
          <ResponsiveContainer width="100%" height={240}>
            <PieChart>
              <Pie
                data={chartData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={85}
                paddingAngle={5}
                dataKey="value"
                stroke="none"
                cornerRadius={4}
              >
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip
                contentStyle={{
                  backgroundColor: 'hsl(var(--background))',
                  border: '1px solid hsl(var(--border))',
                  borderRadius: '8px',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
                }}
              />
              <Legend
                wrapperStyle={{ paddingTop: '20px' }}
                iconType="circle"
              />
            </PieChart>
          </ResponsiveContainer>
        ) : (
          <div className="flex items-center justify-center h-[240px] text-slate-500 dark:text-zinc-400">
            <div className="text-center">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <p>No feedback data available</p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
