import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon: LucideIcon;
  iconBg: string;
  iconColor: string;
  cardBg: string;
  textColor: string;
  loading?: boolean;
}

export function MetricCard({
  title,
  value,
  subtitle,
  icon: Icon,
  iconBg,
  iconColor,
  cardBg,
  textColor,
  loading = false
}: MetricCardProps) {
  return (
    <Card className={`${cardBg} border-slate-200 dark:border-slate-700 shadow-sm hover:shadow-md transition-shadow duration-200`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
        <CardTitle className={`text-sm font-semibold ${textColor}`}>{title}</CardTitle>
        <div className={`p-2 ${iconBg} rounded-full`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent>
        <div className={`text-3xl font-bold ${textColor} mb-1`}>
          {loading ? "..." : value}
        </div>
        {subtitle && (
          <p className={`text-xs ${textColor.replace('text-', 'text-opacity-80 text-')} font-medium`}>
            {loading ? "..." : subtitle}
          </p>
        )}
      </CardContent>
    </Card>
  );
}
