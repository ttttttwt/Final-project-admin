import { NavLink, useLocation } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Activity,
  LogOut,
  Settings,
  User,
  Bell,
  Mail,
  Bot,
  BarChart3,
  CreditCard,
  Receipt,
  Eye,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const { user, logout } = useAuthStore();
  const location = useLocation();
  const isAdmin = user?.role === "ADMIN";

  const navItems = [
    {
      title: "Dashboard",
      href: "/",
      icon: LayoutDashboard,
      show: true,
    },
    {
      title: "Users",
      href: "/users",
      icon: Users,
      show: isAdmin,
    },
    {
      title: "Courses",
      href: "/courses",
      icon: BookOpen,
      show: true,
    },
    {
      title: "AI Management",
      href: "/ai",
      icon: Bot,
      show: isAdmin,
    },
    {
      title: "Analytics",
      href: "/analytics",
      icon: BarChart3,
      show: isAdmin,
    },
    {
      title: "Subscriptions",
      href: "/subscriptions",
      icon: CreditCard,
      show: isAdmin,
    },
    {
      title: "Payments",
      href: "/payments",
      icon: Receipt,
      show: isAdmin,
    },
    {
      title: "User Monitoring",
      href: "/monitoring/users",
      icon: Eye,
      show: isAdmin,
    },
    {
      title: "System Health",
      href: "/monitoring/health",
      icon: Activity,
      show: isAdmin,
      isActiveMatch: (pathname: string) =>
        pathname.startsWith("/monitoring") && pathname !== "/monitoring/users",
    },
    {
      title: "Notifications",
      href: "/notifications",
      icon: Bell,
      show: isAdmin,
    },
    {
      title: "Emails",
      href: "/emails",
      icon: Mail,
      show: isAdmin,
    },
    {
      title: "Settings",
      href: "/settings",
      icon: Settings,
      show: isAdmin,
    },
  ];

  return (
    <div className="flex h-full w-64 flex-col border-r bg-card">
      <div className="flex h-14 items-center border-b px-6">
        <span className="text-lg font-bold">LEXIA Admin</span>
      </div>
      <div className="flex-1 overflow-y-auto py-4">
        <nav className="grid items-start px-4 text-sm font-medium">
          {navItems.map(
            (item) =>
              item.show && (
                <NavLink
                  key={item.href}
                  to={item.href}
                  className={({ isActive }) => {
                    const active = item.isActiveMatch
                      ? item.isActiveMatch(location.pathname)
                      : isActive;
                    return cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                      active
                        ? "bg-muted text-primary"
                        : "text-muted-foreground"
                    );
                  }}
                >
                  <item.icon className="h-4 w-4" />
                  {item.title}
                </NavLink>
              )
          )}
        </nav>
      </div>
      <div className="border-t p-4">
        <NavLink
          to="/profile"
          className={({ isActive }) =>
            cn(
              "flex items-center gap-3 rounded-lg px-3 py-2 mb-2 transition-all hover:text-primary",
              isActive ? "bg-muted text-primary" : "text-muted-foreground"
            )
          }
        >
          <User className="h-4 w-4" />
          <div className="flex flex-col">
            <span className="text-sm font-medium">
              {user?.fullName || "User"}
            </span>
            <span className="text-xs text-muted-foreground">{user?.email}</span>
          </div>
        </NavLink>
        <Button
          variant="ghost"
          className="w-full justify-start gap-2"
          onClick={logout}
        >
          <LogOut className="h-4 w-4" />
          Logout
        </Button>
      </div>
    </div>
  );
}

