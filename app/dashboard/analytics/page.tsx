'use client';

import { useEffect, useState } from 'react';
import { Rocket, TrendingUp, TrendingDown, DollarSign, Briefcase, Users, Clock, Target, FileText, CheckCircle, XCircle, Hourglass, Star, AlertCircle, Info } from 'lucide-react';
import Link from 'next/link';

interface ClientQuality {
  name: string;
  score: number;
  repeatBusiness: number;
  totalRevenue: number;
  paymentTimeliness: number;
}

interface Insight {
  type: 'positive' | 'neutral' | 'warning';
  message: string;
}

interface AnalyticsData {
  revenue: {
    currentMonth: number;
    lastMonth: number;
    total: number;
    growth: number;
    outstanding: number;
    outstandingCount: number;
  };
  pipeline: {
    totalJobs: number;
    activeJobs: number;
    totalProposals: number;
    submittedProposals: number;
    wonProposals: number;
    pendingProposals: number;
    winRate: number;
    avgProposalValue: number;
    avgTimeToClose: number;
    pipelineValue: number;
  };
  clients: {
    totalContracts: number;
    activeContracts: number;
    completedContracts: number;
    avgQualityScore: number;
    repeatClientRate: number;
    topClients: ClientQuality[];
  };
  insights: Insight[];
  monthlyRevenue: { month: string; revenue: number }[];
  proposalsByStatus: {
    draft: number;
    submitted: number;
    pending: number;
    won: number;
    lost: number;
  };
}

