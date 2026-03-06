"use client";

import { useState, useEffect } from "react";
import { FileText, Copy, Check, Send, Trash2, Plus, Library, Star, Clock, Bookmark } from "lucide-react";

type Proposal = {
  id: string;
  jobId: string;
  jobTitle: string;
  content: string;
  status: string;
  createdAt: string;
  submittedAt: string | null;
};

type Template = {
  id: string;
  name: string;
  description: string | null;
  content: string;
  category: string | null;
  useCount: number;
  successCount: number;
  createdAt: string;
};

export default function ProposalsPage() {
  const [proposals, setProposals] = useState<Proposal[]>([]);
  const [templates, setTemplates] = useState<Template[]>([]);
  const [selected, setSelected] = useState<Proposal | null>(null);
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<"proposals" | "templates">("proposals");
  
  // Edit mode
  const [isEditing, setIsEditing] = useState(false);
  const [editContent, setEditContent] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  // Template creation modal
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [templateName, setTemplateName] = useState("");
  const [templateDescription, setTemplateDescription] = useState("");
  const [templateCategory, setTemplateCategory] = useState("general");

  // Hardcoded userId for demo - in production would come from auth
  const userId = "demo-user";

  useEffect(() => {
    fetchProposals();
    fetchTemplates();
  }, []);

  const fetchProposals = async () => {
    const res = await fetch("/api/proposals");
    const data = await res.json();
    setProposals(data.data || []);
  };

  const fetchTemplates = async () => {
    const res = await fetch("/api/proposal-templates");
    const data = await res.json();
    setTemplates(data.data || []);
  };

  const copyContent = (content: string) => {
    navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const startEditing = () => {
    if (selected) {
      setEditContent(selected.content);
      setIsEditing(true);
    }
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setEditContent("");
  };

  const saveEdit = async () => {
    if (!selected) return;
    
    const res = await fetch("/api/proposals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, content: editContent }),
    });
    
    if (res.ok) {
      const updated = await res.json();
      setProposals(proposals.map((p) => (p.id === selected.id ? updated.data : p)));
      setSelected(updated.data);
      setIsEditing(false);
    }
  };

  const submitProposal = async () => {
    if (!selected) return;
    setIsSubmitting(true);
    
    const res = await fetch("/api/proposals", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: selected.id, status: "submitted" }),
    });
    
    if (res.ok) {
      const updated = await res.json();
      setProposals(proposals.map((p) => (p.id === selected.id ? updated.data : p)));
      setSelected(updated.data);
    }
    setIsSubmitting(false);
  };

  const updateStatus = async (id: string, status: string) => {
    const updated = proposals.map((p) => (p.id === id ? { ...p, status } : p));
    setProposals(updated);
    if (selected?.id === id) {
      setSelected({ ...selected, status });
    }
  };

  const deleteProposal = async (id: string) => {
    if (!confirm("Delete this proposal?")) return;
    setProposals(proposals.filter((p) => p.id !== id));
    if (selected?.id === id) setSelected(null);
  };

  const saveAsTemplate = async () => {
    if (!selected || !templateName || !templateDescription) return;

    const res = await fetch("/api/proposal-templates", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: templateName,
        description: templateDescription,
        category: templateCategory,
        content: selected.content,
        userId,
      }),
    });

    if (res.ok) {
      fetchTemplates();
      setShowTemplateModal(false);
      setTemplateName("");
      setTemplateDescription("");
      setTemplateCategory("general");
    }
  };

  const deleteTemplate = async (id: string) => {
    if (!confirm("Delete this template?")) return;
    
    const res = await fetch(`/api/proposal-templates?id=${id}`, {
      method: "DELETE",
    });

    if (res.ok) {
      fetchTemplates();
      if (selectedTemplate?.id === id) setSelectedTemplate(null);
    }
  };

  const useTemplate = async (template: Template) => {
    // Increment use count
    await fetch("/api/proposal-templates", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ id: template.id, incrementUse: true }),
    });
    
    // Copy to clipboard
    copyContent(template.content);
    fetchTemplates(); // Refresh use counts
  };

  const stats = {
    total: proposals.length,
    draft: proposals.filter((p) => p.status === "draft").length,
    submitted: proposals.filter((p) => p.status === "submitted").length,
    won: proposals.filter((p) => p.status === "won").length,
    pending: proposals.filter((p) => p.status === "pending").length,
  };

  const categories = ["general", "technical", "creative", "consulting", "development"];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b">
        <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Freelance Copilot</span>
          </div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-8">
        {/* Tabs */}
        <div className="flex gap-4 mb-6 border-b">
          <button
            onClick={() => setActiveTab("proposals")}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === "proposals"
                ? "border-b-2 border-violet-600 text-violet-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <FileText className="w-4 h-4" />
              Proposals
            </div>
          </button>
          <button
            onClick={() => setActiveTab("templates")}
            className={`pb-3 px-1 font-medium transition-colors ${
              activeTab === "templates"
                ? "border-b-2 border-violet-600 text-violet-600"
                : "text-gray-500 hover:text-gray-700"
            }`}
          >
            <div className="flex items-center gap-2">
              <Library className="w-4 h-4" />
              Template Library ({templates.length})
            </div>
          </button>
        </div>

        {activeTab === "proposals" ? (
          <>
            <h1 className="text-2xl font-bold mb-6">Proposals</h1>

            {/* Stats */}
            <div className="grid grid-cols-5 gap-4 mb-8">
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-500">Total</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-500">Draft</p>
                <p className="text-2xl font-bold text-blue-600">{stats.draft}</p>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-500">Submitted</p>
                <p className="text-2xl font-bold text-yellow-600">{stats.submitted}</p>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-500">Pending</p>
                <p className="text-2xl font-bold text-orange-600">{stats.pending}</p>
              </div>
              <div className="bg-white rounded-lg border p-4">
                <p className="text-sm text-gray-500">Won</p>
                <p className="text-2xl font-bold text-green-600">{stats.won}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {/* List */}
              <div className="space-y-3">
                {proposals.length === 0 ? (
                  <div className="bg-white rounded-xl border p-8 text-center">
                    <FileText className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                    <h3 className="font-semibold mb-2">No proposals yet</h3>
                    <p className="text-gray-500">Go to Jobs to generate your first proposal</p>
                  </div>
                ) : (
                  proposals.map((p) => (
                    <div
                      key={p.id}
                      onClick={() => setSelected(p)}
                      className={`bg-white rounded-xl border p-4 cursor-pointer transition-colors ${
                        selected?.id === p.id ? "border-violet-500 ring-1 ring-violet-500" : "hover:border-gray-300"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h3 className="font-semibold">{p.jobTitle}</h3>
                          <p className="text-sm text-gray-500">
                            {new Date(p.createdAt).toLocaleDateString()}
                          </p>
                        </div>
                        <select
                          value={p.status}
                          onChange={(e) => {
                            e.stopPropagation();
                            updateStatus(p.id, e.target.value);
                          }}
                          className="text-xs px-2 py-1 rounded border"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <option value="draft">Draft</option>
                          <option value="submitted">Submitted</option>
                          <option value="pending">Pending</option>
                          <option value="won">Won</option>
                          <option value="lost">Lost</option>
                        </select>
                      </div>
                    </div>
                  ))
                )}
              </div>

              {/* Preview */}
              <div className="bg-white rounded-xl border h-fit sticky top-8">
                {selected ? (
                  <div className="p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">Proposal Preview</h3>
                        {selected.submittedAt && (
                          <p className="text-xs text-green-600 mt-1">
                            Submitted {new Date(selected.submittedAt).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                      <div className="flex gap-2 flex-wrap">
                        {isEditing ? (
                          <>
                            <button
                              onClick={saveEdit}
                              className="flex items-center gap-1 text-sm bg-green-600 text-white px-3 py-1.5 rounded hover:bg-green-700"
                            >
                              <Check className="w-4 h-4" />
                              Save
                            </button>
                            <button
                              onClick={cancelEditing}
                              className="flex items-center gap-1 text-sm text-gray-600 px-3 py-1.5 border rounded hover:bg-gray-50"
                            >
                              Cancel
                            </button>
                          </>
                        ) : (
                          <>
                            <button
                              onClick={() => copyContent(selected.content)}
                              className="flex items-center gap-1 text-sm text-gray-600 hover:text-gray-900"
                            >
                              {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                              {copied ? "Copied!" : "Copy"}
                            </button>
                            {selected.status === "draft" && (
                              <>
                                <button
                                  onClick={startEditing}
                                  className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700"
                                >
                                  Edit
                                </button>
                                <button
                                  onClick={submitProposal}
                                  disabled={isSubmitting}
                                  className="flex items-center gap-1 text-sm bg-yellow-500 text-white px-3 py-1.5 rounded hover:bg-yellow-600"
                                >
                                  <Send className="w-4 h-4" />
                                  {isSubmitting ? "Submitting..." : "Submit"}
                                </button>
                              </>
                            )}
                            <button
                              onClick={() => setShowTemplateModal(true)}
                              className="flex items-center gap-1 text-sm text-violet-600 hover:text-violet-700"
                            >
                              <Bookmark className="w-4 h-4" />
                              Template
                            </button>
                            <button
                              onClick={() => deleteProposal(selected.id)}
                              className="text-sm text-red-600 hover:text-red-700"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                    {isEditing ? (
                      <textarea
                        value={editContent}
                        onChange={(e) => setEditContent(e.target.value)}
                        className="w-full h-96 p-3 border rounded-lg font-mono text-sm focus:ring-2 focus:ring-violet-500 focus:outline-none"
                      />
                    ) : (
                      <div className="prose prose-sm max-w-none whitespace-pre-wrap">
                        {selected.content}
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="p-8 text-center text-gray-500">
                    Select a proposal to preview
                  </div>
                )}
              </div>
            </div>
          </>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <h1 className="text-2xl font-bold">Template Library</h1>
              <p className="text-gray-500">Save and reuse successful proposal fragments</p>
            </div>

            {templates.length === 0 ? (
              <div className="bg-white rounded-xl border p-12 text-center">
                <Library className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="font-semibold text-lg mb-2">No templates yet</h3>
                <p className="text-gray-500 mb-4">
                  Save proposals as templates to reuse successful fragments
                </p>
                <p className="text-sm text-gray-400">
                  Go to Proposals tab and click "Save as Template" on any proposal
                </p>
              </div>
            ) : (
              <div className="grid grid-cols-3 gap-4">
                {templates.map((template) => (
                  <div
                    key={template.id}
                    className={`bg-white rounded-xl border p-5 cursor-pointer transition-all hover:shadow-md ${
                      selectedTemplate?.id === template.id ? "border-violet-500 ring-1 ring-violet-500" : ""
                    }`}
                    onClick={() => setSelectedTemplate(template)}
                  >
                    <div className="flex items-start justify-between mb-2">
                      <h3 className="font-semibold">{template.name}</h3>
                      {template.category && (
                        <span className="text-xs bg-violet-100 text-violet-700 px-2 py-0.5 rounded-full">
                          {template.category}
                        </span>
                      )}
                    </div>
                    {template.description && (
                      <p className="text-sm text-gray-500 mb-3 line-clamp-2">{template.description}</p>
                    )}
                    <div className="flex items-center gap-4 text-xs text-gray-400">
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        Used {template.useCount}x
                      </div>
                      <div className="flex items-center gap-1">
                        <Star className="w-3 h-3" />
                        {template.successCount} wins
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* Template Preview */}
            {selectedTemplate && (
              <div className="mt-6 bg-white rounded-xl border p-6">
                <div className="flex items-center justify-between mb-4">
                  <div>
                    <h3 className="font-semibold text-lg">{selectedTemplate.name}</h3>
                    {selectedTemplate.description && (
                      <p className="text-gray-500 text-sm">{selectedTemplate.description}</p>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => useTemplate(selectedTemplate)}
                      className="flex items-center gap-2 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700"
                    >
                      <Copy className="w-4 h-4" />
                      Use Template
                    </button>
                    <button
                      onClick={() => copyContent(selectedTemplate.content)}
                      className="flex items-center gap-2 px-4 py-2 border rounded-lg hover:bg-gray-50"
                    >
                      <Copy className="w-4 h-4" />
                      Copy
                    </button>
                    <button
                      onClick={() => deleteTemplate(selectedTemplate.id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
                <div className="prose prose-sm max-w-none whitespace-pre-wrap bg-gray-50 p-4 rounded-lg">
                  {selectedTemplate.content}
                </div>
              </div>
            )}
          </>
        )}
      </main>

      {/* Save Template Modal */}
      {showTemplateModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-full max-w-md">
            <h2 className="text-xl font-bold mb-4">Save as Template</h2>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-1">Template Name *</label>
                <input
                  type="text"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                  placeholder="e.g., Technical Proposal, UX Design Intro"
                  className="w-full px-3 py-2 border rounded-lg"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Description *</label>
                <textarea
                  value={templateDescription}
                  onChange={(e) => setTemplateDescription(e.target.value)}
                  placeholder="When should this template be used?"
                  className="w-full px-3 py-2 border rounded-lg h-20"
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-1">Category</label>
                <select
                  value={templateCategory}
                  onChange={(e) => setTemplateCategory(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg"
                >
                  {categories.map((cat) => (
                    <option key={cat} value={cat}>
                      {cat.charAt(0).toUpperCase() + cat.slice(1)}
                    </option>
                  ))}
                </select>
              </div>
              <div className="bg-gray-50 p-3 rounded-lg">
                <p className="text-xs text-gray-500 mb-1">Preview:</p>
                <p className="text-sm text-gray-700 line-clamp-3">{selected?.content}</p>
              </div>
            </div>
            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowTemplateModal(false)}
                className="flex-1 px-4 py-2 border rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={saveAsTemplate}
                disabled={!templateName || !templateDescription}
                className="flex-1 px-4 py-2 bg-violet-600 text-white rounded-lg hover:bg-violet-700 disabled:opacity-50"
              >
                Save Template
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
