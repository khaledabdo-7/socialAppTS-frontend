import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../../features/profile/api/profile.api";
import { useAuthStore } from "../../store/auth.store";
import { Avatar } from "../ui/Avatar";
import { Search, UserCheck, UserX, Users, Globe } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";

export const RightSidebar: React.FC = () => {
  const queryClient = useQueryClient();
  const { user: currentUser } = useAuthStore();
  const [searchQuery, setSearchQuery] = useState("");

  const { data: friendsData } = useQuery({
    queryKey: ["friendsList"],
    queryFn: profileApi.getFriendsList,
  });

  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    queryFn: () => profileApi.searchUsers(searchQuery),
    enabled: searchQuery.trim().length >= 2,
  });

  const acceptMutation = useMutation({
    mutationFn: (requesterId: string) => profileApi.acceptFriendRequest(requesterId),
    onSuccess: () => {
      toast.success("Connection accepted!");
      queryClient.invalidateQueries({ queryKey: ["friendsList"] });
    },
    onError: () => toast.error("Failed to accept connection"),
  });

  const rejectMutation = useMutation({
    mutationFn: (requesterId: string) => profileApi.rejectFriendRequest(requesterId),
    onSuccess: () => {
      toast.info("Connection declined");
      queryClient.invalidateQueries({ queryKey: ["friendsList"] });
    },
    onError: () => toast.error("Failed to decline connection"),
  });

  const pendingRequests = friendsData?.pendingRequests || [];
  const friends = friendsData?.friends || [];

  return (
    <aside className="hidden xl:block w-80 h-screen sticky top-0 p-5 border-l border-sphere-border bg-sphere-card/75 backdrop-blur-md space-y-5 overflow-y-auto transition-colors">
      {/* Realtime Search Input */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-sphere-muted pointer-events-none" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Sphere community..."
          className="w-full h-10 pl-9 pr-4 rounded-xl text-xs bg-sphere-base border border-sphere-border text-sphere-main placeholder:text-sphere-muted/70 focus:outline-none transition-all"
        />
        {isSearching && (
          <span className="absolute right-3 top-3 text-[10px] text-sphere-muted animate-spin">
            ●
          </span>
        )}
      </div>

      {/* Live Search Results Dropdown */}
      {searchQuery.trim().length >= 2 && searchResults && (
        <div className="rounded-xl p-3 bg-sphere-base border border-sphere-border space-y-2 shadow-lg">
          <p className="text-[10px] uppercase font-bold text-sphere-muted tracking-wider">
            Search Results ({searchResults.length})
          </p>
          <div className="space-y-1.5 max-h-48 overflow-y-auto">
            {searchResults.length === 0 ? (
              <p className="text-xs text-sphere-muted py-2 text-center">No members found</p>
            ) : (
              searchResults.map((user: any) => (
                <Link
                  key={user._id || user.id}
                  to={`/profile/${user._id || user.id}`}
                  className="flex items-center gap-2.5 p-1.5 rounded-lg hover:bg-sphere-card transition-colors"
                >
                  <Avatar name={user.name} src={user.avatar || user.avatarUrl} size="sm" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-sphere-main truncate">{user.name}</p>
                    <p className="text-[10px] text-sphere-muted truncate">{user.email}</p>
                  </div>
                </Link>
              ))
            )}
          </div>
        </div>
      )}

      {/* Incoming Connection Requests */}
      <div className="rounded-2xl p-4 bg-sphere-base border border-sphere-border space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-sphere-main flex items-center gap-2">
            <Users className="w-4 h-4 text-sphere-muted" />
            Connection Requests
          </h3>
          <span
            className="text-[10px] font-bold px-2 py-0.5 rounded-full"
            style={{ backgroundColor: "var(--accent-glow)", color: "var(--text-main)" }}
          >
            {pendingRequests.length}
          </span>
        </div>

        {pendingRequests.length === 0 ? (
          <p className="text-xs text-sphere-muted py-2 text-center">No pending requests</p>
        ) : (
          <div className="space-y-2 pt-1">
            {pendingRequests.map((req) => (
              <div
                key={req._id}
                className="flex items-center justify-between gap-2 p-2 rounded-xl bg-sphere-card/50 border border-sphere-border hover:bg-sphere-card transition-colors"
              >
                <Link
                  to={`/profile/${req.requester?._id || (req.requester as any)?.id}`}
                  className="flex items-center gap-2 min-w-0"
                >
                  <Avatar name={req.requester?.name} src={req.requester?.avatar || req.requester?.avatarUrl} size="sm" />
                  <div className="truncate">
                    <p className="text-xs font-bold text-sphere-main truncate">
                      {req.requester?.name}
                    </p>
                    <p className="text-[10px] text-sphere-muted truncate">
                      {req.requester?.email}
                    </p>
                  </div>
                </Link>

                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() =>
                      acceptMutation.mutate(req.requester?._id || (req.requester as any)?.id || "")
                    }
                    disabled={acceptMutation.isPending}
                    className="p-1.5 rounded-lg font-bold transition shadow-sm"
                    style={{ backgroundColor: "var(--accent-btn)", color: "var(--accent-btn-text)" }}
                    title="Accept"
                  >
                    <UserCheck className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() =>
                      rejectMutation.mutate(req.requester?._id || (req.requester as any)?.id || "")
                    }
                    disabled={rejectMutation.isPending}
                    className="p-1.5 rounded-lg border border-sphere-border text-sphere-muted hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                    title="Decline"
                  >
                    <UserX className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Active Online Connections */}
      <div className="rounded-2xl p-4 bg-sphere-base border border-sphere-border space-y-3 shadow-sm">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-sphere-main flex items-center gap-2">
            <span
              className="w-2 h-2 rounded-full inline-block"
              style={{ backgroundColor: "var(--online-dot)" }}
            />
            Live Connections
          </h3>
          <span className="text-[10px] text-sphere-muted font-semibold">
            {friends.length} active
          </span>
        </div>

        <div className="space-y-1">
          {friends.length === 0 ? (
            <p className="text-xs text-sphere-muted py-2 text-center">
              Connect with friends to see them live
            </p>
          ) : (
            friends.slice(0, 6).map((f) => {
              const friendUser: any =
                f.user ||
                (f.requester?._id === (currentUser?._id || currentUser?.id)
                  ? f.recipient
                  : f.requester) ||
                f;
              const friendId = friendUser?._id || friendUser?.id || f._id;

              return (
                <Link
                  key={f._id}
                  to={`/profile/${friendId}`}
                  className="flex items-center justify-between p-2 rounded-xl hover:bg-sphere-card transition-colors group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="relative">
                      <Avatar
                        name={friendUser?.name}
                        src={friendUser?.avatar || friendUser?.avatarUrl}
                        size="sm"
                        isOnline={true}
                      />
                    </div>
                    <div className="truncate">
                      <p className="text-xs font-bold text-sphere-main truncate group-hover:underline">
                        {friendUser?.name}
                      </p>
                      <p className="text-[10px] text-sphere-muted truncate">
                        Online in Sphere
                      </p>
                    </div>
                  </div>
                  <Globe className="w-3.5 h-3.5 text-sphere-muted opacity-50 group-hover:opacity-100" />
                </Link>
              );
            })
          )}
        </div>
      </div>
    </aside>
  );
};
