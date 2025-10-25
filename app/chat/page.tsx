"use client";
import { useEffect, useState } from "react";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL as string;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY as string;
const supabase = supabaseUrl && supabaseKey ? createClient(supabaseUrl, supabaseKey) : null;

type Message = { id: string; content: string; created_at: string };

export default function ChatPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [text, setText] = useState("");

  useEffect(() => {
    if (!supabase) return;
    const load = async () => {
      const { data } = await supabase.from("messages").select("*").order("created_at", { ascending: true }).limit(100);
      setMessages(data as Message[] || []);
    };
    load();
    const channel = supabase
      .channel("public:messages")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "messages" }, (payload) => {
        setMessages((m) => [...m, payload.new as Message]);
      })
      .subscribe();
    return () => { channel.unsubscribe(); };
  }, []);

  const send = async () => {
    if (!supabase || !text.trim()) return;
    await supabase.from("messages").insert({ content: text.slice(0, 500) });
    setText("");
  };

  return (
    <div className="mx-auto max-w-3xl px-4 py-6">
      <h1 className="mb-4 text-2xl font-semibold">Chatroom Komunitas</h1>
      {!supabase && (
        <div className="mb-4 rounded-md border p-3 text-sm">Konfigurasikan NEXT_PUBLIC_SUPABASE_URL dan NEXT_PUBLIC_SUPABASE_ANON_KEY di .env.local untuk mengaktifkan chat realtime.</div>
      )}
      <div className="h-[60vh] w-full overflow-y-auto rounded-md border p-3">
        {messages.map((m) => (
          <div key={m.id} className="py-1 text-sm">
            <span className="opacity-60 mr-2">{new Date(m.created_at).toLocaleTimeString()}</span>
            {m.content}
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-2">
        <input className="flex-1 rounded-md border px-3 py-2 text-sm bg-transparent" placeholder="Tulis pesan tanpa login..." value={text} onChange={(e) => setText(e.target.value)} />
        <button onClick={send} className="rounded-md border px-3 py-2 text-sm hover:bg-zinc-100 dark:hover:bg-zinc-900">Kirim</button>
      </div>
    </div>
  );
}
