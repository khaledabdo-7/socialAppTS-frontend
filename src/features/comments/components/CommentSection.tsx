import React, { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { commentApi } from "../api/comment.api";
import { CommentItem } from "./CommentItem";
import { useAuthStore } from "../../../store/auth.store";
import { Avatar } from "../../../components/ui/Avatar";
import { Send, MessageSquare } from "lucide-react";
import { toast } from "sonner";

interface CommentSectionProps {
  postId: string;
  allowComments?: boolean;
}

export const CommentSection: React.FC<CommentSectionProps> = ({
  postId,
  allowComments = true,
}) => {
  const queryClient = useQueryClient();
  const { user } = useAuthStore();
  const [content, setContent] = useState("");

  const { data: comments, isLoading } = useQuery({
    queryKey: ["comments", postId],
    queryFn: () => commentApi.getCommentsByPostId(postId),
  });

  const mutation = useMutation({
    mutationFn: commentApi.createComment,
    onSuccess: () => {
      setContent("");
      queryClient.invalidateQueries({ queryKey: ["comments", postId] });
      queryClient.invalidateQueries({ queryKey: ["posts"] });
    },
    onError: () => {
      toast.error("Failed to post comment");
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) return;

    mutation.mutate({
      postId,
      content: content.trim(),
    });
  };

  if (!allowComments) {
    return (
      <div className="py-2.5 px-3 text-[11px] text-sphere-muted bg-sphere-base/60 rounded-xl text-center border border-sphere-border">
        Comments are disabled on this post.
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-3 border-t border-sphere-border/60">
      {/* Comment Composer */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <Avatar name={user?.name} src={user?.avatar || user?.avatarUrl} size="sm" />
        <div className="flex-1 relative flex items-center">
          <input
            type="text"
            placeholder="Write a thoughtful comment..."
            value={content}
            onChange={(e) => setContent(e.target.value)}
            className="w-full h-9 pl-3.5 pr-9 rounded-xl text-xs bg-sphere-base border border-sphere-border text-sphere-main placeholder:text-sphere-muted/70 focus:outline-none transition-colors"
          />
          <button
            type="submit"
            disabled={!content.trim() || mutation.isPending}
            className="absolute right-2 p-1 text-sphere-muted hover:text-sphere-main disabled:opacity-30 transition-opacity"
          >
            <Send className="w-3.5 h-3.5" />
          </button>
        </div>
      </form>

      {/* Comment List */}
      <div className="space-y-1">
        {isLoading ? (
          <div className="py-3 text-center text-xs text-sphere-muted animate-pulse">
            Loading comments...
          </div>
        ) : !comments || comments.length === 0 ? (
          <div className="py-2.5 text-center text-[11px] text-sphere-muted flex items-center justify-center gap-1.5">
            <MessageSquare className="w-3.5 h-3.5" />
            <span>No comments yet. Be the first to share your perspective!</span>
          </div>
        ) : (
          comments.map((comment) => (
            <CommentItem key={comment._id || comment.id} comment={comment} />
          ))
        )}
      </div>
    </div>
  );
};
