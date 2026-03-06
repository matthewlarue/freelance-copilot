"use client";

import { useState, useEffect } from "react";
import { TrendingUp, DollarSign, Clock, CheckCircle, XCircle } from "lucide-react";

type Proposal = {
  id: string;
  jobTitle: string;
  status: string;
  createdAt: string;
};

export default function PipelinePage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);

  useEffect(() => {
    fetchProposals();
  }, []);

  const fetchProposals = async () => {
    const res = await fetch("/api/proposals");
    const data = await res.json();
    setProposals(data.data || []);
  };

  const stages = [
    { key: "draft", label: "Draft", color: "bg-blue-100 text-blue-700", icon: Clock },
    { key: "submitted", label: "Submitted", color: "bg-yellow-100 text-yellow-700", icon: Clock },
    { key: "pending", label: "Pending", color: "bg-purple-100 text-purple-700", icon: Clock },
    { key: "won", label: "Won", color: "bg-green-100 text-green-700", icon: CheckCircle },
    { key: "lost", label: "Lost", color: "bg-red-100 text-red-700", icon: XCircle },
  ];

  const wonCount = proposals.filter((p) => p.status === "won").length;
  const decidedCount = proposals.filter((p) => ["won", "lost"].includes(p.status)).length;
  const winRate = decidedCount > 0 ? Math.round((wonCount / decidedCount) * 100) : 0;
  
  const stats = {
    total: proposals.length,
    won: wonCount,
    lost: proposals.filter((p) => p.status === "lost").length,
    winRate: winRate,
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <TrendingUp className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Freelance Copilot</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Pipeline</h1>

        {/* Stats */}
        <div className="grid grid-cols-4 gap-4 mb-8">
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-2">
              <TrendingUp className="w-5 h-5 text-gray-500" />
              <p className="text-sm text-gray-500">Total Proposals</p>
            </div>
            <p className="text-3xl font-bold">{stats.total}</p>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-2">
              <CheckCircle className="w-5 h-5 text-green-500" />
              <p className="text-sm text-gray-500">Won</p>
            </div>
            <p className="text-3xl font-bold text-green-600">{stats.won}</p>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-2">
              <XCircle className="w-5 h-5 text-red-500" />
              <p className="text-sm text-gray-500">Lost</p>
            </div>
            <p className="text-3xl font-bold text-red-600">{stats.lost}</p>
          </div>
          
          <div className="bg-white rounded-lg border p-6">
            <div className="flex items-center gap-3 mb-2">
              <DollarSign className="w-5 h-5 text-violet-500" />
              <p className="text-sm text-gray-500">Win Rate</p>
            </div>
            <p className="text-3xl font-bold text-violet-600">{stats.winRate}%</p>
          </div>
        </div>

        {/* Pipeline */}
        <div className="bg-white rounded-xl border p-6">
          <h2 className="font-semibold mb-6">Pipeline Overview</h2>
          <div className="flex gap-4">
            {stages.map((stage) => {
              const count = proposals.filter((p) => p.status === stage.key).length;
              const Icon = stage.icon;
              return (
                <div key={stage.key} className="flex-1">
                  <div className={`flex items-center gap-2 mb-3 ${stage.color} px-3 py-1 rounded-lg w-fit`}>
                    <Icon className="w-4 h-4" />
                    <span className="text-sm font-medium">{stage.label}</span>
                    <span className="text-xs opacity-75">({count})</span>
                  </div>
                  <div className="space-y-2">
                    {proposals
                      .filter((p) => p.status === stage.key)
                      .map((p) => (
                        <div
                          key={p.id}
                          className="p-3 bg-gray-50 rounded-lg border text-sm"
                        >
                          {p.jobTitle}
                        </div>
                      ))}
                    {count === 0 && (
                      <p className="text-xs text-gray-400 italic">No proposals</p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </main>
    </div>
  );
}
