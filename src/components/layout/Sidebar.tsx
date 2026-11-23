import React from "react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { useThemeStore } from "../../store/theme.store";
import { authApi } from "../../features/auth/api/auth.api";
import { Avatar } from "../ui/Avatar";
import {
  Home,
  Users,
  MessageCircle,
  User,
  PlusSquare,
  LogOut,
  Globe,
  Sun,
  Moon,
} from "lucide-react";
import { cn } from "../../lib/utils";
import { toast } from "sonner";

interface SidebarProps {
  onOpenCreatePost: () => void;
  onOpenChat: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  onOpenCreatePost,
  onOpenChat,
}) => {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      await authApi.logout();
      toast.success("Logged out successfully");
      navigate("/login");
    } catch {
      toast.error("Logout failed");
    }
  };

  const navItems = [
    { label: "Feed Stream", icon: Home, to: "/" },
    { label: "Connections", icon: Users, to: "/friends" },
    {
      label: "Direct Chat",
      icon: MessageCircle,
      action: onOpenChat,
    },
    {
      label: "My Profile",
      icon: User,
      to: `/profile/${user?._id || user?.id}`,
    },
  ];

  return (
    <aside className="hidden md:flex flex-col justify-between w-64 lg:w-72 h-screen sticky top-0 px-4 py-6 border-r border-sphere-border bg-sphere-card/75 backdrop-blur-md transition-colors">
      <div className="space-y-6">
        {/* Brand Header */}
        <div className="flex items-center justify-between px-2">
          <div className="flex items-center gap-2.5">
            <div
              className="w-10 h-10 rounded-2xl flex items-center justify-center shadow-lg transition-transform hover:scale-105"
              style={{ backgroundColor: "var(--accent-btn)", color: "var(--accent-btn-text)" }}
            >
              <Globe className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <h1 className="text-xl font-extrabold text-sphere-main leading-tight tracking-tight">
                  Sphere
                </h1>
                <span
                  className="text-[9px] uppercase font-bold px-1.5 py-0.5 rounded"
                  style={{ backgroundColor: "var(--accent-glow)", color: "var(--text-main)" }}
                >
                  v2.0
                </span>
              </div>
              <p className="text-[10px] text-sphere-muted font-medium">Connected Minds</p>
            </div>
          </div>

          {/* Theme Quick Toggle */}
          <button
            onClick={toggleTheme}
            className="p-1.5 rounded-xl border border-sphere-border hover:bg-sphere-base transition-colors"
            title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
          >
            {isDark ? <Sun className="w-4 h-4 text-amber-300" /> : <Moon className="w-4 h-4 text-sphere-muted" />}
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1.5">
          {navItems.map((item) => {
            const Icon = item.icon;
            if (item.action) {
              return (
                <button
                  key={item.label}
                  onClick={item.action}
                  className="w-full flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold text-sphere-muted hover:text-sphere-main hover:bg-sphere-base transition-colors"
                >
                  <Icon className="w-5 h-5 text-sphere-muted" />
                  <span>{item.label}</span>
                </button>
              );
            }

            return (
              <NavLink
                key={item.label}
                to={item.to!}
                className={({ isActive }) =>
                  cn(
                    "flex items-center gap-3.5 px-4 py-3 rounded-2xl text-sm font-semibold transition-all",
                    isActive
                      ? "shadow-sm border border-sphere-border"
                      : "text-sphere-muted hover:text-sphere-main hover:bg-sphere-base",
                  )
                }
                style={({ isActive }) =>
                  isActive
                    ? { backgroundColor: "var(--accent-glow)", color: "var(--text-main)" }
                    : {}
                }
              >
                <Icon className="w-5 h-5 text-sphere-muted" />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        {/* Create Post Action Button */}
        <button
          onClick={onOpenCreatePost}
          className="w-full flex items-center justify-center gap-2.5 py-3 rounded-2xl font-bold text-sm shadow-md transition transform active:scale-95"
          style={{ backgroundColor: "var(--accent-btn)", color: "var(--accent-btn-text)" }}
        >
          <PlusSquare className="w-4 h-4" />
          <span>New Post</span>
        </button>
      </div>

      {/* User Footer Profile & Logout */}
      <div className="pt-4 border-t border-sphere-border space-y-3">
        <div className="flex items-center justify-between p-2 rounded-2xl bg-sphere-base/60 border border-sphere-border">
          <div className="flex items-center gap-2.5 min-w-0">
            <Avatar
              name={user?.name}
              src={user?.avatar || user?.avatarUrl}
              size="sm"
              isOnline={true}
            />
            <div className="truncate">
              <p className="text-xs font-bold text-sphere-main truncate">
                {user?.name || "Khaled"}
              </p>
              <p className="text-[10px] text-sphere-muted truncate">
                {user?.email || "user@sphere.io"}
              </p>
            </div>
          </div>

          <button
            onClick={handleLogout}
            className="p-1.5 rounded-xl hover:bg-rose-500/10 text-rose-500 transition-colors"
            title="Log out"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>
    </aside>
  );
};
