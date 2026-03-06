import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/job-matching";
import { getMatchedJobs } from "@/lib/job-matching";

// GET /api/jobs/match - Get matched jobs for the user
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const limit = parseInt(searchParams.get('limit') || '10')
    
    // In MVP, use mock user - replace with real auth
    const userId = "demo-user"
    
    const matchedJobs = await getMatchedJobs(userId, limit)
    
    return NextResponse.json({ 
      success: true, 
      data: matchedJobs 
    })
  } catch (error) {
    console.error('Job matching error:', error)
    return NextResponse.json({ 
      error: "Failed to match jobs",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
