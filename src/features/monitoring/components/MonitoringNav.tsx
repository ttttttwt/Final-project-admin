/**
 * MonitoringNav Component
 * Sub-navigation for monitoring section
 */

import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Activity, Bot } from "lucide-react";

const monitoringLinks = [
  {
    title: "System Health",
    href: "/monitoring/health",
    icon: Activity,
  },
  {
    title: "AI Usage Logs",
    href: "/monitoring/ai-usage",
    icon: Bot,
  },
];

export function MonitoringNav() {
  return (
    <nav className="flex gap-2 mb-6 border-b pb-4">
      {monitoringLinks.map((link) => (
        <NavLink
          key={link.href}
          to={link.href}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
              isActive
                ? "bg-primary text-primary-foreground"
                : "text-muted-foreground hover:text-foreground hover:bg-muted"
            )
          }
        >
          <link.icon className="h-4 w-4" />
          {link.title}
        </NavLink>
      ))}
    </nav>
  );
}

export default MonitoringNav;
