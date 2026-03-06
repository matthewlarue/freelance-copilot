import { NextRequest, NextResponse } from "next/server";

// Mock proposals storage for MVP
let proposals: any[] = [];

export async function GET(request: NextRequest) {
  return NextResponse.json({ success: true, data: proposals });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { jobId, jobTitle, jobDescription, generateAI } = body;
    
    let content = "";
    
    if (generateAI) {
      // Call Anthropic API to generate proposal
      try {
        const anthropic = require("@anthropic-ai/sdk");
        const client = new anthropic.Anthropic({
          apiKey: process.env.ANTHROPIC_API_KEY || "",
        });
        
        const prompt = `You are a expert freelancer writing a proposal for a client on Upwork. 

Job Title: ${jobTitle}
Job Description: ${jobDescription}

Write a personalized, professional proposal that:
1. Addresses the client's specific needs
2. Highlights relevant experience
3. Explains the approach
4. Includes timeline and deliverables
5. Has a professional closing

Keep it concise (200-400 words). Write it in a friendly but professional tone.`;

        const response = await client.messages.create({
          model: "claude-3-haiku-20240307",
          max_tokens: 1000,
          messages: [{ role: "user", content: prompt }],
        });
        
        content = response.content[0].text;
      } catch (aiError) {
        console.error("AI generation failed:", aiError);
        // Fallback to template if AI fails
        content = generateTemplateProposal(jobTitle, jobDescription);
      }
    } else {
      content = generateTemplateProposal(jobTitle, jobDescription);
    }
    
    const proposal = {
      id: Date.now().toString(),
      jobId,
      jobTitle,
      content,
      status: "draft",
      createdAt: new Date().toISOString(),
      submittedAt: null,
    };
    
    proposals.push(proposal);
    
    return NextResponse.json({ success: true, data: proposal }, { status: 201 });
  } catch (error) {
    console.error("Error creating proposal:", error);
    return NextResponse.json({ error: "Failed to create proposal" }, { status: 500 });
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, ...updates } = body;
    
    const proposalIndex = proposals.findIndex((p) => p.id === id);
    if (proposalIndex === -1) {
      return NextResponse.json({ error: "Proposal not found" }, { status: 404 });
    }
    
    // If status is changing to submitted, set submittedAt
    if (updates.status === "submitted" && proposals[proposalIndex].status !== "submitted") {
      updates.submittedAt = new Date().toISOString();
    }
    
    proposals[proposalIndex] = { ...proposals[proposalIndex], ...updates };
    
    return NextResponse.json({ success: true, data: proposals[proposalIndex] });
  } catch (error) {
    console.error("Error updating proposal:", error);
    return NextResponse.json({ error: "Failed to update proposal" }, { status: 500 });
  }
}

function generateTemplateProposal(title: string, description: string): string {
  return `Hi there,

I came across your project for ${title} and I'm excited to help you bring this to life.

**Why I'm a Great Fit:**
- ${getRelevantExperience(description)}
- I've helped numerous clients achieve their goals with high-quality deliverables
- Clear communication and timely delivery are my top priorities

**My Approach:**
I'll start with a brief call to understand your exact requirements, then provide regular updates as I work through the project. I'll deliver clean, well-documented work that meets your specifications.

**Timeline:**
Depending on the exact scope, I estimate ${estimateTimeline(description)}. I'll provide a more accurate timeline once we discuss the details.

**Next Steps:**
Feel free to reach out so we can discuss your project in more detail. I'm available for a quick call or chat whenever you're ready.

Looking forward to working with you!

Best regards`;
}

function getRelevantExperience(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes("react") || desc.includes("nextjs") || desc.includes("typescript")) {
    return "5+ years building modern web applications with React and TypeScript";
  }
  if (desc.includes("wordpress")) {
    return "extensive experience with WordPress themes and customizations";
  }
  if (desc.includes("python") || desc.includes("ai") || desc.includes("ml")) {
    return "strong background in Python and AI/ML implementations";
  }
  return "relevant experience in similar projects";
}

function estimateTimeline(description: string): string {
  const desc = description.toLowerCase();
  if (desc.includes("simple") || desc.includes("quick")) {
    return "3-5 days";
  }
  if (desc.includes("complex") || desc.includes("full")) {
    return "2-3 weeks";
  }
  return "1-2 weeks";
}
