"use client";

import { useState } from "react";
import { Send, Copy, Check, Calendar, MessageSquare, Wand2, User, Bot } from "lucide-react";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  timestamp: Date;
}

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  role?: string;
  notes?: string;
}

const mockClients: Client[] = [
  { id: "1", name: "Sarah Chen", email: "sarah@techstart.io", company: "TechStart Inc", role: "CTO" },
  { id: "2", name: "Mike Johnson", email: "mike@acme.com", company: "Acme Corp", role: "Product Manager" },
  { id: "3", name: "Emily Davis", email: "emily@designco.com", company: "Design Co", role: "Founder" },
];

const sampleOutreachTemplates = {
  intro: `Hi {{name}},

{{introduction}}

I've helped companies like {{similar_company}} achieve {{specific_result}}, and I believe I can bring similar value to {{company}}.

Would you be open to a brief 15-minute call this week to explore how we might work together?

Best,
{{my_name}}`,

  followUp: `Hi {{name}},

I wanted to follow up on my previous message about {{topic}}.

I understand you're busy, so I'll keep this short:
- {{key_benefit_1}}
- {{key_benefit_2}}

Would a quick 10-minute call work for you this week or next?

Best,
{{my_name}}`,

  proposal: `Hi {{name}},

Thank you for your interest in working together!

Based on our conversation, here's what I'm proposing:
{{proposal_summary}}

Timeline: {{timeline}}
Investment: {{investment}}

Let me know if you'd like to move forward or discuss any adjustments.

Best,
{{my_name}}`,
};

