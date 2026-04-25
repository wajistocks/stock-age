const fs = require('fs');
const code = `"use client";
import { useState } from "react";

export default function Home() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);

  async function send() {
    if (!input.trim()) return;
    const msg = input;
    setInput("");
    setLoading(true);
    setMessages(p => [...p, { role: "user", content: msg }]);
    const r = await fetch("/api/research", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: [{ role: "user", content: msg }] })
    });
    const d = await r.json();
    setMessages(p => [...p, { role: "assistant", content: d.content }]);
    setLoading(false);
  }

  return (
    <div style={{ padding: 40, maxWidth: 800, margin: "0 auto", fontFamily: "sans-serif", background: "#0a0a0a", minHeight: "100vh", color: "white" }}>
      <h1>MarketMind</h1>
      <div>{messages.map((m, i) => <div key={i} style={{ margin: "10px 0", padding: 10, background: m.role === "user" ? "#1d4ed8" : "#1a1a1a", borderRadius: 8 }}>{m.content}</div>)}</div>
      {loading && <p>Researching...</p>}
      <div style={{ display: "flex", gap: 10, marginTop: 20 }}>
        <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={e => e.key === "Enter" && send()} placeholder="Ask about stocks..." style={{ flex: 1, padding: 10, borderRadius: 8, border: "1px solid #333", background: "#111", color: "white" }} />
        <button onClick={send} style={{ padding: "10px 20px", background: "#1d4ed8", color: "white", border: "none", borderRadius: 8, cursor: "pointer" }}>Send</button>
      </div>
    </div>
  );
}`;
fs.writeFileSync('app/page.tsx', code);
console.log('Done!');
