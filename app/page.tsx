'use client';
import { useState, useRef, useEffect } from 'react';

export default function StockAgent() {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const bottomRef = useRef(null);
  const chatHistory = useRef([]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages, loading]);

  async function sendMessage(userInput) {
    if (!userInput.trim() || loading) return;
    setLoading(true);
    setMessages(prev => [...prev, { role: 'user', content: userInput }]);
    chatHistory.current = [...chatHistory.current, { role: 'user', content: userInput }];
    setInput('');
    try {
      const res = await fetch('/api/research', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: chatHistory.current, sector: 'Technology', horizon: 'Mid-term', risk: 'Moderate' }),
      });
      const data = await res.json();
      const text = data.content || '';
      chatHistory.current = [...chatHistory.current, { role: 'assistant', content: text }];
      setMessages(prev => [...prev, { role: 'assistant', content: text }]);
    } catch {
      setMessages(prev => [...prev, { role: 'assistant', content: 'Error. Please try again.' }]);
    }
    setLoading(false);
  }

  return (
    <div style={{ minHeight: '100vh', background: '#080c14', color: '#e2e8f0', fontFamily: 'sans-serif', display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 20px' }}>
      <h1 style={{ fontSize: 32, fontWeight: 700, marginBottom: 8 }}>📈 MarketMind</h1>
      <p style={{ color: '#64748b', marginBottom: 32 }}>AI Stock Research Agent</p>
      <div style={{ width: '100%', maxWidth: 700, flex: 1 }}>
        {messages.map((msg, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: msg.role === 'user' ? 'flex-end' : 'flex-start', marginBottom: 16 }}>
            <div style={{ background: msg.role === 'user' ? '#1d4ed8' : 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 12, padding: '12px 16px', maxWidth: '80%', fontSize: 14, lineHeight: 1.7, whiteSpace: 'pre-wrap' }}>
              {msg.content}
            </div>
          </div>
        ))}
        {loading && <div style={{ color: '#64748b', fontSize: 13, padding: 12 }}>Researching markets...</div>}
        <div ref={bottomRef} />
      </div>
      <div style={{ width: '100%', maxWidth: 700, display: 'flex', gap: 10, marginTop: 24 }}>
        <input
          value={input}
          onChange={e => setInput(e.target.value)}
          onKeyDown={e => { if (e.key === 'Enter') sendMessage(input); }}
          placeholder="Ask about stocks, sectors, market trends..."
          style={{ flex: 1, background: 'rgba(255,255,255,0.05)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, padding: '12px 16px', color: '#e2e8f0', fontSize: 14, outline: 'none' }}
        />
        <button onClick={() => sendMessage(input)} disabled={loading || !input.trim()} style={{ background: '#1d4ed8', border: 'none', borderRadius: 10, padding: '12px 20px', color: '#fff', fontSize: 14, cursor: 'pointer' }}>
          Send
        </button>
      </div>
    </div>
  );
}
