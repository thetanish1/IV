export interface AdminTelemetryEvent {
  action: string;
  category: "navigation" | "auth" | "moderation" | "billing" | "system" | "mailer";
  label?: string;
  metadata?: Record<string, any>;
}

export function trackAdminAction(event: AdminTelemetryEvent) {
  if (process.env.NODE_ENV === "development") {
    console.debug(`[AdminTelemetry] [${event.category.toUpperCase()}] ${event.action}`, event);
  }

  // Extensible dispatch to custom audit logs / webhook / analytics if configured
  try {
    if (typeof window !== "undefined") {
      window.dispatchEvent(
        new CustomEvent("admin-telemetry-event", {
          detail: {
            ...event,
            timestamp: new Date().toISOString(),
          },
        })
      );
    }
  } catch {
    // Non-blocking telemetry
  }
}
