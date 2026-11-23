import React from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { Avatar } from "../../../components/ui/Avatar";
import { Users, UserCheck, UserX } from "lucide-react";
import { toast } from "sonner";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../store/auth.store";

export const FriendsPage: React.FC = () => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();

  const { data: friendsData, isLoading } = useQuery({
    queryKey: ["friendsList"],
    queryFn: profileApi.getFriendsList,
  });

  const acceptMutation = useMutation({
    mutationFn: (requesterId: string) => profileApi.acceptFriendRequest(requesterId),
    onSuccess: () => {
      toast.success("Accepted connection request!");
      queryClient.invalidateQueries({ queryKey: ["friendsList"] });
    },
  });

  const rejectMutation = useMutation({
    mutationFn: (requesterId: string) => profileApi.rejectFriendRequest(requesterId),
    onSuccess: () => {
      toast.info("Declined connection request");
      queryClient.invalidateQueries({ queryKey: ["friendsList"] });
    },
  });

  const friends = friendsData?.friends || [];
  const pendingRequests = friendsData?.pendingRequests || [];

  return (
    <div className="p-4 sm:p-6 space-y-6 transition-colors">
      <div className="flex items-center gap-3 pb-3 border-b border-sphere-border">
        <div
          className="w-10 h-10 rounded-2xl flex items-center justify-center font-bold"
          style={{ backgroundColor: "var(--accent-glow)", color: "var(--text-main)" }}
        >
          <Users className="w-5 h-5" />
        </div>
        <div>
          <h2 className="text-lg font-bold text-sphere-main">
            Sphere Connections
          </h2>
          <p className="text-xs text-sphere-muted">
            Manage your network, peers, and connection requests
          </p>
        </div>
      </div>

      {/* Pending Requests Section */}
      {pendingRequests.length > 0 && (
        <div className="space-y-3">
          <h3 className="text-xs font-bold text-sphere-main uppercase tracking-wider">
            Pending Requests ({pendingRequests.length})
          </h3>
          <div className="grid gap-3 sm:grid-cols-2">
            {pendingRequests.map((req) => (
              <div
                key={req._id}
                className="p-3.5 bg-sphere-card rounded-2xl border border-sphere-border flex items-center justify-between"
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Avatar
                    name={req.requester?.name}
                    src={req.requester?.avatar || req.requester?.avatarUrl}
                    size="md"
                  />
                  <div className="truncate">
                    <p className="text-xs font-bold text-sphere-main truncate">
                      {req.requester?.name}
                    </p>
                    <p className="text-[10px] text-sphere-muted truncate">{req.requester?.email}</p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <button
                    onClick={() =>
                      acceptMutation.mutate(req.requester?._id || req.requester?.id || "")
                    }
                    className="p-1.5 rounded-xl font-bold transition shadow-sm"
                    style={{ backgroundColor: "var(--accent-btn)", color: "var(--accent-btn-text)" }}
                    title="Accept"
                  >
                    <UserCheck className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() =>
                      rejectMutation.mutate(req.requester?._id || req.requester?.id || "")
                    }
                    className="p-1.5 rounded-xl border border-sphere-border text-sphere-muted hover:bg-rose-500/10 hover:text-rose-500 transition-colors"
                    title="Decline"
                  >
                    <UserX className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Friends List Section */}
      <div className="space-y-3">
        <h3 className="text-xs font-bold text-sphere-main uppercase tracking-wider">
          All Connections ({friends.length})
        </h3>

        {isLoading ? (
          <div className="py-8 text-center text-xs text-sphere-muted animate-pulse">
            Loading connections...
          </div>
        ) : friends.length === 0 ? (
          <div className="p-8 text-center text-xs text-sphere-muted bg-sphere-card rounded-2xl border border-dashed border-sphere-border">
            No connections established yet. Discover peers in the search bar and connect!
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2">
            {friends.map((f) => {
              const friendUser: any =
                f.user ||
                (f.requester?._id === (user?._id || user?.id)
                  ? f.recipient
                  : f.requester) ||
                f;
              return (
                <div
                  key={f._id}
                  className="p-3.5 bg-sphere-card rounded-2xl border border-sphere-border flex items-center justify-between"
                >
                  <Link
                    to={`/profile/${friendUser?._id || friendUser?.id}`}
                    className="flex items-center gap-3 min-w-0"
                  >
                    <Avatar
                      name={friendUser?.name}
                      src={friendUser?.avatar || friendUser?.avatarUrl}
                      size="md"
                      isOnline={true}
                    />
                    <div className="truncate">
                      <p className="text-xs font-bold text-sphere-main truncate hover:underline">
                        {friendUser?.name}
                      </p>
                      <p className="text-[10px] text-sphere-muted truncate">
                        {friendUser?.email}
                      </p>
                    </div>
                  </Link>

                  <Link
                    to={`/profile/${friendUser?._id || friendUser?.id}`}
                    className="p-1.5 rounded-xl text-sphere-muted hover:text-sphere-main hover:bg-sphere-base transition-colors"
                    title="View Profile"
                  >
                    <UserCheck className="w-4 h-4" />
                  </Link>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};
