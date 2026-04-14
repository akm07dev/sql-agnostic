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
}

export function FeedbackChart({ metrics, loading }: FeedbackChartProps) {
  const chartData = metrics ? [
    { name: "Positive", value: metrics.positive_feedback, color: "#22c55e" },
    { name: "Negative", value: metrics.negative_feedback, color: "#ef4444" },
  ] : [];

  return (
    <Card className="bg-white dark:bg-slate-900/50 border border-slate-200 dark:border-slate-700 shadow-sm">
      <CardHeader className="pb-4">
        <CardTitle className="text-lg font-semibold text-slate-900 dark:text-slate-100 flex items-center gap-2">
          <div className="p-2 bg-slate-100 dark:bg-slate-800 rounded-full">
            <BarChart3 className="h-5 w-5 text-slate-600 dark:text-slate-400" />
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
                innerRadius={50}
                outerRadius={90}
                paddingAngle={2}
                dataKey="value"
                stroke="none"
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
