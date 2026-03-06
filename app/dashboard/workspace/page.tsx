"use client";

import { useState } from "react";
import { MessageSquare, Send, Bot, User } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
};

export default function WorkspacePage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content: "Hi! I'm your AI execution assistant. Once you've won a job, I can help you:\n\n- Write code and technical solutions\n- Research topics and gather information\n- Draft documents and deliverables\n- Break down tasks into steps\n- Review and improve your work\n\nWhat are you working on today?",
    },
  ]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
    };
    
    setMessages([...messages, userMessage]);
    setInput("");
    setLoading(true);
    
    // Simulate AI response (replace with real API call)
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: generateResponse(input),
      };
      setMessages([...messages, userMessage, assistantMessage]);
      setLoading(false);
    }, 1500);
  };

  const generateResponse = (question: string): string => {
    const q = question.toLowerCase();
    
    if (q.includes("code") || q.includes("react") || q.includes("javascript")) {
      return `Here's a React component example for your use case:

\`\`\`tsx
import { useState } from 'react';

interface Props {
  title: string;
}

export function MyComponent({ title }: Props) {
  const [count, setCount] = useState(0);
  
  return (
    <div className="p-4">
      <h1>{title}</h1>
      <button onClick={() => setCount(c => c + 1)}>
        Clicked {count} times
      </button>
    </div>
  );
}
\`\`\`

Want me to expand on this or adapt it to your specific needs?`;
    }
    
    if (q.includes("research") || q.includes("find")) {
      return `I'd be happy to help with research. To give you the best information, please let me know:\n\n1. What specific topic or question do you need researched?\n2. What's the context - is this for a client deliverable, a blog post, etc.?\n3. Any particular sources or perspectives you want me to focus on?\n\nWith more details, I can provide more targeted research and insights.`;
    }
    
    if (q.includes("break down") || q.includes("plan") || q.includes("task")) {
      return `Here's a suggested approach to break this down:\n\n**Step 1: Define Requirements**\n- Clarify scope and success criteria\n- Identify stakeholders\n\n**Step 2: Research & Planning**\n- Gather relevant information\n- Create technical specification\n\n**Step 3: Implementation**\n- Build core functionality first\n- Test incrementally\n\n**Step 4: Review & Refine**\n- Quality check\n- Get feedback\n- Iterate\n\nWould you like me to expand on any of these steps?`;
    }
    
    return `I understand you're working on "${question.slice(0, 50)}..."\n\nI can help with:\n- **Code generation** - Write snippets or full components\n- **Research** - Find information and summarize\n- **Planning** - Break down complex tasks\n- **Drafting** - Create documents, emails, or content\n- **Review** - Check your work for improvements\n\nWhat specific help do you need right now?`;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-4xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <MessageSquare className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Freelance Copilot</span>
          </div>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-8">
        {/* Chat */}
        <div className="bg-white rounded-xl border h-[600px] flex flex-col">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`flex gap-3 ${msg.role === "user" ? "flex-row-reverse" : ""}`}
              >
                <div
                  className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                    msg.role === "user" ? "bg-gray-200" : "bg-violet-100"
                  }`}
                >
                  {msg.role === "user" ? (
                    <User className="w-4 h-4 text-gray-600" />
                  ) : (
                    <Bot className="w-4 h-4 text-violet-600" />
                  )}
                </div>
                <div
                  className={`flex-1 ${msg.role === "user" ? "text-right" : ""}`}
                >
                  <div
                    className={`inline-block max-w-[80%] px-4 py-2 rounded-lg ${
                      msg.role === "user"
                        ? "bg-violet-600 text-white"
                        : "bg-gray-100 text-gray-900"
                    }`}
                  >
                    <div className="whitespace-pre-wrap text-sm">{msg.content}</div>
                  </div>
                </div>
              </div>
            ))}
            {loading && (
              <div className="flex gap-3">
                <div className="w-8 h-8 rounded-full bg-violet-100 flex items-center justify-center">
                  <Bot className="w-4 h-4 text-violet-600" />
                </div>
                <div className="bg-gray-100 px-4 py-2 rounded-lg">
                  <div className="flex gap-1">
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></span>
                    <span className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></span>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Input */}
          <div className="border-t p-4">
            <div className="flex gap-2">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && !e.shiftKey && handleSend()}
                placeholder="Ask me to help with your project..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-violet-500"
                disabled={loading}
              />
              <button
                onClick={handleSend}
                disabled={loading || !input.trim()}
                className="px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Send className="w-5 h-5" />
              </button>
            </div>
            <p className="text-xs text-gray-500 mt-2 text-center">
              AI can make mistakes. Review important work before sending to clients.
            </p>
          </div>
        </div>
      </main>
    </div>
  );
}
