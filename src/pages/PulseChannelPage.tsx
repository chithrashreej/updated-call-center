import { useEffect, useRef, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Send, Radio, Users, Pin, CheckCircle2 } from 'lucide-react';
import { Card } from '@/components/ui/Card';
import { useToast } from '@/components/ui/Toast';
import { channels, seedMessages } from '@/data/pulse';
import { formatTime } from '@/utils/format';
import type { ChatMessage } from '@/types';

const STORAGE_KEY = 'pulse_messages_v1';

function loadMessages(): ChatMessage[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw) as ChatMessage[];
  } catch {
    // Unreadable storage falls back to the seed messages below.
  }
  return seedMessages;
}

function saveMessages(msgs: ChatMessage[]) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(msgs));
  } catch {
    // Storage may be full or disabled; chat still works for this session.
  }
}

export function PulseChannelPage() {
  const { channelId = '' } = useParams();
  const navigate = useNavigate();
  const { push } = useToast();
  const [messages, setMessages] = useState<ChatMessage[]>(() => loadMessages());
  const [input, setInput] = useState('');
  const scrollRef = useRef<HTMLDivElement>(null);

  const channel = channels.find((c) => c.id === channelId);
  const channelMessages = messages.filter((m) => m.channelId === channelId);
  const pinned = channelMessages.find((m) => m.pinned && m.needsInput);

  useEffect(() => {
    saveMessages(messages);
  }, [messages]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [channelMessages.length]);

  if (!channel) {
    return (
      <div className="text-center py-16">
        <p className="text-slate-500">Channel not found.</p>
        <button onClick={() => navigate('/pulse')} className="btn-secondary mt-3">Back to Pulse</button>
      </div>
    );
  }

  const appendMessage = (text: string) => {
    const msg: ChatMessage = {
      id: 'M-' + Math.random().toString(36).slice(2),
      channelId,
      author: 'You',
      text,
      timestamp: new Date().toISOString(),
    };
    setMessages((m) => [...m, msg]);
  };

  const send = () => {
    const text = input.trim();
    if (!text) return;
    appendMessage(text);
    setInput('');
    push('Message sent', 'success');
  };

  const respondToPinned = (option: string) => {
    if (!pinned) return;
    const pinnedId = pinned.id;
    setMessages((m) =>
      m.map((msg) => (msg.id === pinnedId ? { ...msg, pinned: false, needsInput: false } : msg))
    );
    appendMessage(`Response: ${option}`);
    push(`Responded: ${option}`, 'success');
  };

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-6rem)]">
      <div className="flex items-center gap-3 mb-3">
        <button onClick={() => navigate('/pulse')} className="btn-ghost p-2" aria-label="Back">
          <ArrowLeft size={18} />
        </button>
        <div className={`grid place-items-center w-10 h-10 rounded-lg shrink-0 ${channel.type === 'group' ? 'bg-slate-100 text-slate-700' : 'bg-slate-900 text-white'}`}>
          {channel.type === 'group' ? <Users size={18} /> : <Radio size={18} />}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2">
            <h1 className="text-base font-semibold text-slate-900 truncate">{channel.name}</h1>
            <span className="badge bg-emerald-100 text-emerald-700">Online</span>
          </div>
          <p className="text-xs text-slate-500 truncate">{channel.lastMessage}</p>
        </div>
      </div>

      <Card pad={false} className="flex-1 flex flex-col overflow-hidden">
        <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-3">
          {pinned && (
            <div className="rounded-lg border border-amber-200 bg-amber-50 p-3">
              <div className="flex items-center gap-1.5 text-xs font-semibold text-amber-700 mb-1.5">
                <Pin size={12} /> Needs Your Input
              </div>
              <p className="text-sm text-slate-800">{pinned.text}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                {(pinned.options || []).map((opt) => (
                  <button key={opt} onClick={() => respondToPinned(opt)} className="btn-secondary text-xs py-1.5">
                    <CheckCircle2 size={13} /> {opt}
                  </button>
                ))}
              </div>
            </div>
          )}

          {channelMessages.map((m) => {
            const mine = m.author === 'You';
            return (
              <div key={m.id} className={`flex ${mine ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] sm:max-w-[70%] ${mine ? 'items-end' : 'items-start'} flex flex-col`}>
                  <div className={`flex items-center gap-1.5 mb-0.5 text-[11px] text-slate-400 ${mine ? 'flex-row-reverse' : ''}`}>
                    <span className="font-medium text-slate-600">{m.author}</span>
                    <span>{formatTime(m.timestamp)}</span>
                  </div>
                  <div
                    className={`rounded-2xl px-3.5 py-2 text-sm ${
                      mine
                        ? 'bg-slate-900 text-white rounded-br-sm'
                        : 'bg-slate-100 text-slate-800 rounded-bl-sm'
                    }`}
                  >
                    {m.text}
                  </div>
                </div>
              </div>
            );
          })}
          {channelMessages.length === 0 && (
            <div className="text-center py-10 text-sm text-slate-400">No messages yet. Say hello!</div>
          )}
        </div>

        <div className="border-t border-slate-200 p-3 flex items-center gap-2">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && send()}
            placeholder={`Message ${channel.name}…`}
            className="input flex-1"
            aria-label="Type a message"
          />
          <button onClick={send} className="btn-primary" disabled={!input.trim()} aria-label="Send">
            <Send size={15} /> <span className="hidden sm:inline">Send</span>
          </button>
        </div>
      </Card>

      <p className="text-[11px] text-slate-400 mt-2">Messages are saved in this browser (LocalStorage).</p>
    </div>
  );
}
