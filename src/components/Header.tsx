import { Link, useLocation } from "react-router-dom";
import { BarChart3, History, Home, TrendingUp, Settings, BookOpen, Bell, Brain } from "lucide-react";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "@/components/ThemeToggle";
import { ConnectionStatus } from "@/components/ConnectionStatus";
import { useActiveAlertCount } from "@/hooks/use-alerts";
import { Badge } from "@/components/ui/badge";

const navItems = [
  { path: "/", label: "Home", icon: Home },
  { path: "/plan", label: "Create Plan", icon: TrendingUp },
  { path: "/alerts", label: "Alerts", icon: Bell, showBadge: true },
  { path: "/journal", label: "Journal", icon: BookOpen },
  { path: "/psychologist", label: "AI Psych", icon: Brain },
  { path: "/knowledge", label: "Knowledge", icon: BookOpen },
  { path: "/history", label: "History", icon: History },
  { path: "/settings", label: "Settings", icon: Settings },
];

export function Header() {
  const location = useLocation();
  const { data: activeAlertCount = 0 } = useActiveAlertCount();

  return (
    <header className="sticky top-0 z-50 w-full border-b border-border bg-background/90 backdrop-blur-xl transition-colors duration-300">
      <div className="container flex h-16 items-center justify-between">
        <Link to="/" className="flex items-center gap-3 group">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-gradient-to-br from-primary to-accent shadow-[var(--shadow-md)] transition-transform group-hover:scale-105">
            <BarChart3 className="h-5 w-5 text-primary-foreground" />
          </div>
          <div className="flex flex-col">
            <span className="text-lg font-bold tracking-tight text-foreground">Auction Plan</span>
            <span className="text-xs text-muted-foreground">AMT Trading Tool</span>
          </div>
        </Link>

        <div className="flex items-center gap-4">
          <nav className="flex items-center gap-1">
            {navItems.map((item) => {
              const isActive = location.pathname === item.path || 
                (item.path === '/alerts' && location.pathname.startsWith('/alerts'));
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={cn(
                    "flex items-center gap-2 rounded-md px-4 py-2 text-sm font-medium transition-all duration-200",
                    isActive
                      ? "bg-primary/15 text-primary"
                      : "text-muted-foreground hover:bg-secondary hover:text-foreground"
                  )}
                >
                  <item.icon className="h-4 w-4" />
                  <span className="hidden sm:inline">{item.label}</span>
                  {item.showBadge && activeAlertCount > 0 && (
                    <Badge 
                      variant="secondary" 
                      className="ml-1 h-5 w-5 p-0 flex items-center justify-center bg-green-500/20 text-green-400 text-xs"
                    >
                      {activeAlertCount}
                    </Badge>
                  )}
                </Link>
              );
            })}
          </nav>
          <ConnectionStatus />
          <ThemeToggle />
        </div>
      </div>
    </header>
  );
}
