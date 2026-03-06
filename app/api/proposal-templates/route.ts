import { NextResponse } from "next/server";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

// GET /api/proposal-templates - List all templates
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const category = searchParams.get("category");

    const where = category ? { category } : {};

    const templates = await prisma.proposalTemplate.findMany({
      where,
      orderBy: { useCount: "desc" },
    });

    return NextResponse.json({ data: templates });
  } catch (error) {
    console.error("Error fetching templates:", error);
    return NextResponse.json({ error: "Failed to fetch templates" }, { status: 500 });
  }
}

// POST /api/proposal-templates - Create a new template
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { name, description, content, category, userId } = body;

    if (!name || !content || !userId) {
      return NextResponse.json(
        { error: "Missing required fields: name, content, userId" },
        { status: 400 }
      );
    }

    const template = await prisma.proposalTemplate.create({
      data: {
        name,
        description,
        content,
        category,
        userId,
      },
    });

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error("Error creating template:", error);
    return NextResponse.json({ error: "Failed to create template" }, { status: 500 });
  }
}

// PATCH /api/proposal-templates - Update a template (e.g., increment useCount)
export async function PATCH(request: Request) {
  try {
    const body = await request.json();
    const { id, incrementUse, incrementSuccess } = body;

    if (!id) {
      return NextResponse.json({ error: "Template ID required" }, { status: 400 });
    }

    const updateData: any = {};
    if (incrementUse) {
      updateData.useCount = { increment: 1 };
    }
    if (incrementSuccess) {
      updateData.successCount = { increment: 1 };
    }

    const template = await prisma.proposalTemplate.update({
      where: { id },
      data: updateData,
    });

    return NextResponse.json({ data: template });
  } catch (error) {
    console.error("Error updating template:", error);
    return NextResponse.json({ error: "Failed to update template" }, { status: 500 });
  }
}

// DELETE /api/proposal-templates - Delete a template
export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const id = searchParams.get("id");

    if (!id) {
      return NextResponse.json({ error: "Template ID required" }, { status: 400 });
    }

    await prisma.proposalTemplate.delete({
      where: { id },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Error deleting template:", error);
    return NextResponse.json({ error: "Failed to delete template" }, { status: 500 });
  }
}
