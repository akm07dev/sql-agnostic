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
    <Card className={`${cardBg} shadow-[0_0_20px_rgba(0,0,0,0.03)] dark:shadow-[0_0_20px_rgba(0,0,0,0.2)] hover:shadow-indigo-500/5 hover:-translate-y-1 transition-all duration-300 relative overflow-hidden group`}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3 relative z-10">
        <CardTitle className={`text-xs font-bold uppercase tracking-wider ${textColor} opacity-80`}>{title}</CardTitle>
        <div className={`p-2 ${iconBg} rounded-full`}>
          <Icon className={`h-4 w-4 ${iconColor}`} />
        </div>
      </CardHeader>
      <CardContent className="relative z-10">
        <div className={`text-3xl font-extrabold ${textColor} mb-1 tracking-tight`}>
          {loading ? <div className="h-9 w-24 bg-slate-200 dark:bg-white/10 rounded animate-pulse" /> : value}
        </div>
        {subtitle && (
          <p className={`text-xs ${textColor.replace('text-', 'text-opacity-60 text-')} font-medium`}>
            {loading ? "..." : subtitle}
          </p>
        )}
      </CardContent>
      {/* Decorative subtle background icon for depth */}
      <Icon className={`absolute -bottom-4 -right-4 w-24 h-24 opacity-[0.03] transform -rotate-12 group-hover:scale-110 group-hover:-rotate-6 transition-all duration-500 pointer-events-none ${iconColor}`} />
    </Card>
  );
}
