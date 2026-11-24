import React, { useState, useRef, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { profileApi } from "../api/profile.api";
import { postApi } from "../../feed/api/post.api";
import { authApi } from "../../auth/api/auth.api";
import { useAuthStore } from "../../../store/auth.store";
import { uploadService } from "../../../services/upload.service";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { Modal } from "../../../components/ui/Modal";
import { ImageLightbox } from "../../../components/ui/ImageLightbox";
import { Input } from "../../../components/ui/Input";
import { PostCard } from "../../feed/components/PostCard";
import { Skeleton } from "../../../components/ui/Skeleton";
import {
  Calendar,
  Mail,
  ShieldCheck,
  UserPlus,
  UserCheck,
  UserMinus,
  Clock,
  MessageCircle,
  MessageSquare,
  Edit3,
  Camera,
  Share2,
  Grid,
  Image as ImageIcon,
  Users,
  UploadCloud,
  Loader2,
  X,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

export const ProfilePage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const { user: currentUser, updateUser } = useAuthStore();
  const queryClient = useQueryClient();
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

  // Tab State
  const [activeTab, setActiveTab] = useState<"posts" | "media" | "connections">("posts");
  const [selectedLightboxImage, setSelectedLightboxImage] = useState<{ url: string; title?: string } | null>(null);

  // Edit Modal State
  const [isEditOpen, setIsEditOpen] = useState(false);
  const [editName, setEditName] = useState("");
  const [editBio, setEditBio] = useState("");
  const [editAvatar, setEditAvatar] = useState("");
  const [editCover, setEditCover] = useState("");
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [isRemovedAvatar, setIsRemovedAvatar] = useState(false);
  const [isRemovedCover, setIsRemovedCover] = useState(false);
  const [useAvatarUrlMode, setUseAvatarUrlMode] = useState(false);
  const [useCoverUrlMode, setUseCoverUrlMode] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const avatarFileRef = useRef<HTMLInputElement>(null);
  const coverFileRef = useRef<HTMLInputElement>(null);

  const handleAvatarFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setAvatarFile(file);
    setEditAvatar(previewUrl);
    setIsRemovedAvatar(false);
    e.target.value = "";
  };

  const handleCoverFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      toast.error("Please select an image file");
      return;
    }
    const previewUrl = URL.createObjectURL(file);
    setCoverFile(file);
    setEditCover(previewUrl);
    setIsRemovedCover(false);
    e.target.value = "";
  };

  const targetUserId = id || currentUser?._id || currentUser?.id || "";
  const isMe =
    targetUserId === currentUser?._id || targetUserId === currentUser?.id;

  const { data: profile, isLoading: isProfileLoading } = useQuery({
    queryKey: ["userProfile", targetUserId],
    queryFn: () => profileApi.getUserProfile(targetUserId),
    enabled: Boolean(targetUserId),
  });

  const { data: userPosts, isLoading: isPostsLoading } = useQuery({
    queryKey: ["userPosts", targetUserId],
    queryFn: () => postApi.getPosts(targetUserId),
    enabled: Boolean(targetUserId),
  });

  const [optimisticSent, setOptimisticSent] = useState(false);

  useEffect(() => {
    setOptimisticSent(false);
  }, [targetUserId]);

  const { data: friendsData } = useQuery({
    queryKey: ["friendsList"],
    queryFn: profileApi.getFriendsList,
    enabled: Boolean(currentUser),
  });

  const friendMutation = useMutation({
    mutationFn: () => profileApi.sendFriendRequest(targetUserId),
    onSuccess: () => {
      toast.success("Connection request sent! ✨");
      queryClient.invalidateQueries({ queryKey: ["friendsList"] });
    },
    onError: (err: any) => {
      setOptimisticSent(false);
      toast.error(err.response?.data?.message || "Failed to send request");
    },
  });

  const removeFriendMutation = useMutation({
    mutationFn: (friendId: string) => profileApi.removeFriend(friendId),
    onSuccess: () => {
      toast.success("Connection updated");
      setOptimisticSent(false);
      queryClient.invalidateQueries({ queryKey: ["friendsList"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to update connection");
    },
  });

  const acceptMutation = useMutation({
    mutationFn: (requesterId: string) => profileApi.acceptFriendRequest(requesterId),
    onSuccess: () => {
      toast.success("Connection request accepted! 🤝");
      queryClient.invalidateQueries({ queryKey: ["friendsList"] });
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to accept request");
    },
  });

  const handleOpenEdit = () => {
    const userToEdit = profile || currentUser;
    setEditName(userToEdit?.name || "");
    setEditBio(userToEdit?.bio || "");
    setEditAvatar(userToEdit?.avatar || userToEdit?.avatarUrl || "");
    setEditCover(userToEdit?.coverImage || "");
    setAvatarFile(null);
    setCoverFile(null);
    setIsRemovedAvatar(false);
    setIsRemovedCover(false);
    setIsEditOpen(true);
  };

  const handleCloseEdit = () => {
    setAvatarFile(null);
    setCoverFile(null);
    setIsRemovedAvatar(false);
    setIsRemovedCover(false);
    setIsEditOpen(false);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    const toastId = toast.loading("Saving profile changes...");
    try {
      let updatedUser: any = null;

      // 1. Upload avatar file if a new file was chosen (Server-side linking)
      if (avatarFile) {
        const res = await uploadService.uploadProfilePicture(avatarFile, "avatar");
        if (res.user) updatedUser = res.user;
      }

      // 2. Upload cover file if a new file was chosen (Server-side linking)
      if (coverFile) {
        const res = await uploadService.uploadProfilePicture(coverFile, "cover");
        if (res.user) updatedUser = res.user;
      }

      // 3. Update text fields and handle removals or manual URL mode
      const updates: any = {
        name: editName.trim(),
        bio: editBio.trim(),
      };

      if (isRemovedAvatar) {
        updates.avatar = "";
        updates.avatarUrl = "";
      } else if (useAvatarUrlMode && editAvatar) {
        updates.avatar = editAvatar.trim();
        updates.avatarUrl = editAvatar.trim();
      }

      if (isRemovedCover) {
        updates.coverImage = "";
      } else if (useCoverUrlMode && editCover) {
        updates.coverImage = editCover.trim();
      }

      const profileRes = await profileApi.updateProfile(updates);
      if (profileRes) {
        updatedUser = profileRes;
      }

      if (updatedUser) {
        updateUser(updatedUser);
      }
      queryClient.invalidateQueries({ queryKey: ["userProfile", targetUserId] });
      toast.success("Profile updated successfully! ✨", { id: toastId });
      handleCloseEdit();
    } catch (err: any) {
      toast.error(err.message || "Failed to update profile", { id: toastId });
    } finally {
      setIsSaving(false);
    }
  };

  const handleShare = () => {
    navigator.clipboard.writeText(window.location.href);
    toast.success("Profile link copied to clipboard!");
  };

  const friendsList = (friendsData?.friends || [])
    .map(
      (f: any) =>
        f.user ||
        (f.requester?._id === (currentUser?._id || currentUser?.id)
          ? f.recipient
          : f.requester) ||
        f,
    )
    .filter(Boolean);

  const isAlreadyFriend = friendsList.some((u: any) => {
    const uid = u._id || u.id;
    return uid === targetUserId;
  });

  const isOutgoingPending = (friendsData?.sentPendingRequests || []).some((f: any) => {
    const recId = f.recipient?._id || f.recipient?.id || (typeof f.recipient === "string" ? f.recipient : "");
    return recId === targetUserId;
  });

  const isIncomingPending = (friendsData?.pendingRequests || []).some((f: any) => {
    const reqId = f.requester?._id || f.requester?.id || (typeof f.requester === "string" ? f.requester : "");
    return reqId === targetUserId;
  });

  const isPending = isOutgoingPending || optimisticSent;

  if (isProfileLoading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="w-full h-48 rounded-3xl" />
        <div className="flex items-center gap-4">
          <Skeleton className="w-24 h-24 rounded-full" />
          <div className="space-y-2 flex-1">
            <Skeleton className="w-48 h-6" />
            <Skeleton className="w-32 h-4" />
          </div>
        </div>
      </div>
    );
  }

  const profileUser = profile || currentUser;
  const avatarSrc = profileUser?.avatar || profileUser?.avatarUrl || "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=80";
  const coverSrc = profileUser?.coverImage || "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=1200&auto=format&fit=crop&q=80";

  // Filter posts with images for Media tab
  const mediaPosts = (userPosts || []).filter((p) => Boolean(p.imageUrl));

  return (
    <div className="space-y-5 pb-16 transition-colors">
      
      {/* 1. Cinematic Header Banner with Ambient Gradient */}
      <div className="relative group">
        <div className="h-44 sm:h-60 w-full overflow-hidden rounded-b-3xl relative shadow-lg bg-slate-900 border-b border-sphere-border">
          <img
            src={coverSrc}
            alt="Profile Cover"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

          {/* Quick Change Cover trigger for Profile Owner */}
          {isMe && (
            <button
              onClick={handleOpenEdit}
              className="absolute top-4 right-4 px-3 py-1.5 rounded-xl text-xs font-bold text-white bg-black/60 hover:bg-black/80 backdrop-blur-md border border-white/20 transition flex items-center gap-1.5 shadow-lg"
              title="Change Cover Photo"
            >
              <Camera className="w-3.5 h-3.5" />
              <span>Change Cover</span>
            </button>
          )}

          <div className="absolute bottom-3 right-4 hidden sm:flex items-center gap-2">
            <span
              className="text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full text-white bg-black/50 backdrop-blur-md border border-white/20"
            >
              SPHERE VERIFIED
            </span>
          </div>
        </div>

        {/* 2. Avatar & Action Buttons Bar */}
        <div className="px-5 sm:px-8 flex flex-col sm:flex-row sm:items-end justify-between -mt-16 sm:-mt-20 gap-4 mb-3">
          
          {/* Avatar with Status Badge */}
          <div
            className="relative group w-28 h-28 sm:w-36 sm:h-36 rounded-3xl overflow-hidden border-4 shadow-2xl cursor-pointer"
            style={{ borderColor: "var(--surface-card)" }}
            onClick={isMe ? handleOpenEdit : undefined}
          >
            <img
              src={avatarSrc}
              alt={profileUser?.name}
              className="w-full h-full object-cover"
            />
            <span
              className="absolute bottom-2 right-2 w-4 h-4 rounded-full border-2 border-black/40"
              style={{ backgroundColor: "var(--online-dot)" }}
            />
            {isMe && (
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition flex flex-col items-center justify-center text-white text-[10px] font-bold">
                <Camera className="w-5 h-5 mb-0.5" />
                Change Photo
              </div>
            )}
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-2">
            {isMe ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={handleOpenEdit}
                  className="gap-2 px-4 shadow-md font-bold text-xs"
                >
                  <Edit3 className="w-3.5 h-3.5" />
                  <span>Edit Profile</span>
                </Button>
                <button
                  onClick={handleLogout}
                  className="py-1.5 px-3 text-xs font-bold rounded-xl border border-rose-500/30 text-rose-500 hover:bg-rose-500/10 transition flex items-center gap-1.5 cursor-pointer shadow-sm"
                  title="Log out of your account"
                >
                  <LogOut className="w-3.5 h-3.5" />
                  <span>Log Out</span>
                </button>
              </div>
            ) : isAlreadyFriend ? (
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  onClick={() => {
                    window.dispatchEvent(
                      new CustomEvent("open-chat", { detail: { friend: profileUser } })
                    );
                  }}
                  className="gap-1.5 px-3 py-1.5 text-xs font-bold"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>Message</span>
                </Button>
                <button
                  onClick={() => removeFriendMutation.mutate(targetUserId)}
                  disabled={removeFriendMutation.isPending}
                  className="py-1.5 px-3 text-xs font-bold rounded-xl border border-red-500/30 text-red-500 hover:bg-red-500/10 transition flex items-center gap-1.5 cursor-pointer"
                  title="Remove Connection"
                >
                  <UserMinus className="w-3.5 h-3.5" />
                  <span>Remove</span>
                </button>
              </div>
            ) : isPending ? (
              <button
                onClick={() => removeFriendMutation.mutate(targetUserId)}
                disabled={removeFriendMutation.isPending}
                className="py-1.5 px-3 text-xs font-bold rounded-xl border border-amber-500/40 text-amber-500 hover:bg-amber-500/10 transition flex items-center gap-1.5 cursor-pointer"
                title="Cancel pending request"
              >
                <Clock className="w-3.5 h-3.5 animate-pulse" />
                <span>Pending (Cancel)</span>
              </button>
            ) : isIncomingPending ? (
              <Button
                size="sm"
                onClick={() => acceptMutation.mutate(targetUserId)}
                isLoading={acceptMutation.isPending}
                className="gap-1.5"
              >
                <UserCheck className="w-4 h-4" />
                <span>Accept Request</span>
              </Button>
            ) : (
              <Button
                size="sm"
                onClick={() => {
                  setOptimisticSent(true);
                  friendMutation.mutate();
                }}
                isLoading={friendMutation.isPending}
                className="gap-1.5"
              >
                <UserPlus className="w-4 h-4" />
                <span>Connect</span>
              </Button>
            )}

            <button
              onClick={handleShare}
              className="p-2 rounded-xl border border-sphere-border bg-sphere-card hover:bg-sphere-base text-sphere-muted hover:text-sphere-main transition-colors shadow-sm cursor-pointer"
              title="Share Profile"
            >
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* 3. User Identity, Bio, & Metadata */}
      <div className="px-5 sm:px-8 space-y-3.5">
        <div>
          <div className="flex items-center gap-2">
            <h2 className="text-xl sm:text-2xl font-black text-sphere-main tracking-tight">
              {profileUser?.name}
            </h2>
            {profileUser?.isVerified && (
              <span title="Verified Sphere Member">
                <ShieldCheck className="w-5 h-5" style={{ color: "var(--accent-btn)" }} />
              </span>
            )}
          </div>
          <p className="text-xs font-semibold mt-0.5 text-sphere-muted">
            @{profileUser?.email?.split("@")[0]} · {profileUser?.role === "admin" ? "Sphere Architect" : "Community Member"}
          </p>
        </div>

        {/* Bio */}
        {profileUser?.bio ? (
          <p className="text-xs sm:text-sm text-sphere-main/90 leading-relaxed max-w-2xl font-normal whitespace-pre-wrap">
            {profileUser.bio}
          </p>
        ) : (
          <p className="text-xs text-sphere-muted italic">
            {isMe ? "No bio yet. Tap 'Edit Profile' to add your story." : "No bio provided."}
          </p>
        )}

        {/* Metadata Badges */}
        <div className="flex flex-wrap items-center gap-3 pt-1 text-xs text-sphere-muted">
          <div className="flex items-center gap-1.5">
            <Mail className="w-3.5 h-3.5" />
            <span>{profileUser?.email}</span>
          </div>
          <div className="flex items-center gap-1.5 capitalize">
            <Calendar className="w-3.5 h-3.5" />
            <span>Gender: {profileUser?.gender || "Not specified"}</span>
          </div>
          <div
            className="uppercase font-mono text-[9px] px-2 py-0.5 rounded-full font-bold border"
            style={{
              backgroundColor: "var(--accent-glow)",
              borderColor: "var(--border-card)",
              color: "var(--text-main)",
            }}
          >
            {profileUser?.provider || "Sphere System"}
          </div>
        </div>

        {/* 4. Community Stat Counters */}
        <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-3 border-t border-sphere-border">
          <div
            onClick={() => setActiveTab("posts")}
            className={`p-3 rounded-2xl text-center bg-sphere-card border transition-all cursor-pointer hover:border-sphere-border/80 ${
              activeTab === "posts" ? "ring-2 ring-[var(--accent-btn)]" : "border-sphere-border"
            }`}
          >
            <p className="text-base sm:text-lg font-black text-sphere-main leading-none">
              {userPosts?.length || 0}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-sphere-muted mt-1">
              Posts
            </p>
          </div>
          <div
            onClick={() => setActiveTab("connections")}
            className={`p-3 rounded-2xl text-center bg-sphere-card border transition-all cursor-pointer hover:border-sphere-border/80 ${
              activeTab === "connections" ? "ring-2 ring-[var(--accent-btn)]" : "border-sphere-border"
            }`}
          >
            <p className="text-base sm:text-lg font-black text-sphere-main leading-none">
              {friendsList.length}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-sphere-muted mt-1">
              Connections
            </p>
          </div>
          <div className="p-3 rounded-2xl text-center bg-sphere-card border border-sphere-border">
            <p className="text-base sm:text-lg font-black text-sphere-main leading-none">
              {(userPosts || []).reduce((acc, p) => acc + (p.reaction?.length || 0), 0) + 42}
            </p>
            <p className="text-[10px] font-bold uppercase tracking-wider text-sphere-muted mt-1">
              Sparks
            </p>
          </div>
        </div>
      </div>

      {/* 5. Profile Tab Bar (Posts, Media, Connections) */}
      <div className="flex items-center gap-4 px-5 sm:px-8 border-t border-b border-sphere-border bg-sphere-card/50">
        <button
          onClick={() => setActiveTab("posts")}
          className={`py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "posts"
              ? "border-current text-sphere-main"
              : "border-transparent text-sphere-muted hover:text-sphere-main"
          }`}
          style={activeTab === "posts" ? { borderColor: "var(--accent-btn)" } : {}}
        >
          <Grid className="w-3.5 h-3.5" />
          <span>Timeline Posts ({userPosts?.length || 0})</span>
        </button>

        <button
          onClick={() => setActiveTab("media")}
          className={`py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "media"
              ? "border-current text-sphere-main"
              : "border-transparent text-sphere-muted hover:text-sphere-main"
          }`}
          style={activeTab === "media" ? { borderColor: "var(--accent-btn)" } : {}}
        >
          <ImageIcon className="w-3.5 h-3.5" />
          <span>Media ({mediaPosts.length})</span>
        </button>

        <button
          onClick={() => setActiveTab("connections")}
          className={`py-3 text-xs sm:text-sm font-bold flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
            activeTab === "connections"
              ? "border-current text-sphere-main"
              : "border-transparent text-sphere-muted hover:text-sphere-main"
          }`}
          style={activeTab === "connections" ? { borderColor: "var(--accent-btn)" } : {}}
        >
          <Users className="w-3.5 h-3.5" />
          <span>Connections ({friendsList.length})</span>
        </button>
      </div>

      {/* Tab Panels */}
      <div className="px-5 sm:px-8">
        {activeTab === "posts" && (
          <div className="space-y-4">
            {isPostsLoading ? (
              <Skeleton className="w-full h-32 rounded-2xl" />
            ) : !userPosts || userPosts.length === 0 ? (
              <div className="p-8 text-center text-xs text-sphere-muted bg-sphere-card rounded-2xl border border-sphere-border">
                No posts published yet.
              </div>
            ) : (
              userPosts.map((post) => (
                <PostCard key={post._id || post.id} post={post} />
              ))
            )}
          </div>
        )}

        {activeTab === "media" && (
          <div>
            {mediaPosts.length === 0 ? (
              <div className="p-8 text-center text-xs text-sphere-muted bg-sphere-card rounded-2xl border border-sphere-border">
                No media attachments shared yet.
              </div>
            ) : (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
                {mediaPosts.map((post) => (
                  <div
                    key={post._id || post.id}
                    onClick={() =>
                      post.imageUrl &&
                      setSelectedLightboxImage({
                        url: post.imageUrl,
                        title: post.title,
                      })
                    }
                    className="aspect-square rounded-2xl overflow-hidden border border-sphere-border bg-sphere-card shadow-sm hover:scale-[1.02] hover:border-sphere-accent/50 transition-all cursor-zoom-in relative group"
                  >
                    <img
                      src={post.imageUrl}
                      alt="Media thumbnail"
                      className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-semibold backdrop-blur-[2px]">
                      <span>View Full Image</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === "connections" && (
          <div>
            {friendsList.length === 0 ? (
              <div className="p-8 text-center text-xs text-sphere-muted bg-sphere-card rounded-2xl border border-dashed border-sphere-border">
                {isMe
                  ? "No connections established yet. Discover peers in the search bar and connect!"
                  : "No connections visible for this member."}
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {friendsList.map((friendUser: any) => {
                  const friendId = friendUser._id || friendUser.id;
                  const friendAvatar = friendUser.avatar || friendUser.avatarUrl;

                  return (
                    <div
                      key={friendId}
                      className="p-3.5 rounded-2xl bg-sphere-card border border-sphere-border flex items-center justify-between gap-3 hover:border-sphere-border/80 transition-all shadow-sm"
                    >
                      <Link
                        to={`/profile/${friendId}`}
                        className="flex items-center gap-3 min-w-0 flex-1 group"
                      >
                        <Avatar
                          name={friendUser.name}
                          src={friendAvatar}
                          size="md"
                          isOnline={true}
                        />
                        <div className="truncate">
                          <p className="text-xs sm:text-sm font-bold text-sphere-main truncate group-hover:underline">
                            {friendUser.name || "Sphere Member"}
                          </p>
                          <p className="text-[11px] text-sphere-muted truncate">
                            @{friendUser.email?.split("@")[0] || "member"}
                          </p>
                        </div>
                      </Link>

                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          onClick={() => {
                            window.dispatchEvent(
                              new CustomEvent("open-chat", {
                                detail: { friend: friendUser },
                              })
                            );
                          }}
                          className="p-2 rounded-xl border border-sphere-border bg-sphere-base hover:bg-sphere-card text-sphere-muted hover:text-sphere-main transition-colors cursor-pointer"
                          title="Open direct chat"
                        >
                          <MessageCircle className="w-4 h-4" />
                        </button>
                        {isMe && (
                          <button
                            onClick={() => removeFriendMutation.mutate(friendId)}
                            disabled={removeFriendMutation.isPending}
                            className="p-2 rounded-xl border border-red-500/20 text-red-500 hover:bg-red-500/10 transition-colors cursor-pointer"
                            title="Remove connection"
                          >
                            <UserMinus className="w-4 h-4" />
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* 6. Comprehensive Edit Profile Modal */}
      <Modal
        isOpen={isEditOpen}
        onClose={handleCloseEdit}
        title="Edit Complete Sphere Profile"
        description="Update your avatar, cinematic cover photo, bio, and identity details"
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProfile} className="space-y-4">
          
          {/* Cover Photo */}
          <div className="space-y-2 p-3 rounded-2xl bg-sphere-base border border-sphere-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-sphere-muted">
                Cover Photo
              </label>
              <button
                type="button"
                onClick={() => setUseCoverUrlMode(!useCoverUrlMode)}
                className="text-[11px] text-sphere-muted hover:text-sphere-main underline"
              >
                {useCoverUrlMode ? "Upload from device" : "Use image URL"}
              </button>
            </div>

            {useCoverUrlMode ? (
              <Input
                placeholder="Paste public image link (e.g. Unsplash / Cloudinary)"
                value={editCover}
                onChange={(e) => setEditCover(e.target.value)}
              />
            ) : (
              <div>
                <input
                  type="file"
                  ref={coverFileRef}
                  accept="image/*"
                  onChange={handleCoverFile}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => coverFileRef.current?.click()}
                  className="w-full h-20 border-2 border-dashed border-sphere-border rounded-xl flex items-center justify-center gap-2 hover:bg-sphere-card transition-colors text-sphere-muted hover:text-sphere-main text-xs font-semibold"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{coverFile ? "Change selected cover photo" : "Upload cover photo from device"}</span>
                </button>
              </div>
            )}

            {editCover && (
              <div className="relative h-24 rounded-xl overflow-hidden border border-sphere-border mt-1">
                <img src={editCover} alt="Cover Preview" className="w-full h-full object-cover" />
                <button
                  type="button"
                  onClick={() => {
                    setEditCover("");
                    setCoverFile(null);
                    setIsRemovedCover(true);
                  }}
                  className="absolute top-2 right-2 p-1 rounded-full bg-black/60 text-white hover:bg-black/80"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>

          {/* Avatar Photo */}
          <div className="space-y-2 p-3 rounded-2xl bg-sphere-base border border-sphere-border">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold uppercase tracking-wider text-sphere-muted">
                Avatar Profile Picture
              </label>
              <button
                type="button"
                onClick={() => setUseAvatarUrlMode(!useAvatarUrlMode)}
                className="text-[11px] text-sphere-muted hover:text-sphere-main underline"
              >
                {useAvatarUrlMode ? "Upload from device" : "Use image URL"}
              </button>
            </div>

            {useAvatarUrlMode ? (
              <Input
                placeholder="Paste public image link"
                value={editAvatar}
                onChange={(e) => setEditAvatar(e.target.value)}
              />
            ) : (
              <div>
                <input
                  type="file"
                  ref={avatarFileRef}
                  accept="image/*"
                  onChange={handleAvatarFile}
                  className="hidden"
                />
                <button
                  type="button"
                  disabled={isSaving}
                  onClick={() => avatarFileRef.current?.click()}
                  className="w-full h-16 border-2 border-dashed border-sphere-border rounded-xl flex items-center justify-center gap-2 hover:bg-sphere-card transition-colors text-sphere-muted hover:text-sphere-main text-xs font-semibold"
                >
                  <UploadCloud className="w-4 h-4" />
                  <span>{avatarFile ? "Change selected avatar photo" : "Upload avatar photo from device"}</span>
                </button>
              </div>
            )}

            {editAvatar && (
              <div className="flex items-center gap-3 mt-1">
                <div className="w-14 h-14 rounded-2xl overflow-hidden border border-sphere-border">
                  <img src={editAvatar} alt="Avatar Preview" className="w-full h-full object-cover" />
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setEditAvatar("");
                    setAvatarFile(null);
                    setIsRemovedAvatar(true);
                  }}
                  className="text-xs text-rose-500 hover:underline"
                >
                  Remove picture
                </button>
              </div>
            )}
          </div>

          {/* Full Name */}
          <Input
            label="Full Name"
            placeholder="Your displayed name"
            value={editName}
            onChange={(e) => setEditName(e.target.value)}
            required
          />

          {/* Bio Headline */}
          <div className="space-y-1.5">
            <label className="block text-xs font-bold uppercase tracking-wider text-sphere-muted">
              Bio / Professional Headline
            </label>
            <textarea
              rows={3}
              placeholder="Share a short summary of who you are, what you build, or your passions..."
              value={editBio}
              onChange={(e) => setEditBio(e.target.value)}
              className="w-full p-3 rounded-xl text-xs bg-sphere-base border border-sphere-border text-sphere-main placeholder:text-sphere-muted/70 focus:outline-none focus:ring-1 focus:ring-sphere-accent resize-none transition-colors"
            />
          </div>

          {/* Modal Action Buttons */}
          <div className="flex justify-end gap-2 pt-3 border-t border-sphere-border">
            <Button
              type="button"
              variant="ghost"
              size="sm"
              disabled={isSaving}
              onClick={handleCloseEdit}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={isSaving}
              className="px-5 font-bold shadow-md"
            >
              Save Complete Profile
            </Button>
          </div>
        </form>
      </Modal>

      {/* Media Gallery Lightbox */}
      <ImageLightbox
        isOpen={Boolean(selectedLightboxImage)}
        onClose={() => setSelectedLightboxImage(null)}
        imageUrl={selectedLightboxImage?.url || ""}
        title={selectedLightboxImage?.title}
      />

    </div>
  );
};
