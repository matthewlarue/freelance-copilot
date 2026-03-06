"use client";

import { useState } from "react";
import { FileText, Download, Plus, Trash2, Copy } from "lucide-react";

interface InvoiceItem {
  id: string;
  description: string;
  quantity: number;
  rate: number;
}

export default function InvoiceGenerator() {
  const [invoiceNumber, setInvoiceNumber] = useState(
    `INV-${String(new Date().getFullYear()).slice(-2)}${String(Date.now()).slice(-4)}`
  );
  const [clientName, setClientName] = useState("");
  const [clientEmail, setClientEmail] = useState("");
  const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
  const [dueDate, setDueDate] = useState(
    new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split("T")[0]
  );
  const [items, setItems] = useState<InvoiceItem[]>([
    { id: "1", description: "Professional Services", quantity: 1, rate: 0 }
  ]);
  const [notes, setNotes] = useState("");

  const subtotal = items.reduce((sum, item) => sum + item.quantity * item.rate, 0);
  const tax = subtotal * 0.0; // Adjust tax rate as needed
  const total = subtotal + tax;

  const addItem = () => {
    setItems([
      ...items,
      { id: Date.now().toString(), description: "", quantity: 1, rate: 0 }
    ]);
  };

  const removeItem = (id: string) => {
    setItems(items.filter((item) => item.id !== id));
  };

  const updateItem = (id: string, field: keyof InvoiceItem, value: string | number) => {
    setItems(
      items.map((item) =>
        item.id === id ? { ...item, [field]: value } : item
      )
    );
  };

  const copyToClipboard = () => {
    const invoiceText = `
INVOICE #${invoiceNumber}

From: [Your Name]
To: ${clientName}
${clientEmail ? `Email: ${clientEmail}` : ""}
Date: ${date}
Due Date: ${dueDate}

Items:
${items.map((item) => `${item.description}: $${(item.quantity * item.rate).toFixed(2)}`).join("\n")}

Subtotal: $${subtotal.toFixed(2)}
Tax: $${tax.toFixed(2)}
TOTAL: $${total.toFixed(2)}

${notes ? `Notes: ${notes}` : ""}
    `.trim();

    navigator.clipboard.writeText(invoiceText);
    alert("Invoice copied to clipboard!");
  };

  const downloadPDF = () => {
    // In production, use a PDF library like @react-pdf/renderer
    alert("PDF download requires @react-pdf/renderer integration. Use 'Copy to Clipboard' for now.");
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="mx-auto max-w-4xl">
        <div className="mb-8 flex items-center justify-between">
          <h1 className="text-2xl font-bold text-gray-900">Invoice Generator</h1>
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="flex items-center gap-2 rounded-lg bg-gray-200 px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-300"
            >
              <Copy className="h-4 w-4" />
              Copy
            </button>
            <button
              onClick={downloadPDF}
              className="flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700"
            >
              <Download className="h-4 w-4" />
              Download PDF
            </button>
          </div>
        </div>

        <div className="rounded-xl bg-white p-8 shadow-sm">
          {/* Header */}
          <div className="mb-8 flex justify-between">
            <div>
              <div className="flex items-center gap-2">
                <FileText className="h-8 w-8 text-blue-600" />
                <span className="text-xl font-bold text-gray-900">INVOICE</span>
              </div>
              <input
                type="text"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                className="mt-2 rounded border border-gray-300 px-3 py-1 text-sm font-medium"
              />
            </div>
            <div className="text-right text-sm text-gray-600">
              <p>Date:</p>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="mt-1 rounded border border-gray-300 px-2 py-1"
              />
              <p className="mt-2">Due Date:</p>
              <input
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                className="mt-1 rounded border border-gray-300 px-2 py-1"
              />
            </div>
          </div>

          {/* Client Info */}
          <div className="mb-8 grid grid-cols-2 gap-8">
            <div>
              <label className="block text-sm font-medium text-gray-700">From</label>
              <p className="mt-1 text-sm text-gray-600">[Your Name / Company]</p>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Bill To</label>
              <input
                type="text"
                placeholder="Client Name"
                value={clientName}
                onChange={(e) => setClientName(e.target.value)}
                className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
              />
              <input
                type="email"
                placeholder="Client Email (optional)"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                className="mt-2 w-full rounded border border-gray-300 px-3 py-2"
              />
            </div>
          </div>

          {/* Line Items */}
          <div className="mb-8">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 text-left text-sm text-gray-600">
                  <th className="pb-3 font-medium">Description</th>
                  <th className="pb-3 w-24 text-right font-medium">Qty</th>
                  <th className="pb-3 w-32 text-right font-medium">Rate</th>
                  <th className="pb-3 w-32 text-right font-medium">Amount</th>
                  <th className="w-10"></th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-gray-100">
                    <td className="py-3">
                      <input
                        type="text"
                        placeholder="Item description"
                        value={item.description}
                        onChange={(e) => updateItem(item.id, "description", e.target.value)}
                        className="w-full rounded border border-gray-300 px-3 py-2"
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="number"
                        min="1"
                        value={item.quantity}
                        onChange={(e) => updateItem(item.id, "quantity", parseInt(e.target.value) || 1)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-right"
                      />
                    </td>
                    <td className="py-3">
                      <input
                        type="number"
                        min="0"
                        step="0.01"
                        value={item.rate}
                        onChange={(e) => updateItem(item.id, "rate", parseFloat(e.target.value) || 0)}
                        className="w-full rounded border border-gray-300 px-3 py-2 text-right"
                      />
                    </td>
                    <td className="py-3 text-right font-medium">
                      ${(item.quantity * item.rate).toFixed(2)}
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => removeItem(item.id)}
                        className="rounded p-1 text-red-500 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <button
              onClick={addItem}
              className="mt-3 flex items-center gap-1 text-sm text-blue-600 hover:text-blue-700"
            >
              <Plus className="h-4 w-4" />
              Add Line Item
            </button>
          </div>

          {/* Totals */}
          <div className="flex justify-end">
            <div className="w-64">
              <div className="flex justify-between py-2 text-gray-600">
                <span>Subtotal</span>
                <span>${subtotal.toFixed(2)}</span>
              </div>
              <div className="flex justify-between py-2 text-gray-600">
                <span>Tax (0%)</span>
                <span>${tax.toFixed(2)}</span>
              </div>
              <div className="flex justify-between border-t border-gray-200 py-3 text-lg font-bold text-gray-900">
                <span>Total</span>
                <span>${total.toFixed(2)}</span>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-8">
            <label className="block text-sm font-medium text-gray-700">Notes (optional)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Payment instructions, terms, etc."
              rows={3}
              className="mt-1 w-full rounded border border-gray-300 px-3 py-2"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
