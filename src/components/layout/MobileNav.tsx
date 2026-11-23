import React from "react";
import { NavLink } from "react-router-dom";
import { useAuthStore } from "../../store/auth.store";
import { Home, Users, Plus, MessageCircle, User } from "lucide-react";
import { cn } from "../../lib/utils";

interface MobileNavProps {
  onOpenCreatePost: () => void;
  onOpenChat: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({
  onOpenCreatePost,
  onOpenChat,
}) => {
  const { user } = useAuthStore();

  const navItems = [
    { label: "Feed", icon: Home, to: "/" },
    { label: "Friends", icon: Users, to: "/friends" },
    {
      label: "Create",
      icon: Plus,
      action: onOpenCreatePost,
      isHighlight: true,
    },
    { label: "Chat", icon: MessageCircle, action: onOpenChat },
    {
      label: "Me",
      icon: User,
      to: `/profile/${user?._id || user?.id}`,
    },
  ];

  return (
    <nav className="md:hidden fixed bottom-3 inset-x-3 z-40 bg-sphere-card/95 backdrop-blur-xl border border-sphere-border rounded-2xl px-3 py-2 shadow-2xl transition-colors">
      <div className="flex items-center justify-around">
        {navItems.map((item) => {
          const Icon = item.icon;

          if (item.isHighlight) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="w-10 h-10 -mt-6 rounded-full flex items-center justify-center shadow-xl transform active:scale-90 transition font-black"
                style={{ backgroundColor: "var(--accent-btn)", color: "var(--accent-btn-text)" }}
                title="Create Post"
              >
                <Icon className="w-5 h-5" />
              </button>
            );
          }

          if (item.action) {
            return (
              <button
                key={item.label}
                onClick={item.action}
                className="relative flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors text-sphere-muted hover:text-sphere-main"
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] mt-0.5 font-medium">{item.label}</span>
                <span
                  className="absolute top-1 right-2 w-1.5 h-1.5 rounded-full"
                  style={{ backgroundColor: "var(--online-dot)" }}
                />
              </button>
            );
          }

          return (
            <NavLink
              key={item.label}
              to={item.to!}
              className={({ isActive }) =>
                cn(
                  "flex flex-col items-center justify-center p-1.5 rounded-xl transition-colors",
                  isActive
                    ? "font-bold"
                    : "text-sphere-muted hover:text-sphere-main",
                )
              }
              style={({ isActive }) =>
                isActive ? { color: "var(--text-main)" } : {}
              }
            >
              <Icon className="w-5 h-5" />
              <span className="text-[10px] mt-0.5">{item.label}</span>
            </NavLink>
          );
        })}
      </div>
    </nav>
  );
};