export default function ClientCommunicationPage() {
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [template, setTemplate] = useState<string>("intro");
  const [showTemplates, setShowTemplates] = useState(false);
  const [copied, setCopied] = useState(false);
  const [generatedDraft, setGeneratedDraft] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [showScheduler, setShowScheduler] = useState(false);
  const [scheduledTime, setScheduledTime] = useState("");

  const generateDraft = async () => {
    if (!selectedClient) return;
    setIsGenerating(true);
    
    // Simulate AI generation
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const templateText = sampleOutreachTemplates[template as keyof typeof sampleOutreachTemplates];
    const draft = templateText
      .replace(/{{name}}/g, selectedClient.name)
      .replace(/{{company}}/g, selectedClient.company || "your company")
      .replace(/{{similar_company}}/g, "TechStart, Acme, and DesignCo")
      .replace(/{{specific_result}}/g, "40% faster project delivery and 25% cost savings")
      .replace(/{{my_name}}/g, "Your Name")
      .replace(/{{topic}}/g, "web development services")
      .replace(/{{key_benefit_1}}/g, "We specialize in React/Next.js development")
      .replace(/{{key_benefit_2}}/g, "Flexible pricing: hourly or fixed-project")
      .replace(/{{proposal_summary}}/g, "Full-stack web application development with React, Node.js, and PostgreSQL")
      .replace(/{{timeline}}/g, "6-8 weeks")
      .replace(/{{investment}}/g, "$8,000-12,000");
    
    setGeneratedDraft(draft);
    setIsGenerating(false);
  };

  const copyDraft = () => {
    navigator.clipboard.writeText(generatedDraft);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSendMessage = () => {
    if (!input.trim()) return;
    
    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    };
    
    setMessages([...messages, userMessage]);
    setInput("");
    
    // Simulate AI response
    setTimeout(() => {
      const aiResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: getAIResponse(input),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const getAIResponse = (query: string): string => {
    const lowerQuery = query.toLowerCase();
    if (lowerQuery.includes("price") || lowerQuery.includes("cost") || lowerQuery.includes("pricing")) {
      return "For pricing, I typically offer two options:\n\n1. **Hourly Rate**: $125-175/hour depending on complexity\n2. **Fixed Project**: Based on scope, usually $5,000-25,000\n\nWould you like me to provide a detailed quote for your specific project?";
    }
    if (lowerQuery.includes("timeline") || lowerQuery.includes("how long") || lowerQuery.includes("when")) {
      return "Timeline depends on project scope:\n\n- **Small projects** (landing pages, simple apps): 2-4 weeks\n- **Medium projects** (web apps, CMS): 4-8 weeks\n- **Large projects** (full platforms): 8-16 weeks\n\nI can provide a more accurate timeline after discussing your requirements.";
    }
    if (lowerQuery.includes("experience") || lowerQuery.includes("portfolio") || lowerQuery.includes("work")) {
      return "I have 8+ years of experience building:\n\n- SaaS applications\n- E-commerce platforms\n- Custom web apps\n- API integrations\n\nWould you like me to share relevant case studies or my portfolio?";
    }
    if (lowerQuery.includes("schedule") || lowerQuery.includes("call") || lowerQuery.includes("meeting")) {
      return "I'd love to schedule a call! I'm generally available:\n\n- **Weekdays**: 9 AM - 5 PM MT\n- **Next availability**: This Thursday or Friday\n\nWould you like me to send you my calendar link?";
    }
    return "Thanks for your question! Let me help you with that. Could you share more details about your project so I can provide the most relevant information?";
  };

  const scheduleCall = () => {
    if (!scheduledTime) return;
    alert(`Call scheduled for ${scheduledTime}. A calendar invite will be sent to ${selectedClient?.email}`);
    setShowScheduler(false);
    setScheduledTime("");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Client Communication Assistant</h1>
          <p className="mt-1 text-gray-500">AI-powered outreach, Q&A, and scheduling</p>
        </div>

        <div className="grid grid-cols-3 gap-6">
          {/* Client List */}
          <div className="col-span-1 rounded-xl bg-white border p-4">
            <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
              <User className="h-5 w-5" />
              Select Client
            </h2>
            <div className="space-y-2">
              {mockClients.map((client) => (
                <button
                  key={client.id}
                  onClick={() => setSelectedClient(client)}
                  className={`w-full rounded-lg p-3 text-left transition-colors ${
                    selectedClient?.id === client.id
                      ? "bg-violet-50 border-violet-200 border"
                      : "hover:bg-gray-50 border border-transparent"
                  }`}
                >
                  <p className="font-medium text-gray-900">{client.name}</p>
                  <p className="text-sm text-gray-500">{client.company}</p>
                </button>
              ))}
            </div>
          </div>

          {/* Main Content */}
          <div className="col-span-2 space-y-6">
            {/* Draft Generator */}
            <div className="rounded-xl bg-white border p-6">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-lg font-semibold flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-violet-600" />
                  Generate Outreach Draft
                </h2>
                <button
                  onClick={() => setShowTemplates(!showTemplates)}
                  className="text-sm text-violet-600 hover:text-violet-700"
                >
                  {showTemplates ? "Hide Templates" : "Show Templates"}
                </button>
              </div>

              {showTemplates && (
                <div className="mb-4 flex gap-2">
                  {Object.keys(sampleOutreachTemplates).map((t) => (
                    <button
                      key={t}
                      onClick={() => setTemplate(t)}
                      className={`rounded-lg px-3 py-1 text-sm capitalize ${
                        template === t
                          ? "bg-violet-600 text-white"
                          : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                      }`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
              )}

              <div className="flex gap-3">
                <button
                  onClick={generateDraft}
                  disabled={!selectedClient || isGenerating}
                  className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 disabled:opacity-50"
                >
                  {isGenerating ? (
                    <>Generating...</>
                  ) : (
                    <>
                      <Wand2 className="h-4 w-4" />
                      Generate Draft
                    </>
                  )}
                </button>
                {selectedClient && (
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    for <span className="font-medium text-gray-900">{selectedClient.name}</span>
                  </div>
                )}
              </div>

              {generatedDraft && (
                <div className="mt-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium text-gray-700">Generated Draft</span>
                    <button
                      onClick={copyDraft}
                      className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700"
                    >
                      {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                      {copied ? "Copied!" : "Copy"}
                    </button>
                  </div>
                  <textarea
                    value={generatedDraft}
                    onChange={(e) => setGeneratedDraft(e.target.value)}
                    className="w-full h-48 rounded-lg border border-gray-300 p-3 text-sm font-mono resize-none"
                    placeholder="Generated draft will appear here..."
                  />
                </div>
              )}
            </div>

            {/* Q&A Chat */}
            <div className="rounded-xl bg-white border p-6">
              <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                <MessageSquare className="h-5 w-5 text-blue-600" />
                Client Q&A Assistant
              </h2>
              
              <div className="h-64 overflow-y-auto border rounded-lg p-4 mb-4 bg-gray-50">
                {messages.length === 0 ? (
                  <p className="text-center text-gray-400 py-8">
                    Ask me anything about pricing, timelines, experience, or scheduling!
                  </p>
                ) : (
                  <div className="space-y-4">
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
                      >
                        <div
                          className={`max-w-[80%] rounded-lg p-3 ${
                            msg.role === "user"
                              ? "bg-violet-600 text-white"
                              : "bg-white border text-gray-800"
                          }`}
                        >
                          <div className="flex items-center gap-2 mb-1">
                            {msg.role === "assistant" ? (
                              <Bot className="h-4 w-4" />
                            ) : (
                              <User className="h-4 w-4" />
                            )}
                            <span className="text-xs opacity-70">
                              {msg.role === "user" ? "You" : "AI Assistant"}
                            </span>
                          </div>
                          <p className="text-sm whitespace-pre-line">{msg.content}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && handleSendMessage()}
                  placeholder="Ask about pricing, timeline, experience..."
                  className="flex-1 rounded-lg border border-gray-300 px-4 py-2"
                />
                <button
                  onClick={handleSendMessage}
                  className="rounded-lg bg-blue-600 px-4 py-2 text-white hover:bg-blue-700"
                >
                  <Send className="h-5 w-5" />
                </button>
              </div>
            </div>

            {/* Scheduling */}
            <div className="rounded-xl bg-white border p-6">
              <h2 className="mb-4 text-lg font-semibold flex items-center gap-2">
                <Calendar className="h-5 w-5 text-green-600" />
                Schedule a Call
              </h2>

              {!showScheduler ? (
                <button
                  onClick={() => setShowScheduler(true)}
                  disabled={!selectedClient}
                  className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700 disabled:opacity-50"
                >
                  Schedule Call with {selectedClient?.name || "Client"}
                </button>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Select Date & Time
                    </label>
                    <input
                      type="datetime-local"
                      value={scheduledTime}
                      onChange={(e) => setScheduledTime(e.target.value)}
                      className="w-full rounded-lg border border-gray-300 px-4 py-2"
                    />
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={scheduleCall}
                      className="rounded-lg bg-green-600 px-4 py-2 text-sm font-medium text-white hover:bg-green-700"
                    >
                      Confirm Scheduling
                    </button>
                    <button
                      onClick={() => setShowScheduler(false)}
                      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
