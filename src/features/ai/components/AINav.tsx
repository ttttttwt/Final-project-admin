/**
 * AINav Component
 * Sub-navigation for AI management section
 */

import { NavLink } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Bot, DollarSign, Settings2, Users, Bell } from "lucide-react";

const aiNavLinks = [
  {
    title: "Overview",
    href: "/ai",
    icon: Bot,
    end: true,
  },
  {
    title: "Quotas",
    href: "/ai/quotas",
    icon: Users,
  },
  {
    title: "Cost Analytics",
    href: "/ai/costs",
    icon: DollarSign,
  },
  {
    title: "Configuration",
    href: "/ai/config",
    icon: Settings2,
  },
  {
    title: "Alerts",
    href: "/ai/alerts",
    icon: Bell,
  },
];

export function AINav() {
  return (
    <nav className="flex gap-2 mb-6 border-b pb-4 overflow-x-auto">
      {aiNavLinks.map((link) => (
        <NavLink
          key={link.href}
          to={link.href}
          end={link.end}
          className={({ isActive }) =>
            cn(
              "flex items-center gap-2 px-4 py-2 rounded-md text-sm font-medium transition-colors whitespace-nowrap",
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

export default AINav;
