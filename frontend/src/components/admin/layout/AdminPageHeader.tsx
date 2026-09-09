import React from "react";
import { ExternalLink, RefreshCw } from "lucide-react";
import AdminButton from "../common/AdminButton";

export interface AdminPageHeaderProps {
  title: string;
  subtitle: string;
  icon: React.ReactNode;
  refreshing: boolean;
  onRefresh: () => void;
  docsUrl?: string;
  customActions?: React.ReactNode;
}

export default function AdminPageHeader({
  title,
  subtitle,
  icon,
  refreshing,
  onRefresh,
  docsUrl = "/docs",
  customActions,
}: AdminPageHeaderProps) {
  return (
    <div className="p-6 rounded-xl border border-ink-800 bg-ink-950/90 backdrop-blur-sm shadow-sm transition-colors">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-start gap-3.5">
          <div className="p-2.5 rounded-lg border border-ink-800 bg-ink-900 text-brand-400 shrink-0">
            {icon}
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white">
              {title}
            </h1>
            <p className="text-xs text-ink-400 mt-0.5">{subtitle}</p>
          </div>
        </div>

        {/* Header Actions */}
        <div className="flex items-center gap-2.5">
          {customActions}

          {docsUrl && (
            <AdminButton
              variant="outline"
              size="sm"
              icon={<ExternalLink className="w-3.5 h-3.5" />}
              onClick={() => window.open(docsUrl, "_blank")}
            >
              Docs
            </AdminButton>
          )}

          <AdminButton
            variant="brand"
            size="sm"
            icon={<RefreshCw className={`w-3.5 h-3.5 ${refreshing ? "animate-spin" : ""}`} />}
            onClick={onRefresh}
            loading={refreshing}
          >
            Sync Data
          </AdminButton>
        </div>
      </div>
    </div>
  );
}
