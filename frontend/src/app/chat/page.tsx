"use client";

import { useSession } from "next-auth/react";
import { useState } from "react";
import { Navbar } from "@/components/Navbar";

const backendUrl = process.env.NEXT_PUBLIC_BACKEND_URL || "http://localhost:4000";

interface ChatMessage {
  role: "user" | "assistant";
  content: string;
}

export default function ChatPage() {
  const { data: session, status } = useSession();
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSend(e: React.FormEvent) {
    e.preventDefault();
    if (!input.trim() || !session) return;
    const newMessage: ChatMessage = { role: "user", content: input.trim() };
    setMessages((prev) => [...prev, newMessage]);
    setInput("");
    setLoading(true);
    try {
      const res = await fetch(`${backendUrl}/chatbot`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${(session as any).backendToken}`,
        },
        body: JSON.stringify({ message: newMessage.content }),
      });
      if (res.ok) {
        const data = await res.json();
        setMessages((prev) => [
          ...prev,
          { role: "assistant", content: data.reply ?? JSON.stringify(data) },
        ]);
      }
    } finally {
      setLoading(false);
    }
  }

  if (status === "loading") {
    return (
      <>
        <Navbar />
        <main className="min-h-[calc(100vh-3rem)] flex items-center justify-center bg-white dark:bg-zinc-950">
          <p className="text-gray-600 dark:text-zinc-400">Loading...</p>
        </main>
      </>
    );
  }

  if (!session) {
    return (
      <>
        <Navbar />
        <main className="min-h-[calc(100vh-3rem)] flex items-center justify-center bg-white dark:bg-zinc-950">
          <p className="text-gray-600 dark:text-zinc-400">
            You must be logged in to chat with the AI mentor.
          </p>
        </main>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main className="min-h-[calc(100vh-3rem)] max-w-4xl mx-auto px-4 py-6 flex flex-col gap-4 transition-colors">
        <h1 className="text-2xl font-semibold text-gray-900 dark:text-zinc-50">AI DSA Mentor</h1>
        <div className="flex-1 rounded-xl border border-gray-200 dark:border-zinc-800 bg-gray-50 dark:bg-zinc-900/50 p-4 overflow-y-auto space-y-3 min-h-[400px]">
          {messages.length === 0 && (
            <p className="text-sm text-gray-600 dark:text-zinc-400">
              Ask anything about DSA, paste code to debug, or request an
              explanation in simple language.
            </p>
          )}
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`max-w-[80%] rounded-lg px-3 py-2 text-sm ${m.role === "user"
                ? "ml-auto bg-green-500 text-white"
                : "mr-auto bg-white dark:bg-zinc-800 border border-gray-200 dark:border-zinc-700 text-gray-900 dark:text-zinc-100"
                }`}
            >
              {m.content}
            </div>
          ))}
          {loading && (
            <p className="text-xs text-gray-500 italic">
              AI is thinking about your question...
            </p>
          )}
        </div>
        <form onSubmit={handleSend} className="flex items-center gap-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 min-h-[60px] max-h-[160px] rounded-md bg-white dark:bg-zinc-800 border border-gray-300 dark:border-zinc-700 px-3 py-2 text-sm outline-none focus:border-green-500 text-gray-900 dark:text-zinc-50 transition-colors"
            placeholder="Ask a DSA question or paste your code here..."
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-4 py-2 rounded-md bg-green-500 text-white font-medium hover:bg-green-600 disabled:opacity-60"
          >
            Send
          </button>
        </form>
      </main>
    </>
  );
}


