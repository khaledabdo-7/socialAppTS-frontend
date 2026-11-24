import React, { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "../../store/auth.store";
import { useThemeStore } from "../../store/theme.store";
import { Avatar } from "../ui/Avatar";
import {
  Globe,
  MessageCircle,
  Moon,
  Sun,
  Bell,
  CheckCheck,
  Heart,
  MessageSquare,
  UserPlus,
  Info,
  Search,
  X,
} from "lucide-react";
import { notificationApi, NotificationItem } from "../../features/notifications/api/notification.api";
import { profileApi } from "../../features/profile/api/profile.api";
import { getSocket } from "../../services/socket.client";

interface NavbarProps {
  onOpenCreatePost?: () => void;
  onOpenChat?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({ onOpenChat }) => {
  const { user } = useAuthStore();
  const { theme, toggleTheme } = useThemeStore();
  const isDark = theme === "dark";
  const queryClient = useQueryClient();

  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  // Search state for Mobile & Header
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchRef = useRef<HTMLDivElement>(null);

  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ["navbarSearchUsers", searchQuery],
    queryFn: () => profileApi.searchUsers(searchQuery),
    enabled: searchQuery.trim().length >= 2,
  });

  // Fetch notifications
  const { data: notifData } = useQuery({
    queryKey: ["notifications"],
    queryFn: () => notificationApi.getNotifications(1, 15),
    refetchInterval: 20000, // Background poll every 20s as fallback
  });

  const notifications = notifData?.notifications || [];
  const unreadCount = notifData?.unreadCount ?? 0;

  // Realtime notification socket listener
  useEffect(() => {
    const socket = getSocket();
    if (!socket) return;

    const handleNewNotification = () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    socket.on("notification", handleNewNotification);
    return () => {
      socket.off("notification", handleNewNotification);
    };
  }, [queryClient]);

  // Click outside listener for notifications & search popovers
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) {
        setIsNotifOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) {
        setIsSearchOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const markAllMutation = useMutation({
    mutationFn: notificationApi.markAllAsRead,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    },
  });

  const getNotifIcon = (type: string) => {
    switch (type) {
      case "POST_REACTION":
        return <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />;
      case "POST_COMMENT":
        return <MessageSquare className="w-3.5 h-3.5 text-cyan-400" />;
      case "FRIEND_REQUEST":
      case "FRIEND_ACCEPT":
        return <UserPlus className="w-3.5 h-3.5 text-emerald-400" />;
      default:
        return <Info className="w-3.5 h-3.5 text-amber-400" />;
    }
  };

  const getNotifMessage = (notif: NotificationItem) => {
    const name = notif.sender?.name || "Someone";
    switch (notif.type) {
      case "POST_REACTION":
        return `${name} reacted to your post`;
      case "POST_COMMENT":
        return `${name} commented on your post`;
      case "FRIEND_REQUEST":
        return `${name} sent you a connection request`;
      case "FRIEND_ACCEPT":
        return `${name} accepted your connection request`;
      default:
        return `New notification from ${name}`;
    }
  };

  return (
    <header className="sticky top-0 z-30 flex items-center justify-between h-16 px-4 md:px-6 bg-sphere-card/90 backdrop-blur-md border-b border-sphere-border transition-colors">
      <Link to="/" className="flex items-center gap-2.5 group">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center shadow-md transition-transform group-hover:scale-105"
          style={{ backgroundColor: "var(--accent-btn)", color: "var(--accent-btn-text)" }}
        >
          <Globe className="w-5 h-5 animate-pulse" />
        </div>
        <div className="flex flex-col">
          <span className="text-lg font-black tracking-tight leading-none text-sphere-main">
            Sphere
          </span>
          <span className="text-[9px] font-semibold tracking-wider text-sphere-muted uppercase mt-0.5">
            Connected Minds
          </span>
        </div>
      </Link>

      <div className="flex items-center gap-2 sm:gap-3">
        {/* Search Toggle Button & Dropdown */}
        <div className="relative" ref={searchRef}>
          <button
            onClick={() => {
              setIsSearchOpen((prev) => !prev);
              if (isNotifOpen) setIsNotifOpen(false);
            }}
            className="p-2 rounded-xl text-sphere-muted hover:text-sphere-main hover:bg-sphere-base transition-colors border border-transparent hover:border-sphere-border"
            title="Search Sphere"
          >
            <Search className="w-5 h-5" />
          </button>

          {/* Search Dropdown / Overlay */}
          {isSearchOpen && (
            <div className="fixed sm:absolute left-4 right-4 sm:left-auto sm:right-0 top-16 sm:top-auto sm:mt-2 sm:w-96 rounded-2xl bg-sphere-base border border-sphere-border shadow-2xl z-50 p-3 space-y-2 animate-in fade-in duration-150">
              <div className="relative">
                <Search className="w-4 h-4 absolute left-3 top-3 text-sphere-muted pointer-events-none" />
                <input
                  type="text"
                  autoFocus
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search Sphere community..."
                  className="w-full h-10 pl-9 pr-9 rounded-xl text-xs bg-sphere-card border border-sphere-border text-sphere-main placeholder:text-sphere-muted/70 focus:outline-none transition-all"
                />
                {isSearching ? (
                  <span className="absolute right-3 top-3 text-[10px] text-sphere-muted animate-spin">
                    ●
                  </span>
                ) : (
                  <button
                    onClick={() => {
                      if (searchQuery) setSearchQuery("");
                      else setIsSearchOpen(false);
                    }}
                    className="absolute right-3 top-3 text-sphere-muted hover:text-sphere-main"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>

              {/* Live Search Results */}
              {searchQuery.trim().length >= 2 && searchResults && (
                <div className="space-y-1 max-h-60 overflow-y-auto pt-1">
                  {searchResults.length === 0 ? (
                    <p className="text-xs text-sphere-muted py-3 text-center">No members found</p>
                  ) : (
                    searchResults.map((searchUser: any) => (
                      <Link
                        key={searchUser._id || searchUser.id}
                        to={`/profile/${searchUser._id || searchUser.id}`}
                        onClick={() => {
                          setIsSearchOpen(false);
                          setSearchQuery("");
                        }}
                        className="flex items-center gap-2.5 p-2 rounded-xl hover:bg-sphere-card transition-colors"
                      >
                        <Avatar name={searchUser.name} src={searchUser.avatar || searchUser.avatarUrl} size="sm" />
                        <div className="truncate">
                          <p className="text-xs font-bold text-sphere-main truncate">{searchUser.name}</p>
                          <p className="text-[10px] text-sphere-muted truncate">{searchUser.email}</p>
                        </div>
                      </Link>
                    ))
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Theme Toggle Button */}
        <button
          onClick={toggleTheme}
          className="p-2 rounded-xl text-sphere-muted hover:text-sphere-main hover:bg-sphere-base transition-colors border border-transparent hover:border-sphere-border"
          title={`Switch to ${isDark ? "Light" : "Dark"} Mode`}
        >
          {isDark ? <Sun className="w-5 h-5 text-amber-300" /> : <Moon className="w-5 h-5 text-sphere-muted" />}
        </button>

        {/* Notifications Popover Toggle */}
        <div className="relative" ref={notifRef}>
          <button
            onClick={() => setIsNotifOpen((prev) => !prev)}
            className="p-2 rounded-xl text-sphere-muted hover:text-sphere-main hover:bg-sphere-base transition-colors relative border border-transparent hover:border-sphere-border"
            title="Notifications"
          >
            <Bell className="w-5 h-5" />
            {unreadCount > 0 && (
              <span
                className="absolute top-1 right-1 min-w-[18px] h-[18px] px-1 text-[10px] font-black flex items-center justify-center rounded-full text-white shadow-sm"
                style={{ backgroundColor: "#ef4444" }}
              >
                {unreadCount > 9 ? "9+" : unreadCount}
              </span>
            )}
          </button>

          {/* Notifications Dropdown Panel */}
          {isNotifOpen && (
            <div className="absolute right-0 mt-2 w-80 sm:w-96 rounded-2xl bg-sphere-base border border-sphere-border shadow-2xl z-50 overflow-hidden animate-in fade-in duration-150">
              {/* Header */}
              <div className="flex items-center justify-between p-3.5 border-b border-sphere-border bg-sphere-card/50">
                <div className="flex items-center gap-2">
                  <Bell className="w-4 h-4 text-sphere-main" />
                  <span className="text-xs font-bold text-sphere-main">Activity Notifications</span>
                  {unreadCount > 0 && (
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/15 text-rose-500">
                      {unreadCount} new
                    </span>
                  )}
                </div>

                {unreadCount > 0 && (
                  <button
                    onClick={() => markAllMutation.mutate()}
                    disabled={markAllMutation.isPending}
                    className="flex items-center gap-1 text-[11px] font-semibold text-sphere-muted hover:text-sphere-main transition-colors"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all read</span>
                  </button>
                )}
              </div>

              {/* List */}
              <div className="max-h-80 overflow-y-auto divide-y divide-sphere-border">
                {notifications.length === 0 ? (
                  <div className="p-8 text-center">
                    <Bell className="w-8 h-8 text-sphere-muted mx-auto mb-2 opacity-40" />
                    <p className="text-xs font-medium text-sphere-muted">No notifications yet</p>
                    <p className="text-[10px] text-sphere-muted/70 mt-0.5">
                      Updates, reactions, and friend requests will appear here.
                    </p>
                  </div>
                ) : (
                  notifications.map((notif) => {
                    const senderId = notif.sender?._id || "";
                    const linkTarget =
                      notif.type === "FRIEND_REQUEST" || notif.type === "FRIEND_ACCEPT"
                        ? `/profile/${senderId}`
                        : "/";

                    return (
                      <Link
                        key={notif._id}
                        to={linkTarget}
                        onClick={() => {
                          setIsNotifOpen(false);
                          if (!notif.read) {
                            notificationApi.markAsRead(notif._id);
                          }
                        }}
                        className={`flex items-start gap-3 p-3 transition-colors hover:bg-sphere-card/80 ${
                          !notif.read ? "bg-sphere-card/40" : ""
                        }`}
                      >
                        <div className="relative shrink-0">
                          <Avatar
                            name={notif.sender?.name || "Sphere"}
                            src={notif.sender?.avatarUrl || notif.sender?.avatar}
                            size="sm"
                          />
                          <span className="absolute -bottom-1 -right-1 p-0.5 rounded-full bg-sphere-base border border-sphere-border">
                            {getNotifIcon(notif.type)}
                          </span>
                        </div>

                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-sphere-main leading-snug">
                            {getNotifMessage(notif)}
                          </p>
                          <span className="text-[10px] text-sphere-muted mt-1 block">
                            {new Date(notif.createdAt).toLocaleDateString([], {
                              month: "short",
                              day: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </div>

                        {!notif.read && (
                          <span className="w-2 h-2 rounded-full bg-rose-500 shrink-0 mt-1" />
                        )}
                      </Link>
                    );
                  })
                )}
              </div>
            </div>
          )}
        </div>

        {/* Realtime Chat Button */}
        {onOpenChat && (
          <button
            onClick={onOpenChat}
            className="p-2 rounded-xl text-sphere-muted hover:text-sphere-main hover:bg-sphere-base transition-colors relative border border-transparent hover:border-sphere-border"
            title="Messages"
          >
            <MessageCircle className="w-5 h-5" />
            <span
              className="absolute top-1 right-1 w-2 h-2 rounded-full"
              style={{ backgroundColor: "var(--online-dot)" }}
            />
          </button>
        )}

        <Link
          to={`/profile/${user?._id || user?.id}`}
          className="flex items-center gap-2 pl-1 group"
        >
          <Avatar
            name={user?.name}
            src={user?.avatar || user?.avatarUrl}
            size="sm"
            isOnline={true}
            className="group-hover:ring-2 transition-all"
          />
        </Link>
      </div>
    </header>
  );
};
