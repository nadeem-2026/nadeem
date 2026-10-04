"use client";

import type { BookingMessages } from "@/lib/bookings/types";

import { useEffect, useState, useRef } from "react";
import { createBrowserClient } from "@/lib/auth/client";

export function ChatRoom({ 
  bookingId, 
  userId, 
  m,
  active
}: { 
  bookingId: string; 
  userId: string; 
  m: BookingMessages;
  active: boolean;
}) {
  const [messages, setMessages] = useState<{ id: string; sender_id: string; message: string }[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const supabase = createBrowserClient();
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Fetch existing messages
    supabase
      .from("chat_messages")
      .select("*")
      .eq("booking_id", bookingId)
      .order("created_at", { ascending: true })
      .then(({ data }) => {
        if (data) setMessages(data);
      });

    // Subscribe to new messages
    const channel = supabase
      .channel(`chat_${bookingId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "chat_messages",
          filter: `booking_id=eq.${bookingId}`
        },
        (payload) => {
          const row = payload.new;
          if (typeof row.id === "string" && typeof row.sender_id === "string" && typeof row.message === "string") {
            setMessages(prev => prev.some(m => m.id === row.id) ? prev : [...prev, { id: row.id, sender_id: row.sender_id, message: row.message }]);
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  }, [bookingId, supabase]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !active) return;
    const text = newMessage;
    setNewMessage("");

    await supabase.from("chat_messages").insert({
      booking_id: bookingId,
      sender_id: userId,
      message: text
    });
  };

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "400px", border: "1px solid var(--border-color, #e5e5e5)", borderRadius: "8px", background: "var(--background-alt, #fafafa)" }}>
      <div style={{ flex: 1, overflowY: "auto", padding: "1rem", display: "flex", flexDirection: "column", gap: "0.5rem" }}>
        {messages.map((msg) => {
          const isMe = msg.sender_id === userId;
          return (
            <div key={msg.id} style={{ 
              alignSelf: isMe ? "flex-end" : "flex-start",
              background: isMe ? "var(--primary, #0070f3)" : "#e0e0e0",
              color: isMe ? "#fff" : "#333",
              padding: "0.5rem 1rem",
              borderRadius: "16px",
              maxWidth: "80%",
              wordBreak: "break-word"
            }}>
              {msg.message}
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      
      <form onSubmit={sendMessage} style={{ display: "flex", gap: "0.5rem", padding: "1rem", borderTop: "1px solid var(--border-color, #e5e5e5)", background: "#fff", borderBottomLeftRadius: "8px", borderBottomRightRadius: "8px" }}>
        <input 
          type="text" 
          value={newMessage} 
          onChange={(e) => setNewMessage(e.target.value)}
          placeholder={m.operations?.typeMessage || "Type a message..."}
          disabled={!active}
          style={{ flex: 1, padding: "0.5rem", borderRadius: "4px", border: "1px solid var(--border-color, #ccc)" }}
        />
        <button type="submit" className="button button-primary" disabled={!active || !newMessage.trim()}>
          {m.operations?.send || "Send"}
        </button>
      </form>
    </div>
  );
}
