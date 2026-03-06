import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/invoices - List all invoices
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    const contractId = searchParams.get("contractId");
    
    const invoices = await prisma.invoice.findMany({
      where: {
        ...(status && { status }),
        ...(contractId && { contractId }),
      },
      include: {
        contract: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: invoices });
  } catch (error) {
    console.error("Error fetching invoices:", error);
    return NextResponse.json(
      { error: "Failed to fetch invoices" },
      { status: 500 }
    );
  }
}

// POST /api/invoices - Create a new invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      invoiceNumber,
      description,
      amount,
      status = "draft",
      dueDate,
      contractId,
    } = body;

    if (!invoiceNumber || !amount || !contractId) {
      return NextResponse.json(
        { error: "Invoice number, amount, and contract ID are required" },
        { status: 400 }
      );
    }

    // For now, use a demo user ID - in production, get from session
    const userId = "demo-user";

    const invoice = await prisma.invoice.create({
      data: {
        invoiceNumber,
        description,
        amount,
        status,
        dueDate: dueDate ? new Date(dueDate) : null,
        contractId,
        userId,
      },
      include: {
        contract: true,
      },
    });

    return NextResponse.json({ success: true, data: invoice }, { status: 201 });
  } catch (error) {
    console.error("Error creating invoice:", error);
    return NextResponse.json(
      { error: "Failed to create invoice" },
      { status: 500 }
    );
  }
}