export default function AnalyticsPage() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);

  useEffect(() => {
    // Get userId from URL or localStorage
    const params = new URLSearchParams(window.location.search);
    const uid = params.get('userId') || localStorage.getItem('userId');
    if (uid) {
      setUserId(uid);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (!userId) return;

    fetch(`/api/analytics?userId=${userId}`)
      .then(res => res.json())
      .then(setData)
      .catch(console.error)
      .finally(() => setLoading(false));
  }, [userId]);

  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  const formatPercent = (value: number) => `${value.toFixed(1)}%`;

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-violet-600"></div>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="bg-white p-8 rounded-xl border text-center">
          <p className="text-gray-500 mb-4">Please log in to view analytics</p>
          <Link href="/dashboard" className="text-violet-600 hover:underline">
            Go to Dashboard
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Freelance Copilot</span>
          </div>
          <Link href="/dashboard" className="text-sm text-gray-500 hover:text-gray-700">
            ← Back to Dashboard
          </Link>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-8">
          <h1 className="text-2xl font-bold">Analytics & Insights</h1>
          <p className="text-gray-500">Track earnings, time-to-close, and client quality</p>
        </div>

        {/* Revenue Overview */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Revenue Overview</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-green-600" />
                </div>
                <span className="text-sm text-gray-500">This Month</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(data?.revenue.currentMonth || 0)}</p>
              <div className={`flex items-center gap-1 text-sm ${(data?.revenue.growth || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                {(data?.revenue.growth || 0) >= 0 ? <TrendingUp className="w-4 h-4" /> : <TrendingDown className="w-4 h-4" />}
                {formatPercent(Math.abs(data?.revenue.growth || 0))} vs last month
              </div>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Last Month</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(data?.revenue.lastMonth || 0)}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center">
                  <DollarSign className="w-5 h-5 text-violet-600" />
                </div>
                <span className="text-sm text-gray-500">Total Revenue</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(data?.revenue.total || 0)}</p>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-orange-600" />
                </div>
                <span className="text-sm text-gray-500">Outstanding</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(data?.revenue.outstanding || 0)}</p>
              <p className="text-sm text-gray-500">{data?.revenue.outstandingCount || 0} invoices</p>
            </div>
          </div>
        </section>

        {/* Insights */}
        {(data?.insights?.length ?? 0) > 0 && (
          <section className="mb-8">
            <h2 className="text-lg font-semibold mb-4">Insights</h2>
            <div className="space-y-2">
              {data?.insights?.map((insight, idx) => (
                <div 
                  key={idx} 
                  className={`p-4 rounded-lg flex items-start gap-3 ${
                    insight.type === 'positive' ? 'bg-green-50 border border-green-200' :
                    insight.type === 'warning' ? 'bg-red-50 border border-red-200' :
                    'bg-blue-50 border border-blue-200'
                  }`}
                >
                  {insight.type === 'positive' && <TrendingUp className="w-5 h-5 text-green-600 mt-0.5" />}
                  {insight.type === 'warning' && <AlertCircle className="w-5 h-5 text-red-600 mt-0.5" />}
                  {insight.type === 'neutral' && <Info className="w-5 h-5 text-blue-600 mt-0.5" />}
                  <p className={`text-sm ${
                    insight.type === 'positive' ? 'text-green-800' :
                    insight.type === 'warning' ? 'text-red-800' :
                    'text-blue-800'
                  }`}>{insight.message}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* Pipeline Metrics */}
        <section className="mb-8">
          <h2 className="text-lg font-semibold mb-4">Pipeline Metrics</h2>
          <div className="grid md:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <Briefcase className="w-5 h-5 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Active Jobs</span>
              </div>
              <p className="text-2xl font-bold">{data?.pipeline.activeJobs || 0}</p>
              <p className="text-sm text-gray-500">of {data?.pipeline.totalJobs || 0} total</p>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <Target className="w-5 h-5 text-cyan-600" />
                </div>
                <span className="text-sm text-gray-500">Win Rate</span>
              </div>
              <p className="text-2xl font-bold">{formatPercent(data?.pipeline.winRate || 0)}</p>
              <p className="text-sm text-gray-500">{data?.pipeline.wonProposals || 0} of {data?.pipeline.submittedProposals || 0} won</p>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <Clock className="w-5 h-5 text-purple-600" />
                </div>
                <span className="text-sm text-gray-500">Avg Time to Close</span>
              </div>
              <p className="text-2xl font-bold">{data?.pipeline.avgTimeToClose.toFixed(0) || 0} days</p>
            </div>

            <div className="bg-white p-6 rounded-xl border">
              <div className="flex items-center gap-3 mb-2">
                <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-5 h-5 text-emerald-600" />
                </div>
                <span className="text-sm text-gray-500">Pipeline Value</span>
              </div>
              <p className="text-2xl font-bold">{formatCurrency(data?.pipeline.pipelineValue || 0)}</p>
              <p className="text-sm text-gray-500">{data?.pipeline.pendingProposals || 0} pending</p>
            </div>
          </div>
        </section>

        {/* Proposal Status & Client Metrics */}
        <div className="grid md:grid-cols-2 gap-8 mb-8">
          {/* Proposals by Status */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Proposals</h2>
            <div className="bg-white p-6 rounded-xl border">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-gray-400 rounded-full"></div>
                    <span>Draft</span>
                  </div>
                  <span className="font-semibold">{data?.proposalsByStatus.draft || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                    <span>Submitted</span>
                  </div>
                  <span className="font-semibold">{data?.proposalsByStatus.submitted || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-yellow-500 rounded-full"></div>
                    <span>Pending</span>
                  </div>
                  <span className="font-semibold">{data?.proposalsByStatus.pending || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                    <span>Won</span>
                  </div>
                  <span className="font-semibold">{data?.proposalsByStatus.won || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-red-500 rounded-full"></div>
                    <span>Lost</span>
                  </div>
                  <span className="font-semibold">{data?.proposalsByStatus.lost || 0}</span>
                </div>
              </div>
              <div className="mt-6 pt-4 border-t">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-500">Avg Proposal Value</span>
                  <span className="font-semibold">{formatCurrency(data?.pipeline.avgProposalValue || 0)}</span>
                </div>
              </div>
            </div>
          </section>

          {/* Clients */}
          <section>
            <h2 className="text-lg font-semibold mb-4">Clients</h2>
            <div className="bg-white p-6 rounded-xl border">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Users className="w-5 h-5 text-gray-400" />
                    <span>Total Contracts</span>
                  </div>
                  <span className="font-semibold">{data?.clients.totalContracts || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle className="w-5 h-5 text-green-500" />
                    <span>Active</span>
                  </div>
                  <span className="font-semibold">{data?.clients.activeContracts || 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <XCircle className="w-5 h-5 text-blue-500" />
                    <span>Completed</span>
                  </div>
                  <span className="font-semibold">{data?.clients.completedContracts || 0}</span>
                </div>
              </div>
              {/* Client Quality Scores */}
              {(data?.clients.topClients?.length ?? 0) > 0 && (
                <div className="mt-6 pt-4 border-t">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-sm font-medium">Client Quality Score</span>
                    <span className="text-2xl font-bold text-violet-600">{data?.clients.avgQualityScore || 0}</span>
                  </div>
                  <div className="flex items-center justify-between text-sm mb-4">
                    <span className="text-gray-500">Repeat Client Rate</span>
                    <span className="font-semibold">{data?.clients.repeatClientRate || 0}%</span>
                  </div>
                  <div className="space-y-2">
                    <p className="text-xs font-medium text-gray-500 uppercase">Top Clients</p>
                    {data?.clients.topClients?.slice(0, 3).map((client, idx) => (
                      <div key={idx} className="flex items-center justify-between text-sm">
                        <div className="flex items-center gap-2">
                          <Star className="w-4 h-4 text-yellow-500 fill-yellow-500" />
                          <span className="truncate max-w-[120px]">{client.name}</span>
                        </div>
                        <span className={`font-semibold ${
                          client.score >= 80 ? 'text-green-600' : 
                          client.score >= 60 ? 'text-yellow-600' : 'text-red-600'
                        }`}>{client.score}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>

        {/* Monthly Revenue Chart */}
        <section>
          <h2 className="text-lg font-semibold mb-4">Revenue History</h2>
          <div className="bg-white p-6 rounded-xl border">
            <div className="flex items-end gap-2 h-48">
              {(data?.monthlyRevenue || []).map((month, idx) => {
                const maxRevenue = Math.max(...(data?.monthlyRevenue?.map(m => m.revenue) || [1]));
                const height = maxRevenue > 0 ? (month.revenue / maxRevenue) * 100 : 0;
                return (
                  <div key={idx} className="flex-1 flex flex-col items-center gap-2">
                    <div 
                      className="w-full bg-violet-500 rounded-t transition-all hover:bg-violet-600"
                      style={{ height: `${Math.max(height, 4)}%` }}
                      title={formatCurrency(month.revenue)}
                    ></div>
                    <span className="text-xs text-gray-500">{month.month}</span>
                  </div>
                );
              })}
            </div>
            {(data?.monthlyRevenue || []).every(m => m.revenue === 0) && (
              <p className="text-center text-gray-500 mt-4">No revenue data yet. Start closing deals!</p>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}
