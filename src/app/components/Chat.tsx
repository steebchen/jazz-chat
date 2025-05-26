'use client';

import { useEffect, useRef, useState } from 'react';
import { useAccount } from 'jazz-react';
import { Account } from 'jazz-tools';
import { useRouter } from 'next/navigation';
import { SharedChat } from '@/app/models/SharedChat';

interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
}

interface ChatProps {
  initialMessages?: Message[];
  readOnly?: boolean;
}

export default function Chat({ initialMessages = [], readOnly = false }: ChatProps) {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [shareUrl, setShareUrl] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { me } = useAccount(Account);
  const router = useRouter();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleShare = async () => {
    if (!me) return;

    const sharedChat = SharedChat.create({
      owner: me,
      messages: messages.map(({ role, content }) => ({ role, content })),
    });

    const url = `${window.location.origin}/chat/${sharedChat.id}`;
    setShareUrl(url);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim() || isLoading || readOnly) return;

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setIsLoading(true);

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          messages: [...messages, userMessage].map(({ role, content }) => ({
            role,
            content,
          })),
        }),
      });

      if (!response.ok) throw new Error('Failed to send message');

      const reader = response.body?.getReader();
      if (!reader) throw new Error('No reader available');

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: '',
      };

      setMessages((prev) => [...prev, assistantMessage]);

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const text = new TextDecoder().decode(value);
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantMessage.id
              ? { ...msg, content: msg.content + text }
              : msg
          )
        );
      }
    } catch (error) {
      console.error('Error:', error);
      setMessages((prev) => [
        ...prev,
        {
          id: Date.now().toString(),
          role: 'assistant',
          content: 'Sorry, there was an error processing your message.',
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] max-w-2xl mx-auto p-4">
      <div className="flex-1 overflow-y-auto mb-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${
              message.role === 'assistant' ? 'justify-start' : 'justify-end'
            }`}
          >
            <div
              className={`max-w-[80%] rounded-lg px-4 py-2 ${
                message.role === 'assistant'
                  ? 'bg-gray-100 text-gray-900'
                  : 'bg-blue-500 text-white'
              }`}
            >
              {message.content}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
      </div>

      {shareUrl && (
        <div className="mb-4 p-4 bg-gray-100 rounded-lg">
          <p className="text-sm text-gray-600 mb-2">Share this chat:</p>
          <div className="flex gap-2">
            <input
              type="text"
              value={shareUrl}
              readOnly
              className="flex-1 p-2 border rounded-lg bg-white"
            />
            <button
              onClick={() => {
                navigator.clipboard.writeText(shareUrl);
              }}
              className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
            >
              Copy
            </button>
          </div>
        </div>
      )}

      {!readOnly && (
        <div className="flex gap-2">
          <form onSubmit={handleSubmit} className="flex-1 flex gap-2">
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 p-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={isLoading}
            />
            <button
              type="submit"
              className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50"
              disabled={isLoading}
            >
              {isLoading ? 'Sending...' : 'Send'}
            </button>
          </form>
          <button
            onClick={handleShare}
            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 focus:outline-none focus:ring-2 focus:ring-green-500"
          >
            Share
          </button>
        </div>
      )}
    </div>
  );
}
