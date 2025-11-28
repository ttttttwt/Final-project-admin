import { NavLink } from "react-router-dom";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  Activity,
  LogOut,
  Settings,
  User,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";

export default function Sidebar() {
  const { user, logout } = useAuthStore();
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
      title: "Monitoring",
      href: "/monitoring/health",
      icon: Activity,
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
                  className={({ isActive }) =>
                    cn(
                      "flex items-center gap-3 rounded-lg px-3 py-2 transition-all hover:text-primary",
                      isActive
                        ? "bg-muted text-primary"
                        : "text-muted-foreground"
                    )
                  }
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
