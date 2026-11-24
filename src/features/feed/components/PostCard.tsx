import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { IPost, ReactType } from "../../../types/post.types";
import { IUser } from "../../../types/auth.types";
import { Avatar } from "../../../components/ui/Avatar";
import { Modal } from "../../../components/ui/Modal";
import { ImageLightbox } from "../../../components/ui/ImageLightbox";
import { CommentSection } from "../../comments/components/CommentSection";
import { useAuthStore } from "../../../store/auth.store";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "../api/post.api";
import { formatDistanceToNow } from "date-fns";
import {
  Sparkles,
  Heart,
  Lightbulb,
  PartyPopper,
  ShieldCheck,
  Flame,
  MessageCircle,
  Share2,
  MoreHorizontal,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";
import { cn } from "../../../lib/utils";

interface PostCardProps {
  post: IPost;
}

// Bespoke Minimal Vector Reaction Configuration (No Generic System Emojis)
export const BESPOKE_REACTIONS: Record<
  ReactType,
  { label: string; icon: React.FC<{ className?: string }>; color: string; badgeBg: string }
> = {
  [ReactType.LIKE]: {
    label: "Spark",
    icon: Sparkles,
    color: "text-amber-500",
    badgeBg: "bg-amber-500/15 border-amber-500/30 text-amber-500",
  },
  [ReactType.LOVE]: {
    label: "Love",
    icon: Heart,
    color: "text-rose-500",
    badgeBg: "bg-rose-500/15 border-rose-500/30 text-rose-500",
  },
  [ReactType.HAHA]: {
    label: "Insight",
    icon: Lightbulb,
    color: "text-blue-500",
    badgeBg: "bg-blue-500/15 border-blue-500/30 text-blue-500",
  },
  [ReactType.WOW]: {
    label: "Celebrate",
    icon: PartyPopper,
    color: "text-purple-500",
    badgeBg: "bg-purple-500/15 border-purple-500/30 text-purple-500",
  },
  [ReactType.SAD]: {
    label: "Support",
    icon: ShieldCheck,
    color: "text-emerald-500",
    badgeBg: "bg-emerald-500/15 border-emerald-500/30 text-emerald-500",
  },
  [ReactType.ANGRY]: {
    label: "Energy",
    icon: Flame,
    color: "text-orange-500",
    badgeBg: "bg-orange-500/15 border-orange-500/30 text-orange-500",
  },
};

export const PostCard: React.FC<PostCardProps> = ({ post }) => {
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
  const [showComments, setShowComments] = useState(false);
  const [showReactionPicker, setShowReactionPicker] = useState(false);
  const [showReactionsModal, setShowReactionsModal] = useState(false);
  const [showImageLightbox, setShowImageLightbox] = useState(false);
  const [localReactions, setLocalReactions] = useState(post.reaction || []);
  const reactionTimeoutRef = useRef<any>(null);
  const reactionContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setLocalReactions(post.reaction || []);
  }, [post.reaction]);

  // Click outside to close reaction picker on mobile
  useEffect(() => {
    if (!showReactionPicker) return;
    const handleClickOutside = (e: MouseEvent | TouchEvent) => {
      if (
        reactionContainerRef.current &&
        !reactionContainerRef.current.contains(e.target as Node)
      ) {
        setShowReactionPicker(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("touchstart", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("touchstart", handleClickOutside);
    };
  }, [showReactionPicker]);

  const author = post.ownerId;
  const authorId = author?._id || author?.id || "";

  const timeAgo = post.createdAt
    ? formatDistanceToNow(new Date(post.createdAt), { addSuffix: true })
    : "recently";

  const currentUserId = user?._id || user?.id;

  // Find current user's reaction from optimistic state
  const userReaction = localReactions.find((r) => {
    const rUserId = typeof r.userId === "object" ? (r.userId as any)?._id || (r.userId as any)?.id : r.userId;
    return rUserId === currentUserId;
  });

  const reactMutation = useMutation({
    mutationFn: (type: ReactType) => postApi.reactToPost(post._id || post.id!, type),
    onError: (_err, _variables, context: any) => {
      if (context?.prevReactions) {
        setLocalReactions(context.prevReactions);
      }
      toast.error("Failed to update reaction");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
  });

  const handleOptimisticReact = (type: ReactType) => {
    const prevReactions = [...localReactions];
    let nextReactions: typeof localReactions;

    if (userReaction?.type === type) {
      // Toggle off
      nextReactions = localReactions.filter((r) => {
        const rUserId = typeof r.userId === "object" ? (r.userId as any)?._id || (r.userId as any)?.id : r.userId;
        return rUserId !== currentUserId;
      });
    } else {
      // Add or replace
      const filtered = localReactions.filter((r) => {
        const rUserId = typeof r.userId === "object" ? (r.userId as any)?._id || (r.userId as any)?.id : r.userId;
        return rUserId !== currentUserId;
      });
      nextReactions = [
        ...filtered,
        {
          userId: user || (currentUserId as any),
          type,
        },
      ];
    }

    setLocalReactions(nextReactions);
    setShowReactionPicker(false);

    reactMutation.mutate(type, {
      context: { prevReactions },
    } as any);
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.origin + `/post/${post._id || post.id}`);
    toast.success("Post link copied to clipboard!");
  };

  const handleMouseEnter = () => {
    if (reactionTimeoutRef.current) clearTimeout(reactionTimeoutRef.current);
    setShowReactionPicker(true);
  };

  const handleMouseLeave = () => {
    reactionTimeoutRef.current = setTimeout(() => {
      setShowReactionPicker(false);
    }, 350);
  };

  const totalReactions = localReactions.length;
  const commentCount = post.comments?.length || 0;

  // Active user reaction config
  const activeReactionConfig = userReaction ? BESPOKE_REACTIONS[userReaction.type] : null;
  const ActiveIcon = activeReactionConfig?.icon;

  return (
    <article className="p-4 sm:p-5 bg-sphere-card border border-sphere-border rounded-2xl shadow-sm hover:shadow-md transition-all space-y-3">
      {/* Post Author Header */}
      <div className="flex items-center justify-between">
        <Link
          to={`/profile/${authorId}`}
          className="flex items-center gap-3 group"
        >
          <Avatar
            name={author?.name}
            src={author?.avatar || author?.avatarUrl}
            size="md"
            isOnline={true}
          />
          <div>
            <div className="flex items-center gap-1.5">
              <h4 className="text-sm font-bold text-sphere-main group-hover:underline">
                {author?.name || "Sphere Member"}
              </h4>
              <CheckCircle2 className="w-3.5 h-3.5 text-sphere-muted" />
            </div>
            <p className="text-[11px] text-sphere-muted">{timeAgo}</p>
          </div>
        </Link>

        <button className="p-1 rounded-lg text-sphere-muted hover:text-sphere-main hover:bg-sphere-base transition-colors">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>

      {/* Post Title & Content */}
      <div className="space-y-1.5">
        {post.title && (
          <h3 className="text-sm font-bold text-sphere-main leading-snug">
            {post.title}
          </h3>
        )}
        <p className="text-xs sm:text-sm text-sphere-main/90 leading-relaxed whitespace-pre-wrap">
          {post.content}
        </p>
      </div>

      {/* Attached Media */}
      {post.imageUrl && (
        <>
          <div className="mt-3 overflow-hidden rounded-2xl border border-sphere-border bg-black/5 dark:bg-black/20">
            <img
              src={post.imageUrl}
              alt={post.title || "Post attachment"}
              className="w-full max-h-[520px] object-cover cursor-pointer hover:opacity-95 transition-opacity"
              loading="lazy"
              onClick={() => setShowImageLightbox(true)}
            />
          </div>

          <ImageLightbox
            isOpen={showImageLightbox}
            onClose={() => setShowImageLightbox(false)}
            imageUrl={post.imageUrl}
            title={post.title}
          />
        </>
      )}

      {/* Engagement Stats Bar with Clickable Reaction List Modal */}
      <div className="flex items-center justify-between text-xs text-sphere-muted pt-2 border-t border-sphere-border/60">
        <div className="flex items-center gap-1.5">
          {totalReactions > 0 ? (
            <button
              onClick={() => setShowReactionsModal(true)}
              className="flex items-center gap-1.5 hover:opacity-85 transition cursor-pointer group"
              title="See who reacted"
            >
              <div className="flex items-center -space-x-1">
                <span className="w-5 h-5 rounded-full flex items-center justify-center bg-amber-500/20 border border-amber-500/30 text-amber-500">
                  <Sparkles className="w-3 h-3" />
                </span>
                <span className="w-5 h-5 rounded-full flex items-center justify-center bg-rose-500/20 border border-rose-500/30 text-rose-500">
                  <Heart className="w-3 h-3" />
                </span>
              </div>
              <span className="font-semibold text-sphere-main text-[11px] group-hover:underline">
                {totalReactions} {totalReactions === 1 ? "reaction" : "reactions"}
              </span>
            </button>
          ) : (
            <span className="text-[11px]">Be the first to react</span>
          )}
        </div>
        <div className="flex items-center gap-3 text-[11px]">
          <span>{commentCount} comments</span>
        </div>
      </div>

      {/* Interactive Action Buttons */}
      <div className="relative flex items-center justify-between pt-1 border-t border-sphere-border/60">
        
        {/* Seamless Hover & Mobile Tap Reaction Container */}
        <div
          ref={reactionContainerRef}
          className="relative"
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
        >
          {showReactionPicker && (
            <div
              onMouseEnter={handleMouseEnter}
              onMouseLeave={handleMouseLeave}
              className="absolute -top-11 left-0 z-30 pb-2 flex items-center gap-1.5 p-1.5 bg-sphere-card border border-sphere-border rounded-2xl shadow-2xl animate-in fade-in slide-in-from-bottom-2 duration-150"
            >
              {Object.entries(BESPOKE_REACTIONS).map(([type, config]) => {
                const IconComponent = config.icon;
                return (
                  <button
                    key={type}
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleOptimisticReact(type as ReactType);
                    }}
                    className={cn(
                      "p-1.5 rounded-xl border border-transparent hover:border-sphere-border hover:bg-sphere-base transition-all transform hover:scale-125",
                      config.color,
                    )}
                    title={config.label}
                  >
                    <IconComponent className="w-4 h-4" />
                  </button>
                );
              })}
            </div>
          )}

          <button
            onClick={() => {
              // On mobile screen dimensions or touch screens: tap opens reaction picker so user can choose
              const isMobile = window.innerWidth < 768 || (typeof window !== "undefined" && window.matchMedia("(pointer: coarse)").matches);
              if (isMobile) {
                if (!showReactionPicker) {
                  setShowReactionPicker(true);
                  return;
                }
              }

              if (userReaction) {
                // toggle off current reaction
                handleOptimisticReact(userReaction.type);
              } else {
                // default instant like
                handleOptimisticReact(ReactType.LIKE);
              }
            }}
            className={cn(
              "flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all hover:bg-sphere-base",
              userReaction
                ? activeReactionConfig?.color || "text-sphere-main"
                : "text-sphere-muted hover:text-sphere-main",
            )}
          >
            {ActiveIcon ? (
              <ActiveIcon className="w-4 h-4 fill-current" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            <span>
              {activeReactionConfig ? activeReactionConfig.label : "React"}
            </span>
          </button>
        </div>

        {/* Comment Toggle */}
        <button
          onClick={() => setShowComments(!showComments)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-sphere-muted hover:text-sphere-main hover:bg-sphere-base transition-colors"
        >
          <MessageCircle className="w-4 h-4" />
          <span>Comments</span>
        </button>

        {/* Share Button */}
        <button
          onClick={handleShare}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold text-sphere-muted hover:text-sphere-main hover:bg-sphere-base transition-colors"
        >
          <Share2 className="w-4 h-4" />
          <span>Share</span>
        </button>
      </div>

      {/* Embedded Comments Section */}
      {showComments && (
        <CommentSection
          postId={post._id || post.id!}
          allowComments={post.allowComments}
        />
      )}

      {/* Who Reacted Modal */}
      <Modal
        isOpen={showReactionsModal}
        onClose={() => setShowReactionsModal(false)}
        title="Post Reactions"
        description={`${totalReactions} members reacted to this update`}
        maxWidth="sm"
      >
        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
          {(!localReactions || localReactions.length === 0) ? (
            <p className="text-xs text-sphere-muted text-center py-4">No reactions yet</p>
          ) : (
            localReactions.map((r, idx) => {
              const rUser = typeof r.userId === "object" ? (r.userId as IUser) : null;
              const rUserId = rUser?._id || rUser?.id || (r.userId as string);
              const rName = rUser?.name || "Sphere Member";
              const rAvatar = rUser?.avatar || rUser?.avatarUrl;
              const reactionConfig = BESPOKE_REACTIONS[r.type];
              const ReactionIcon = reactionConfig?.icon;

              return (
                <div
                  key={idx}
                  className="flex items-center justify-between p-2 rounded-xl bg-sphere-base/60 border border-sphere-border"
                >
                  <Link
                    to={`/profile/${rUserId}`}
                    onClick={() => setShowReactionsModal(false)}
                    className="flex items-center gap-2.5 min-w-0 group"
                  >
                    <Avatar name={rName} src={rAvatar} size="sm" isOnline={true} />
                    <span className="text-xs font-bold text-sphere-main truncate group-hover:underline">
                      {rName}
                    </span>
                  </Link>

                  {ReactionIcon && (
                    <div
                      className={cn(
                        "flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold border",
                        reactionConfig.badgeBg,
                      )}
                    >
                      <ReactionIcon className="w-3 h-3 fill-current" />
                      <span>{reactionConfig.label}</span>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </Modal>
    </article>
  );
};
