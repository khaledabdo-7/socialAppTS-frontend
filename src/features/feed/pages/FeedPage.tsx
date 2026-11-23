import React, { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { postApi } from "../api/post.api";
import { PostCard } from "../components/PostCard";
import { Skeleton } from "../../../components/ui/Skeleton";
import { useAuthStore } from "../../../store/auth.store";
import { Avatar } from "../../../components/ui/Avatar";
import { CreatePostModal } from "../../post-create/components/CreatePostModal";
import { Sparkles, RefreshCw, Plus } from "lucide-react";

export const FeedPage: React.FC = () => {
  const { user } = useAuthStore();
  const [activeTab, setActiveTab] = useState<"forYou" | "myPosts">("forYou");
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  const {
    data: posts,
    isLoading,
    isRefetching,
    refetch,
  } = useQuery({
    queryKey: ["posts", activeTab === "myPosts" ? user?._id || user?.id : "all"],
    queryFn: () =>
      postApi.getPosts(activeTab === "myPosts" ? user?._id || user?.id : undefined),
  });

  return (
    <div className="space-y-4 p-4 sm:p-6 transition-colors">
      {/* Top Header & Feed Filter Tabs */}
      <div className="flex items-center justify-between border-b border-sphere-border pb-3">
        <div className="flex items-center gap-4">
          <button
            onClick={() => setActiveTab("forYou")}
            className={`text-xs sm:text-sm font-bold pb-2 relative transition-colors ${
              activeTab === "forYou"
                ? "text-sphere-main"
                : "text-sphere-muted hover:text-sphere-main"
            }`}
          >
            Community Stream
            {activeTab === "forYou" && (
              <span
                className="absolute bottom-0 inset-x-0 h-0.5 rounded-full"
                style={{ backgroundColor: "var(--accent-btn)" }}
              />
            )}
          </button>

          <button
            onClick={() => setActiveTab("myPosts")}
            className={`text-xs sm:text-sm font-bold pb-2 relative transition-colors ${
              activeTab === "myPosts"
                ? "text-sphere-main"
                : "text-sphere-muted hover:text-sphere-main"
            }`}
          >
            My Posts
            {activeTab === "myPosts" && (
              <span
                className="absolute bottom-0 inset-x-0 h-0.5 rounded-full"
                style={{ backgroundColor: "var(--accent-btn)" }}
              />
            )}
          </button>
        </div>

        <button
          onClick={() => refetch()}
          disabled={isRefetching}
          className="p-1.5 text-sphere-muted hover:text-sphere-main rounded-xl hover:bg-sphere-card transition-colors"
          title="Refresh Feed"
        >
          <RefreshCw
            className={`w-4 h-4 ${isRefetching ? "animate-spin text-sphere-main" : ""}`}
          />
        </button>
      </div>

      {/* Quick Publisher Box */}
      <div className="p-3.5 sm:p-4 bg-sphere-card border border-sphere-border rounded-2xl shadow-sm flex items-center gap-3">
        <Avatar name={user?.name} src={user?.avatar || user?.avatarUrl} size="md" isOnline={true} />
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex-1 h-10 px-4 rounded-xl text-xs sm:text-sm bg-sphere-base border border-sphere-border text-left text-sphere-muted hover:text-sphere-main transition-colors flex items-center justify-between"
        >
          <span>Share thoughts in Sphere, {user?.name?.split(" ")[0]}...</span>
          <span
            className="w-6 h-6 rounded-lg flex items-center justify-center font-bold text-xs"
            style={{ backgroundColor: "var(--accent-btn)", color: "var(--accent-btn-text)" }}
          >
            <Plus className="w-3.5 h-3.5" />
          </span>
        </button>
      </div>

      {/* Posts Stream */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((n) => (
              <div
                key={n}
                className="p-5 bg-sphere-card border border-sphere-border rounded-2xl space-y-3"
              >
                <div className="flex items-center gap-3">
                  <Skeleton className="w-10 h-10 rounded-full" />
                  <div className="space-y-1.5 flex-1">
                    <Skeleton className="w-32 h-3.5" />
                    <Skeleton className="w-20 h-2.5" />
                  </div>
                </div>
                <Skeleton className="w-full h-4" />
                <Skeleton className="w-3/4 h-4" />
                <Skeleton className="w-full h-44 rounded-xl" />
              </div>
            ))}
          </div>
        ) : !posts || posts.length === 0 ? (
          <div className="py-16 text-center bg-sphere-card rounded-2xl border border-dashed border-sphere-border p-8 space-y-3">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center mx-auto"
              style={{ backgroundColor: "var(--accent-glow)", color: "var(--text-main)" }}
            >
              <Sparkles className="w-6 h-6" />
            </div>
            <h4 className="text-base font-bold text-sphere-main">
              Your Sphere Stream is Quiet
            </h4>
            <p className="text-xs text-sphere-muted max-w-sm mx-auto">
              Publish your first update or connect with peers to see live discussions!
            </p>
            <button
              onClick={() => setIsCreateOpen(true)}
              className="px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm"
              style={{ backgroundColor: "var(--accent-btn)", color: "var(--accent-btn-text)" }}
            >
              Publish First Post
            </button>
          </div>
        ) : (
          posts.map((post) => (
            <PostCard key={post._id || post.id} post={post} />
          ))
        )}
      </div>

      <CreatePostModal
        isOpen={isCreateOpen}
        onClose={() => setIsCreateOpen(false)}
      />
    </div>
  );
};
