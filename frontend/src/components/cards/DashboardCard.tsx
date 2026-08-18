import { LucideIcon } from"lucide-react";

interface DashboardCardProps {
 title: string;
 value: string | number;
 subtitle: string;
 icon: LucideIcon;
 iconColor: string;
}

export function DashboardCard({ title, value, subtitle, icon: Icon, iconColor }: DashboardCardProps) {
 return (
 <div className="glass-card p-6 border border-ink-800 space-y-2">
 <div className="flex items-center justify-between text-ink-400">
 <span className="text-xs font-medium">{title}</span>
 <Icon className={`w-4 h-4 ${iconColor}`} />
 </div>
 <div className="text-2xl font-black text-white">{value}</div>
 <div className={`text-[11px] font-medium ${iconColor}`}>{subtitle}</div>
 </div>
 );
}
