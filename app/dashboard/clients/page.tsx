"use client";

import { useState } from "react";
import { Plus, Edit, Trash2, Eye, EyeOff, CheckCircle, Clock, AlertCircle } from "lucide-react";

interface Client {
  id: string;
  name: string;
  email: string;
  company?: string;
  status: "active" | "paused" | "completed";
  jobs: number;
  revenue: number;
  nextDeadline?: string;
}

const mockClients: Client[] = [
  {
    id: "1",
    name: "Acme Corp",
    email: "contact@acme.com",
    company: "Acme Corporation",
    status: "active",
    jobs: 3,
    revenue: 5500,
    nextDeadline: "2026-03-15",
  },
  {
    id: "2",
    name: "TechStart Inc",
    email: "hello@techstart.io",
    status: "active",
    jobs: 2,
    revenue: 3200,
    nextDeadline: "2026-03-10",
  },
  {
    id: "3",
    name: "Design Co",
    email: "projects@designco.com",
    status: "paused",
    jobs: 1,
    revenue: 1500,
  },
];

export default function ClientsPage() {
  const [clients, setClients] = useState<Client[]>(mockClients);
  const [showForm, setShowForm] = useState(false);
  const [newClient, setNewClient] = useState({ name: "", email: "", company: "" });

  const addClient = () => {
    if (!newClient.name || !newClient.email) return;
    
    const client: Client = {
      id: Date.now().toString(),
      name: newClient.name,
      email: newClient.email,
      company: newClient.company,
      status: "active",
      jobs: 0,
      revenue: 0,
    };
    
    setClients([...clients, client]);
    setNewClient({ name: "", email: "", company: "" });
    setShowForm(false);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active": return "bg-green-100 text-green-700";
      case "paused": return "bg-yellow-100 text-yellow-700";
      case "completed": return "bg-gray-100 text-gray-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const getDeadlineStatus = (deadline?: string) => {
    if (!deadline) return null;
    const days = Math.ceil((new Date(deadline).getTime() - Date.now()) / (1000 * 60 * 60 * 24));
    if (days < 0) return { color: "text-red-600", icon: AlertCircle, label: "Overdue" };
    if (days <= 3) return { color: "text-orange-600", icon: Clock, label: `${days}d left` };
    return { color: "text-gray-600", icon: CheckCircle, label: `${days}d left` };
  };

  const totalRevenue = clients.reduce((sum, c) => sum + c.revenue, 0);
  const activeClients = clients.filter(c => c.status === "active").length;

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Clients</h1>
            <p className="mt-1 text-gray-500">Manage your client relationships</p>
          </div>
          <button
            onClick={() => setShowForm(!showForm)}
            className="flex items-center gap-2 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
          >
            <Plus className="h-4 w-4" />
            Add Client
          </button>
        </div>

        {/* Stats */}
        <div className="mb-8 grid grid-cols-3 gap-4">
          <div className="rounded-xl bg-white p-6 border">
            <p className="text-sm text-gray-500">Total Clients</p>
            <p className="mt-1 text-3xl font-bold text-gray-900">{clients.length}</p>
          </div>
          <div className="rounded-xl bg-white p-6 border">
            <p className="text-sm text-gray-500">Active Clients</p>
            <p className="mt-1 text-3xl font-bold text-green-600">{activeClients}</p>
          </div>
          <div className="rounded-xl bg-white p-6 border">
            <p className="text-sm text-gray-500">Total Revenue</p>
            <p className="mt-1 text-3xl font-bold text-violet-600">${totalRevenue.toLocaleString()}</p>
          </div>
        </div>

        {/* Add Client Form */}
        {showForm && (
          <div className="mb-8 rounded-xl bg-white p-6 border">
            <h3 className="mb-4 text-lg font-semibold">Add New Client</h3>
            <div className="grid gap-4 md:grid-cols-3">
              <input
                type="text"
                placeholder="Client Name *"
                value={newClient.name}
                onChange={(e) => setNewClient({ ...newClient, name: e.target.value })}
                className="rounded-lg border border-gray-300 px-4 py-2"
              />
              <input
                type="email"
                placeholder="Email *"
                value={newClient.email}
                onChange={(e) => setNewClient({ ...newClient, email: e.target.value })}
                className="rounded-lg border border-gray-300 px-4 py-2"
              />
              <input
                type="text"
                placeholder="Company (optional)"
                value={newClient.company}
                onChange={(e) => setNewClient({ ...newClient, company: e.target.value })}
                className="rounded-lg border border-gray-300 px-4 py-2"
              />
            </div>
            <div className="mt-4 flex gap-2">
              <button
                onClick={addClient}
                className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
              >
                Add Client
              </button>
              <button
                onClick={() => setShowForm(false)}
                className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
            </div>
          </div>
        )}

        {/* Clients Table */}
        <div className="rounded-xl bg-white border overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Client</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Jobs</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Next Deadline</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {clients.map((client) => {
                const deadlineStatus = getDeadlineStatus(client.nextDeadline);
                return (
                  <tr key={client.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="h-10 w-10 rounded-full bg-violet-100 flex items-center justify-center">
                          <span className="text-sm font-medium text-violet-600">
                            {client.name.charAt(0).toUpperCase()}
                          </span>
                        </div>
                        <div className="ml-4">
                          <p className="font-medium text-gray-900">{client.name}</p>
                          <p className="text-sm text-gray-500">{client.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getStatusColor(client.status)}`}>
                        {client.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-900">{client.jobs}</td>
                    <td className="px-6 py-4 text-gray-900">${client.revenue.toLocaleString()}</td>
                    <td className="px-6 py-4">
                      {deadlineStatus ? (
                        <span className={`flex items-center gap-1 text-sm ${deadlineStatus.color}`}>
                          <deadlineStatus.icon className="h-4 w-4" />
                          {deadlineStatus.label}
                        </span>
                      ) : (
                        <span className="text-sm text-gray-400">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex justify-end gap-2">
                        <button className="rounded p-1 text-gray-400 hover:text-gray-600">
                          <Eye className="h-4 w-4" />
                        </button>
                        <button className="rounded p-1 text-gray-400 hover:text-gray-600">
                          <Edit className="h-4 w-4" />
                        </button>
                        <button className="rounded p-1 text-gray-400 hover:text-red-600">
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
