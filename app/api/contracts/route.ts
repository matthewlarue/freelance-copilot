import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/db";

// GET /api/contracts - List all contracts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const status = searchParams.get("status");
    
    const contracts = await prisma.contract.findMany({
      where: status ? { status } : undefined,
      include: {
        proposal: true,
        invoices: true,
      },
      orderBy: { createdAt: "desc" },
    });

    return NextResponse.json({ success: true, data: contracts });
  } catch (error) {
    console.error("Error fetching contracts:", error);
    return NextResponse.json(
      { error: "Failed to fetch contracts" },
      { status: 500 }
    );
  }
}

// POST /api/contracts - Create a new contract
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const {
      title,
      description,
      clientName,
      clientEmail,
      status = "draft",
      startDate,
      endDate,
      value,
      terms,
      proposalId,
    } = body;

    if (!title) {
      return NextResponse.json(
        { error: "Title is required" },
        { status: 400 }
      );
    }

    // For now, use a demo user ID - in production, get from session
    const userId = "demo-user";

    const contract = await prisma.contract.create({
      data: {
        title,
        description,
        clientName,
        clientEmail,
        status,
        startDate: startDate ? new Date(startDate) : null,
        endDate: endDate ? new Date(endDate) : null,
        value,
        terms,
        proposalId,
        userId,
      },
      include: {
        proposal: true,
        invoices: true,
      },
    });

    return NextResponse.json({ success: true, data: contract }, { status: 201 });
  } catch (error) {
    console.error("Error creating contract:", error);
    return NextResponse.json(
      { error: "Failed to create contract" },
      { status: 500 }
    );
  }
}
