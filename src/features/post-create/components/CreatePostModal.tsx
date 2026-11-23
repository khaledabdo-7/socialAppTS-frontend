import React, { useState, useRef } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { postApi } from "../../feed/api/post.api";
import { uploadService } from "../../../services/upload.service";
import { Modal } from "../../../components/ui/Modal";
import { Button } from "../../../components/ui/Button";
import { Input } from "../../../components/ui/Input";
import { Image, Tag, MessageSquare, X, UploadCloud, Loader2, Link2 } from "lucide-react";
import { toast } from "sonner";

interface CreatePostModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CreatePostModal: React.FC<CreatePostModalProps> = ({
  isOpen,
  onClose,
}) => {
  const queryClient = useQueryClient();
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [title, setTitle] = useState("");
  const [content, setContent] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string>("");
  const [showImageSection, setShowImageSection] = useState(false);
  const [useUrlMode, setUseUrlMode] = useState(false);
  const [tagsInput, setTagsInput] = useState("");
  const [allowComments, setAllowComments] = useState(true);

  const mutation = useMutation({
    mutationFn: postApi.createPost,
    onSuccess: () => {
      toast.success("Post created successfully! 🚀");
      queryClient.invalidateQueries({ queryKey: ["posts"] });
      handleReset();
      onClose();
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || "Failed to create post");
    },
  });

  const handleReset = () => {
    setTitle("");
    setContent("");
    setImageUrl("");
    setSelectedFile(null);
    setPreviewUrl("");
    setShowImageSection(false);
    setUseUrlMode(false);
    setTagsInput("");
    setAllowComments(true);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Please select a valid image file");
      return;
    }

    if (file.size > 15 * 1024 * 1024) {
      toast.error("Image file size should not exceed 15MB");
      return;
    }

    setSelectedFile(file);
    const objectUrl = URL.createObjectURL(file);
    setPreviewUrl(objectUrl);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !content.trim()) {
      toast.error("Please enter both a title and content");
      return;
    }

    const tags = tagsInput
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean);

    // If an image file was selected from device, link it fully server-side in 1 call
    if (selectedFile) {
      const formData = new FormData();
      formData.append("title", title.trim());
      formData.append("content", content.trim());
      formData.append("allowComments", String(allowComments));
      if (tags.length) {
        formData.append("tags", tags.join(","));
      }
      formData.append("image", selectedFile);
      mutation.mutate(formData as any);
    } else {
      mutation.mutate({
        title: title.trim(),
        content: content.trim(),
        imageUrl: imageUrl.trim() || undefined,
        tags: tags.length ? tags : undefined,
        allowComments,
      });
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Create New Post"
      description="Share what's on your mind with your community"
      maxWidth="lg"
    >
      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          placeholder="Post headline / title..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          required
        />

        <textarea
          rows={4}
          placeholder="Write your story, thoughts, or discussion..."
          value={content}
          onChange={(e) => setContent(e.target.value)}
          className="w-full p-3.5 rounded-xl text-sm bg-sphere-base border border-sphere-border text-sphere-main placeholder:text-sphere-muted/70 focus:outline-none focus:ring-1 focus:ring-sphere-accent resize-none transition-colors"
          required
        />

        {/* Media Upload Section */}
        {showImageSection && (
          <div className="space-y-3 p-3.5 bg-sphere-base rounded-2xl border border-sphere-border">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-sphere-main">Attach Photo</span>
                <button
                  type="button"
                  onClick={() => setUseUrlMode(!useUrlMode)}
                  className="text-[11px] text-sphere-muted hover:text-sphere-main underline transition-colors"
                >
                  {useUrlMode ? "Upload from device instead" : "Use image URL instead"}
                </button>
              </div>
              <button
                type="button"
                onClick={() => {
                  setShowImageSection(false);
                  setImageUrl("");
                  setSelectedFile(null);
                  setPreviewUrl("");
                  if (fileInputRef.current) fileInputRef.current.value = "";
                }}
                className="text-sphere-muted hover:text-sphere-main"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {useUrlMode ? (
              <Input
                placeholder="Paste public image link (e.g. https://...)"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
              />
            ) : (
              <div>
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="w-full h-24 border-2 border-dashed border-sphere-border rounded-xl flex flex-col items-center justify-center gap-2 hover:bg-sphere-card/50 transition-colors text-sphere-muted hover:text-sphere-main"
                >
                  <UploadCloud className="w-6 h-6" />
                  <span className="text-xs font-semibold">
                    {selectedFile ? selectedFile.name : "Click to select image from your device"}
                  </span>
                  <span className="text-[10px] text-sphere-muted/70">
                    PNG, JPG, WEBP, GIF up to 15MB
                  </span>
                </button>
              </div>
            )}

            {(previewUrl || imageUrl) && (
              <div className="relative rounded-xl overflow-hidden max-h-56 border border-sphere-border bg-sphere-card/50 flex items-center justify-center p-1">
                <img
                  src={previewUrl || imageUrl}
                  alt="Preview"
                  onError={() => toast.error("Invalid image link")}
                  className="w-full h-auto max-h-52 object-contain rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => {
                    setImageUrl("");
                    setSelectedFile(null);
                    setPreviewUrl("");
                    if (fileInputRef.current) fileInputRef.current.value = "";
                  }}
                  className="absolute top-2 right-2 p-1.5 rounded-full bg-black/60 text-white hover:bg-black/80 transition-colors"
                  title="Remove image"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            )}
          </div>
        )}

        {/* Optional Tags */}
        <Input
          leftIcon={<Tag className="w-4 h-4" />}
          placeholder="Tags (separated by commas, e.g. tech, coding, news)"
          value={tagsInput}
          onChange={(e) => setTagsInput(e.target.value)}
        />

        {/* Options Toolbar */}
        <div className="flex items-center justify-between pt-2 border-t border-sphere-border">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => setShowImageSection(!showImageSection)}
              className="p-2 rounded-xl text-sphere-muted hover:text-sphere-main hover:bg-sphere-card transition-colors flex items-center gap-1.5 text-xs font-semibold"
            >
              <Image className="w-4 h-4" />
              <span>Attach Image</span>
            </button>

            <label className="flex items-center gap-1.5 text-xs text-sphere-muted cursor-pointer select-none pl-2">
              <input
                type="checkbox"
                checked={allowComments}
                onChange={(e) => setAllowComments(e.target.checked)}
                className="rounded border-sphere-border text-sphere-accent focus:ring-sphere-accent"
              />
              <MessageSquare className="w-3.5 h-3.5" />
              <span>Allow comments</span>
            </label>
          </div>

          <div className="flex items-center gap-2">
            <Button type="button" variant="ghost" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button
              type="submit"
              size="sm"
              isLoading={mutation.isPending}
              className="px-5 font-semibold"
            >
              Publish
            </Button>
          </div>
        </div>
      </form>
    </Modal>
  );
};
