"use client";

import { useState, useEffect, useRef } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  Typography,
  Input,
  Button,
  Avatar,
  Spin,
  Empty,
  App,
} from "antd";
import { SendOutlined, UserOutlined, MessageOutlined } from "@ant-design/icons";
import { useAuth } from "@/contexts/AuthContext";
import { getMyThreads, getMessages, sendMessage, markRead } from "@/services/chat";
import { useWebSocket } from "@/hooks/useWebSocket";
import type { ChatThread, ChatMessage, WsNewMessageEvent } from "@/types/chat";
import { formatDate } from "@/utils/format";
import SidebarLayout from "@/components/shared/SidebarLayout";

const { Text, Title } = Typography;

export default function ChatPage() {
  const { user, isAuthenticated } = useAuth();
  const queryClient = useQueryClient();
  const { message: antMessage } = App.useApp();

  const [selectedThreadId, setSelectedThreadId] = useState<string | null>(null);
  const [inputText, setInputText] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  const { data: threads = [], isLoading: threadsLoading } = useQuery({
    queryKey: ["chat", "threads"],
    queryFn: getMyThreads,
    enabled: isAuthenticated,
    refetchInterval: 30000,
  });

  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ["chat", "messages", selectedThreadId],
    queryFn: () => getMessages(selectedThreadId!),
    enabled: !!selectedThreadId,
  });

  const sendMutation = useMutation({
    mutationFn: (body: string) => sendMessage(selectedThreadId!, { body }),
    onSuccess: () => {
      setInputText("");
      queryClient.invalidateQueries({ queryKey: ["chat", "messages", selectedThreadId] });
    },
    onError: () => antMessage.error("ส่งข้อความไม่สำเร็จ"),
  });

  // WebSocket for real-time updates
  const wsPath = selectedThreadId ? `/api/v1/ws/chat/${selectedThreadId}` : null;
  useWebSocket(wsPath, {
    enabled: isAuthenticated && !!selectedThreadId,
    onMessage: (event) => {
      try {
        const data = JSON.parse(event.data) as WsNewMessageEvent;
        if (data.type === "new_message") {
          queryClient.invalidateQueries({ queryKey: ["chat", "messages", selectedThreadId] });
        }
      } catch {
        // ignore parse errors
      }
    },
  });

  useEffect(() => {
    if (selectedThreadId) {
      markRead(selectedThreadId).catch(() => {});
    }
  }, [selectedThreadId, messages.length]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSelectThread = (threadId: string) => {
    setSelectedThreadId(threadId);
  };

  const handleSend = () => {
    const trimmed = inputText.trim();
    if (!trimmed || sendMutation.isPending) return;
    sendMutation.mutate(trimmed);
  };

  const getOtherParticipant = (thread: ChatThread) => {
    return thread.participants.find((p) => p.user_id !== user?.users_id);
  };

  const menuItems = threads.map((thread) => {
    const other = getOtherParticipant(thread);
    return {
      key: thread.chat_thread_id,
      label: (
        <div className="flex items-center gap-2 py-1">
          <Avatar size={32} icon={<UserOutlined />} className="bg-gray-200 text-gray-600 flex-shrink-0" />
          <div className="flex-1 min-w-0">
            <Text strong className="text-sm block truncate">
              {other?.user?.username || "User"}
            </Text>
            <Text type="secondary" className="text-xs truncate block">
              {thread.order_id ? `คำสั่งซื้อ` : "แชท"}
            </Text>
          </div>
        </div>
      ),
    };
  });

  if (!isAuthenticated) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Empty description="กรุณาเข้าสู่ระบบเพื่อใช้งานแชท" />
      </div>
    );
  }

  const selectedThread = threads.find((t) => t.chat_thread_id === selectedThreadId);
  const otherUser = selectedThread ? getOtherParticipant(selectedThread) : null;

  return (
    <SidebarLayout
      title="แชท"
      menuItems={threadsLoading ? [] : menuItems}
      selectedKey={selectedThreadId || ""}
      onMenuClick={handleSelectThread}
      header={
        <div className="flex items-center gap-2">
          <MessageOutlined className="text-xl text-black" />
          <Text strong className="text-base">ข้อความ</Text>
        </div>
      }
    >
      {!selectedThreadId ? (
        <div className="flex flex-col items-center justify-center h-full min-h-[60vh] text-center">
          <MessageOutlined className="text-6xl text-gray-200 mb-4" />
          <Title level={4} className="text-gray-400">เลือกบทสนทนา</Title>
          <Text type="secondary">เลือกผู้ติดต่อจากรายการด้านซ้ายเพื่อเริ่มแชท</Text>
        </div>
      ) : (
        <div className="flex flex-col h-[calc(100vh-130px)]">
          {/* Thread header */}
          <div className="pb-4 mb-4 border-b border-gray-100 flex items-center gap-3">
            <Avatar icon={<UserOutlined />} className="bg-black text-white" />
            <Text strong className="text-base">
              {otherUser?.user?.username || "User"}
            </Text>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {messagesLoading ? (
              <div className="flex justify-center py-8">
                <Spin />
              </div>
            ) : messages.length === 0 ? (
              <div className="flex justify-center py-8">
                <Text type="secondary">ยังไม่มีข้อความ เริ่มสนทนาได้เลย</Text>
              </div>
            ) : (
              messages.map((msg: ChatMessage) => {
                const isMe = msg.sender_id === user?.users_id;
                return (
                  <div
                    key={msg.chat_message_id}
                    className={`flex ${isMe ? "justify-end" : "justify-start"}`}
                  >
                    <div
                      className={`max-w-[70%] rounded-lg px-4 py-2 ${
                        isMe
                          ? "bg-black text-white"
                          : "bg-gray-100 text-gray-900"
                      }`}
                    >
                      <Text className={isMe ? "text-white" : "text-gray-900"}>
                        {msg.body}
                      </Text>
                      <div className={`text-xs mt-1 ${isMe ? "text-gray-300" : "text-gray-400"}`}>
                        {formatDate(msg.created_at, true)}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
            <div ref={bottomRef} />
          </div>

          {/* Input */}
          <div className="pt-4 border-t border-gray-100 flex gap-2">
            <Input
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              onPressEnter={handleSend}
              placeholder="พิมพ์ข้อความ..."
              maxLength={2000}
              className="flex-1"
            />
            <Button
              type="primary"
              icon={<SendOutlined />}
              onClick={handleSend}
              loading={sendMutation.isPending}
              disabled={!inputText.trim()}
            />
          </div>
        </div>
      )}
    </SidebarLayout>
  );
}
