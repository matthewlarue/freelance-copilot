import Link from "next/link";
import { Rocket, Search, FileText, BarChart3 } from "lucide-react";

export default function Home() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-violet-50 to-indigo-100">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-5xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-violet-600 rounded-lg flex items-center justify-center">
              <Rocket className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl">Freelance Copilot</span>
          </div>
          <div className="flex gap-4">
            <Link href="/login" className="text-sm font-medium hover:text-violet-600">
              Log in
            </Link>
            <Link href="/dashboard" className="text-sm font-medium bg-violet-600 text-white px-4 py-2 rounded-lg hover:bg-violet-700">
              Get Started
            </Link>
          </div>
        </div>
      </header>

      {/* Hero */}
      <main className="max-w-5xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <h1 className="text-5xl font-bold mb-6 text-gray-900">
            Your AI Freelance
            <span className="text-violet-600"> Copilot</span>
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto mb-8">
            Find opportunities faster. Write better proposals. 
            Execute with AI assistance. All while you stay in control.
          </p>
          <Link href="/dashboard" className="inline-flex items-center gap-2 bg-violet-600 text-white px-8 py-4 rounded-lg text-lg font-semibold hover:bg-violet-700 transition-colors">
            Start Free
            <Rocket className="w-5 h-5" />
          </Link>
        </div>

        {/* Features */}
        <div className="grid md:grid-cols-3 gap-8 mt-20">
          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mb-4">
              <Search className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Find Opportunities</h3>
            <p className="text-gray-600">
              Discover jobs that match your skills. Filter by budget, scope, and competition.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mb-4">
              <FileText className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Write Proposals</h3>
            <p className="text-gray-600">
              AI drafts personalized proposals. You review, edit, then submit.
            </p>
          </div>

          <div className="bg-white rounded-xl p-6 shadow-sm border">
            <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mb-4">
              <BarChart3 className="w-6 h-6 text-purple-600" />
            </div>
            <h3 className="text-lg font-semibold mb-2">Track Progress</h3>
            <p className="text-gray-600">
              Monitor your pipeline. Analyze win rates. Improve over time.
            </p>
          </div>
        </div>

        {/* CTA */}
        <div className="mt-20 text-center">
          <p className="text-gray-600 mb-4">Ready to accelerate your freelance business?</p>
          <Link href="/dashboard" className="text-violet-600 font-semibold hover:underline">
            Try it now →
          </Link>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t py-8 mt-20">
        <div className="max-w-5xl mx-auto px-6 text-center text-gray-500 text-sm">
          © 2026 Freelance Copilot. Built for freelancers, by freelancers.
        </div>
      </footer>
    </div>
  );
}
