"use client";

import { useState, useEffect } from "react";
import { Plus, Briefcase, DollarSign, FileText, TrendingUp, User } from "lucide-react";
import Link from "next/link";

type Job = {
  id: string;
  title: string;
  description: string;
  budget: string;
  source: string;
  skills: string;
  createdAt: string;
};

type Proposal = {
  id: string;
  jobId: string;
  content: string;
  status: string;
};

type JobMatch = {
  job: Job;
  score: number;
  matchReasons: string[];
};

export default function JobsPage() {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [showAdd, setShowAdd] = useState(false);
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [generating, setGenerating] = useState<string | null>(null);
  const [matches, setMatches] = useState<JobMatch[]>([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [showMatches, setShowMatches] = useState(false);
  const [form, setForm] = useState({
    title: "",
    description: "",
    budget: "",
    source: "manual",
    skills: "",
  });

  useEffect(() => {
    fetchJobs();
    fetchProposals();
    fetchMatches();
  }, []);

  const fetchJobs = async () => {
    const res = await fetch("/api/jobs");
    const data = await res.json();
    setJobs(data.data || []);
  };

  const fetchProposals = async () => {
    const res = await fetch("/api/proposals");
    const data = await res.json();
    setProposals(data.data || []);
  };

  const fetchMatches = async () => {
    try {
      const res = await fetch("/api/jobs/match?limit=10");
      const data = await res.json();
      if (data.success) {
        setMatches(data.data || []);
      }
    } catch (error) {
      console.error("Failed to fetch matches:", error);
    } finally {
      setLoadingMatches(false);
    }
  };

  const getMatchScore = (jobId: string): number | null => {
    const match = matches.find(m => m.job.id === jobId);
    return match ? match.score : null;
  };

  const getMatchReasons = (jobId: string): string[] => {
    const match = matches.find(m => m.job.id === jobId);
    return match ? match.matchReasons : [];
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const res = await fetch("/api/jobs", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    if (res.ok) {
      const data = await res.json();
      setJobs([data.data, ...jobs]);
      setShowAdd(false);
      setForm({ title: "", description: "", budget: "", source: "manual", skills: "" });
    }
  };

  const generateProposal = async (job: Job) => {
    setGenerating(job.id);
    try {
      const res = await fetch("/api/proposals", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          jobId: job.id,
          jobTitle: job.title,
          jobDescription: job.description,
          generateAI: true,
        }),
      });
      if (res.ok) {
        const data = await res.json();
        setProposals([...proposals, data.data]);
      }
    } catch (error) {
      console.error("Failed to generate:", error);
    }
    setGenerating(null);
  };

  const hasProposal = (jobId: string) => proposals.some((p) => p.jobId === jobId);

  const getMatchColor = (score: number) => {
    if (score >= 70) return "bg-green-100 text-green-700";
    if (score >= 40) return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Briefcase className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Freelance Copilot</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold">Jobs</h1>
            <p className="text-gray-500">Add freelance jobs you're interested in</p>
          </div>
          <div className="flex items-center gap-3">
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 px-3 py-2 rounded-lg hover:bg-gray-100"
            >
              <User className="w-4 h-4" />
              Profile
            </Link>
            <button
              onClick={() => setShowMatches(!showMatches)}
              disabled={loadingMatches}
              className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-violet-700 disabled:opacity-50"
            >
              <TrendingUp className="w-4 h-4" />
              {loadingMatches ? "Loading..." : "Best Matches"}
            </button>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 bg-violet-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-violet-700"
            >
              <Plus className="w-4 h-4" />
              Add Job
            </button>
          </div>
        </div>

        {/* Best Matches Section */}
        {showMatches && matches.length > 0 && (
          <div className="bg-gradient-to-r from-violet-600 to-purple-600 rounded-xl p-6 mb-6 text-white">
            <div className="flex items-center gap-2 mb-4">
              <TrendingUp className="w-5 h-5" />
              <h2 className="text-lg font-bold">AI Recommended Jobs</h2>
            </div>
            <p className="text-violet-100 text-sm mb-4">
              Based on your profile skills and preferences
            </p>
            <div className="grid gap-3">
              {matches.slice(0, 5).map((match) => (
                <div
                  key={match.job.id}
                  className="bg-white/10 backdrop-blur rounded-lg p-4 flex items-center justify-between hover:bg-white/20 transition"
                >
                  <div className="flex-1">
                    <h3 className="font-semibold">{match.job.title}</h3>
                    <div className="flex gap-2 mt-1">
                      {match.matchReasons.slice(0, 2).map((reason, i) => (
                        <span key={i} className="text-xs text-violet-200">
                          ✓ {reason}
                        </span>
                      ))}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="text-right">
                      <div className="text-2xl font-bold">{match.score}%</div>
                      <div className="text-xs text-violet-200">Match</div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            <div className="mt-4 pt-4 border-t border-white/20">
              <Link href="/dashboard/profile" className="text-sm text-violet-200 hover:text-white">
                → Update your profile for better matches
              </Link>
            </div>
          </div>
        )}

        {/* No Profile Warning */}
        {showMatches && !loadingMatches && matches.length === 0 && (
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-6 mb-6">
            <h3 className="font-semibold text-amber-900 mb-2">Set up your profile</h3>
            <p className="text-amber-800 text-sm mb-4">
              Add your skills and preferences to get AI-powered job recommendations.
            </p>
            <Link
              href="/dashboard/profile"
              className="inline-flex items-center gap-2 text-amber-700 font-medium hover:underline"
            >
              <User className="w-4 h-4" />
              Go to Profile
            </Link>
          </div>
        )}

        {/* Add Job Modal */}
        {showAdd && (
          <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-lg">
              <h2 className="text-xl font-bold mb-4">Add Job</h2>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium mb-1">Job Title *</label>
                  <input
                    type="text"
                    value={form.title}
                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="e.g., Build a React dashboard"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Description *</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg h-32"
                    placeholder="Paste job description..."
                    required
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Budget</label>
                    <input
                      type="text"
                      value={form.budget}
                      onChange={(e) => setForm({ ...form, budget: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                      placeholder="e.g., $500-1000"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium mb-1">Source</label>
                    <select
                      value={form.source}
                      onChange={(e) => setForm({ ...form, source: e.target.value })}
                      className="w-full px-3 py-2 border rounded-lg"
                    >
                      <option value="manual">Manual</option>
                      <option value="upwork">Upwork</option>
                      <option value="linkedin">LinkedIn</option>
                      <option value="indeed">Indeed</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-1">Skills (comma-separated)</label>
                  <input
                    type="text"
                    value={form.skills}
                    onChange={(e) => setForm({ ...form, skills: e.target.value })}
                    className="w-full px-3 py-2 border rounded-lg"
                    placeholder="React, TypeScript, Tailwind"
                  />
                </div>
                <div className="flex gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowAdd(false)}
                    className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                  >
                    Add Job
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Jobs List */}
        {jobs.length === 0 ? (
          <div className="bg-white rounded-xl border p-12 text-center">
            <Briefcase className="w-12 h-12 text-gray-300 mx-auto mb-4" />
            <h3 className="font-semibold mb-2">No jobs yet</h3>
            <p className="text-gray-500 mb-4">Add your first job to get started</p>
            <button
              onClick={() => setShowAdd(true)}
              className="inline-flex items-center gap-2 text-violet-600 font-medium"
            >
              <Plus className="w-4 h-4" />
              Add Job
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {jobs.map((job) => {
              const matchScore = getMatchScore(job.id);
              const matchReasons = getMatchReasons(job.id);
              
              return (
                <div key={job.id} className="bg-white rounded-xl border p-6">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-semibold text-lg">{job.title}</h3>
                        {matchScore !== null && (
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${getMatchColor(matchScore)}`}>
                            {matchScore}% match
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-gray-500 mb-2">
                        {job.source} • Added {new Date(job.createdAt).toLocaleDateString()}
                      </p>
                      <p className="text-gray-700 line-clamp-3 mb-3">{job.description}</p>
                      {matchReasons.length > 0 && (
                        <div className="flex gap-2 flex-wrap mb-3">
                          {matchReasons.slice(0, 3).map((reason, i) => (
                            <span key={i} className="text-xs text-violet-600 bg-violet-50 px-2 py-1 rounded">
                              {reason}
                            </span>
                          ))}
                        </div>
                      )}
                      {job.skills && (
                        <div className="flex gap-2 flex-wrap">
                          {job.skills.split(",").map((skill) => (
                            <span key={skill} className="px-2 py-1 bg-violet-100 text-violet-700 rounded text-xs">
                              {skill.trim()}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="flex flex-col items-end gap-2 ml-4">
                      {job.budget && (
                        <div className="flex items-center gap-1 text-green-600 font-medium">
                          <DollarSign className="w-4 h-4" />
                          {job.budget}
                        </div>
                      )}
                      {hasProposal(job.id) ? (
                        <span className="text-sm text-gray-500 flex items-center gap-1">
                          <FileText className="w-4 h-4" />
                          Proposal ready
                        </span>
                      ) : (
                        <button
                          onClick={() => generateProposal(job)}
                          disabled={generating === job.id}
                          className="flex items-center gap-1 text-sm bg-violet-100 text-violet-700 px-3 py-1.5 rounded-lg hover:bg-violet-200 disabled:opacity-50"
                        >
                          {generating === job.id ? (
                            <>Generating...</>
                          ) : (
                            <>
                              <FileText className="w-4 h-4" />
                              Generate Proposal
                            </>
                          )}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </main>
    </div>
  );
}
