import React, { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import { Sidebar } from "./Sidebar";
import { RightSidebar } from "./RightSidebar";
import { Navbar } from "./Navbar";
import { MobileNav } from "./MobileNav";
import { CreatePostModal } from "../../features/post-create/components/CreatePostModal";
import { ChatDrawer } from "../../features/chat/components/ChatDrawer";
import { initSocket } from "../../services/socket.client";
import { useAuthStore } from "../../store/auth.store";
import { profileApi } from "../../features/profile/api/profile.api";

export const AppLayout: React.FC = () => {
  const [isCreatePostOpen, setIsCreatePostOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const { updateUser, isAuthenticated } = useAuthStore();

  useEffect(() => {
    initSocket();

    // Silently sync latest user profile (avatar, name, bio)
    if (isAuthenticated) {
      profileApi
        .getCurrentUser()
        .then((freshUser) => {
          if (freshUser) {
            updateUser(freshUser);
          }
        })
        .catch(() => {});
    }

    const handleGlobalOpenChat = () => {
      setIsChatOpen(true);
    };
    window.addEventListener("open-chat", handleGlobalOpenChat);
    return () => window.removeEventListener("open-chat", handleGlobalOpenChat);
  }, [isAuthenticated, updateUser]);

  return (
    <div className="min-h-screen bg-sphere-base flex flex-col transition-colors">
      {/* Mobile Top Navbar */}
      <div className="md:hidden">
        <Navbar
          onOpenCreatePost={() => setIsCreatePostOpen(true)}
          onOpenChat={() => setIsChatOpen(true)}
        />
      </div>

      <div className="flex-1 flex max-w-7xl w-full mx-auto justify-between">
        {/* Left Desktop Sidebar */}
        <Sidebar
          onOpenCreatePost={() => setIsCreatePostOpen(true)}
          onOpenChat={() => setIsChatOpen(true)}
        />

        {/* Center Main Content Area */}
        <main className="flex-1 min-w-0 max-w-2xl border-x border-sphere-border bg-sphere-base min-h-screen pb-24 md:pb-8 transition-colors">
          <Outlet />
        </main>

        {/* Right Desktop Sidebar */}
        <RightSidebar />
      </div>

      {/* Mobile Sticky Bottom Nav */}
      <MobileNav
        onOpenCreatePost={() => setIsCreatePostOpen(true)}
        onOpenChat={() => setIsChatOpen(true)}
      />

      {/* Global Modals & Realtime Drawers */}
      <CreatePostModal
        isOpen={isCreatePostOpen}
        onClose={() => setIsCreatePostOpen(false)}
      />

      <ChatDrawer
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />
    </div>
  );
};
