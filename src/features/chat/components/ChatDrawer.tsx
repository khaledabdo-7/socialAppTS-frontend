import React, { useState, useEffect, useRef } from "react";
import { getSocket, initSocket } from "../../../services/socket.client";
import { useAuthStore } from "../../../store/auth.store";
import { useQuery } from "@tanstack/react-query";
import { profileApi } from "../../profile/api/profile.api";
import { chatApi } from "../api/chat.api";
import { Avatar } from "../../../components/ui/Avatar";
import { Button } from "../../../components/ui/Button";
import { MessageResponse } from "../../../types/socket.types";
import { IUser } from "../../../types/auth.types";
import { X, Send, MessageCircle, ChevronLeft, Loader2 } from "lucide-react";

interface ChatDrawerProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ChatDrawer: React.FC<ChatDrawerProps> = ({ isOpen, onClose }) => {
  const { user } = useAuthStore();
  const [activeFriend, setActiveFriend] = useState<IUser | null>(null);
  const [messages, setMessages] = useState<MessageResponse[]>([]);
  const [inputMessage, setInputMessage] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isLoadingHistory, setIsLoadingHistory] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const { data: friendsData } = useQuery({
    queryKey: ["friendsList"],
    queryFn: profileApi.getFriendsList,
    enabled: isOpen,
  });

  const friends = (friendsData?.friends || [])
    .map(
      (f: any) =>
        f.user ||
        (f.requester?._id === (user?._id || user?.id)
          ? f.recipient
          : f.requester) ||
        f,
    )
    .filter(Boolean);

  // Initialize socket and listen to realtime events
  useEffect(() => {
    if (!isOpen) return;

    const socket = initSocket();
    if (!socket) return;

    const handleReceiveMessage = (msg: MessageResponse) => {
      const activeId = activeFriend?._id || activeFriend?.id;
      if (
        activeId &&
        (msg.senderId === activeId ||
          msg.receiverId === activeId ||
          (msg as any).recipientId === activeId)
      ) {
        setMessages((prev) => [...prev, msg]);
      }
    };

    const handleUserTyping = (data: { userId: string; isTyping: boolean }) => {
      if (activeFriend && (activeFriend._id === data.userId || activeFriend.id === data.userId)) {
        setIsTyping(data.isTyping);
      }
    };

    socket.on("receiveMessage", handleReceiveMessage);
    socket.on("userTyping", handleUserTyping);

    return () => {
      socket.off("receiveMessage", handleReceiveMessage);
      socket.off("userTyping", handleUserTyping);
    };
  }, [isOpen, activeFriend]);

  // Support global open-chat event to directly target a specific friend
  useEffect(() => {
    const handleCustomOpenChat = (e: any) => {
      if (e.detail?.friend) {
        setActiveFriend(e.detail.friend);
      }
    };
    window.addEventListener("open-chat", handleCustomOpenChat);
    return () => window.removeEventListener("open-chat", handleCustomOpenChat);
  }, []);

  // Load chat history when active friend changes
  useEffect(() => {
    if (!activeFriend) return;
    const friendId = activeFriend._id || activeFriend.id;
    if (!friendId) return;

    let isMounted = true;
    setIsLoadingHistory(true);

    chatApi
      .getChatHistory(friendId)
      .then((res) => {
        if (!isMounted) return;
        const history = res.messages || [];
        const formatted: MessageResponse[] = history.map((m) => ({
          _id: m._id,
          senderId: typeof m.senderId === "object" ? m.senderId._id : m.senderId,
          receiverId: typeof m.receiverId === "object" ? m.receiverId._id : m.receiverId,
          recipientId: typeof m.receiverId === "object" ? m.receiverId._id : m.receiverId,
          message: m.message,
          timestamp: m.createdAt,
        }));
        setMessages(formatted);
        chatApi.markChatAsRead(friendId).catch(() => {});
      })
      .catch((err) => {
        console.error("Failed to load chat history:", err);
      })
      .finally(() => {
        if (isMounted) setIsLoadingHistory(false);
      });

    return () => {
      isMounted = false;
    };
  }, [activeFriend]);

  // Scroll to bottom on new message
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isTyping]);

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim() || !activeFriend) return;

    const friendId = activeFriend._id || activeFriend.id;
    const socket = getSocket();

    if (socket) {
      socket.emit("sendMessage", {
        receiverId: friendId,
        recipientId: friendId,
        message: inputMessage.trim(),
      });

      // Optimistic local update
      setMessages((prev) => [
        ...prev,
        {
          senderId: user?._id || user?.id || "",
          receiverId: friendId,
          recipientId: friendId,
          message: inputMessage.trim(),
          timestamp: new Date().toISOString(),
        },
      ]);
    }

    setInputMessage("");
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setInputMessage(e.target.value);
    const socket = getSocket();
    if (socket && activeFriend) {
      const friendId = activeFriend._id || activeFriend.id;
      socket.emit("typing", {
        receiverId: friendId,
        recipientId: friendId,
        isTyping: e.target.value.length > 0,
      });
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-y-0 right-0 z-50 w-full sm:w-96 bg-sphere-card border-l border-sphere-border shadow-2xl flex flex-col transition-all duration-300">
      {/* Drawer Header */}
      <div className="flex items-center justify-between p-4 border-b border-sphere-border bg-sphere-base">
        <div className="flex items-center gap-2">
          {activeFriend && (
            <button
              onClick={() => setActiveFriend(null)}
              className="p-1 rounded-lg text-sphere-muted hover:text-sphere-main hover:bg-sphere-card transition-colors mr-1"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
          )}
          <div className="flex items-center gap-2">
            {activeFriend ? (
              <>
                <Avatar
                  name={activeFriend.name}
                  src={activeFriend.avatar || activeFriend.avatarUrl}
                  size="sm"
                  isOnline={true}
                />
                <div>
                  <h3 className="text-sm font-bold text-sphere-main truncate max-w-[160px]">
                    {activeFriend.name}
                  </h3>
                  <p className="text-[10px] text-sphere-muted">
                    Active in Sphere
                  </p>
                </div>
              </>
            ) : (
              <>
                <div
                  className="w-8 h-8 rounded-xl flex items-center justify-center font-bold text-xs"
                  style={{ backgroundColor: "var(--accent-glow)", color: "var(--text-main)" }}
                >
                  <MessageCircle className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-sphere-main">
                    Sphere Chat
                  </h3>
                  <p className="text-[10px] text-sphere-muted">
                    Realtime Direct Messages
                  </p>
                </div>
              </>
            )}
          </div>
        </div>

        <button
          onClick={onClose}
          className="p-1.5 rounded-xl text-sphere-muted hover:text-sphere-main hover:bg-sphere-card transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      </div>

      {/* Drawer Content */}
      {!activeFriend ? (
        <div className="flex-1 p-3 overflow-y-auto space-y-1">
          <p className="text-xs font-bold text-sphere-muted px-2 py-1 uppercase tracking-wider">
            Connected Friends
          </p>
          {friends.length === 0 ? (
            <div className="text-center py-12 px-4 space-y-2">
              <MessageCircle className="w-8 h-8 text-sphere-muted mx-auto opacity-50" />
              <p className="text-xs text-sphere-muted">
                No active friends yet. Add friends from the search bar to chat!
              </p>
            </div>
          ) : (
            friends.map((f) => (
              <button
                key={f._id || f.id}
                onClick={() => {
                  setActiveFriend(f);
                  setMessages([]);
                }}
                className="w-full flex items-center gap-3 p-2.5 rounded-2xl hover:bg-sphere-base transition-colors text-left"
              >
                <Avatar
                  name={f.name}
                  src={f.avatar || f.avatarUrl}
                  size="sm"
                  isOnline={true}
                />
                <div className="flex-1 truncate">
                  <p className="text-sm font-semibold text-sphere-main truncate">
                    {f.name}
                  </p>
                  <p className="text-xs text-sphere-muted truncate">Tap to message</p>
                </div>
              </button>
            ))
          )}
        </div>
      ) : (
        <div className="flex-1 flex flex-col justify-between overflow-hidden">
          {/* Chat Messages */}
          <div className="flex-1 p-4 overflow-y-auto space-y-3 bg-sphere-base">
            {isLoadingHistory ? (
              <div className="flex flex-col items-center justify-center py-12 space-y-2 text-sphere-muted">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span className="text-xs">Loading message history...</span>
              </div>
            ) : messages.length === 0 ? (
              <p className="text-center text-xs text-sphere-muted py-10">
                Say hello to {activeFriend.name}!
              </p>
            ) : (
              messages.map((m, idx) => {
                const isMe = m.senderId === (user?._id || user?.id);
                return (
                  <div
                    key={idx}
                    className={`flex flex-col ${isMe ? "items-end" : "items-start"}`}
                  >
                    <div
                      className={`max-w-[78%] px-3.5 py-2 rounded-2xl text-xs sm:text-sm shadow-sm ${
                        isMe
                          ? "rounded-br-sm font-medium"
                          : "bg-sphere-card text-sphere-main border border-sphere-border rounded-bl-sm"
                      }`}
                      style={
                        isMe
                          ? { backgroundColor: "var(--accent-btn)", color: "var(--accent-btn-text)" }
                          : {}
                      }
                    >
                      {m.message}
                    </div>
                    <span className="text-[9px] text-sphere-muted px-1 mt-0.5">
                      {new Date(m.timestamp).toLocaleTimeString([], {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                  </div>
                );
              })
            )}

            {isTyping && (
              <div className="text-xs text-sphere-muted italic animate-pulse">
                {activeFriend.name} is typing...
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Chat Input Bar */}
          <form
            onSubmit={handleSendMessage}
            className="p-3 border-t border-sphere-border bg-sphere-card flex items-center gap-2"
          >
            <input
              type="text"
              placeholder={`Message ${activeFriend.name}...`}
              value={inputMessage}
              onChange={handleInputChange}
              className="flex-1 h-10 px-3.5 rounded-xl text-xs bg-sphere-base border border-sphere-border text-sphere-main focus:outline-none focus:ring-1 focus:ring-sphere-accent"
            />
            <Button
              type="submit"
              size="sm"
              disabled={!inputMessage.trim()}
              className="rounded-xl px-3"
            >
              <Send className="w-4 h-4" />
            </Button>
          </form>
        </div>
      )}
    </div>
  );
};
