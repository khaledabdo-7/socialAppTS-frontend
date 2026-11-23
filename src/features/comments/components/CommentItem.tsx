import React from "react";
import { IComment } from "../../../types/comment.types";
import { Avatar } from "../../../components/ui/Avatar";
import { formatDistanceToNow } from "date-fns";
import { Link } from "react-router-dom";

interface CommentItemProps {
  comment: IComment;
}

export const CommentItem: React.FC<CommentItemProps> = ({ comment }) => {
  const author = comment.ownerId;
  const authorId = author?._id || author?.id || "";

  const timeAgo = comment.createdAt
    ? formatDistanceToNow(new Date(comment.createdAt), { addSuffix: true })
    : "just now";

  return (
    <div className="flex items-start gap-2.5 text-xs py-1.5 group">
      <Link to={`/profile/${authorId}`} className="shrink-0 pt-0.5">
        <Avatar name={author?.name} src={author?.avatar || author?.avatarUrl} size="sm" />
      </Link>

      <div className="flex-1 min-w-0 bg-sphere-base/60 rounded-xl px-3 py-2 border border-sphere-border">
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <Link
            to={`/profile/${authorId}`}
            className="font-bold text-[11px] text-sphere-main hover:underline truncate"
          >
            {author?.name || "Sphere Member"}
          </Link>
          <span className="text-[9px] text-sphere-muted shrink-0">{timeAgo}</span>
        </div>

        <p className="text-xs text-sphere-main/90 whitespace-pre-wrap break-words leading-relaxed">
          {comment.content}
        </p>
      </div>
    </div>
  );
};
