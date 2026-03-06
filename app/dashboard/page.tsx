import { Rocket, Briefcase, FileText, MessageSquare, TrendingUp, Receipt, Users, BarChart3, MessageCircle } from "lucide-react";
import Link from "next/link";

export default function Dashboard() {
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
          <div className="text-sm text-gray-500">
            MVP Coming Soon
          </div>
        </div>
      </header>

      {/* Dashboard */}
      <main className="max-w-7xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-bold mb-6">Dashboard</h1>

        {/* Quick Actions */}
        <div className="grid md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
          <Link href="/dashboard/jobs" className="bg-white p-6 rounded-xl border hover:border-violet-500 transition-colors">
            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center mb-3">
              <Briefcase className="w-5 h-5 text-blue-600" />
            </div>
            <h3 className="font-semibold">Jobs</h3>
            <p className="text-sm text-gray-500">Add and manage job listings</p>
          </Link>

          <Link href="/dashboard/clients" className="bg-white p-6 rounded-xl border hover:border-violet-500 transition-colors">
            <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center mb-3">
              <Users className="w-5 h-5 text-cyan-600" />
            </div>
            <h3 className="font-semibold">Clients</h3>
            <p className="text-sm text-gray-500">Manage client relationships</p>
          </Link>

          <Link href="/dashboard/proposals" className="bg-white p-6 rounded-xl border hover:border-violet-500 transition-colors">
            <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center mb-3">
              <FileText className="w-5 h-5 text-green-600" />
            </div>
            <h3 className="font-semibold">Proposals</h3>
            <p className="text-sm text-gray-500">Draft and submit proposals</p>
          </Link>

          <Link href="/dashboard/invoice-generator" className="bg-white p-6 rounded-xl border hover:border-violet-500 transition-colors">
            <div className="w-10 h-10 bg-emerald-100 rounded-lg flex items-center justify-center mb-3">
              <Receipt className="w-5 h-5 text-emerald-600" />
            </div>
            <h3 className="font-semibold">Invoices</h3>
            <p className="text-sm text-gray-500">Generate invoices & contracts</p>
          </Link>

          <Link href="/dashboard/workspace" className="bg-white p-6 rounded-xl border hover:border-violet-500 transition-colors">
            <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center mb-3">
              <MessageSquare className="w-5 h-5 text-purple-600" />
            </div>
            <h3 className="font-semibold">Workspace</h3>
            <p className="text-sm text-gray-500">Execute work with AI</p>
          </Link>

          <Link href="/dashboard/pipeline" className="bg-white p-6 rounded-xl border hover:border-violet-500 transition-colors">
            <div className="w-10 h-10 bg-orange-100 rounded-lg flex items-center justify-center mb-3">
              <TrendingUp className="w-5 h-5 text-orange-600" />
            </div>
            <h3 className="font-semibold">Pipeline</h3>
            <p className="text-sm text-gray-500">Track your progress</p>
          </Link>

          <Link href="/dashboard/analytics" className="bg-white p-6 rounded-xl border hover:border-violet-500 transition-colors">
            <div className="w-10 h-10 bg-violet-100 rounded-lg flex items-center justify-center mb-3">
              <BarChart3 className="w-5 h-5 text-violet-600" />
            </div>
            <h3 className="font-semibold">Analytics</h3>
            <p className="text-sm text-gray-500">Revenue & insights</p>
          </Link>

          <Link href="/dashboard/communication" className="bg-white p-6 rounded-xl border hover:border-violet-500 transition-colors">
            <div className="w-10 h-10 bg-pink-100 rounded-lg flex items-center justify-center mb-3">
              <MessageCircle className="w-5 h-5 text-pink-600" />
            </div>
            <h3 className="font-semibold">Communication</h3>
            <p className="text-sm text-gray-500">Outreach & Q&A assistant</p>
          </Link>
        </div>

        {/* Empty State */}
        <div className="bg-white rounded-xl border p-12 text-center">
          <div className="w-16 h-16 bg-violet-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Rocket className="w-8 h-8 text-violet-600" />
          </div>
          <h2 className="text-xl font-semibold mb-2">Welcome to Freelance Copilot</h2>
          <p className="text-gray-500 mb-4">
            This is the MVP. Add your first job to get started.
          </p>
          <Link href="/dashboard/jobs" className="inline-flex bg-violet-600 text-white px-4 py-2 rounded-lg font-medium hover:bg-violet-700">
            Add First Job
          </Link>
        </div>
      </main>
    </div>
  );
}
