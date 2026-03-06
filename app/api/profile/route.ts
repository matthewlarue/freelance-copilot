import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/job-matching";
import { getOrCreateProfile, updateUserProfile } from "@/lib/job-matching";

// GET /api/profile - Get user profile
export async function GET() {
  try {
    // In MVP, use mock user - replace with real auth
    const userId = "demo-user"
    
    const profile = await getOrCreateProfile(userId)
    
    return NextResponse.json({ 
      success: true, 
      data: profile 
    })
  } catch (error) {
    console.error('Profile fetch error:', error)
    return NextResponse.json({ 
      error: "Failed to fetch profile",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}

// PUT /api/profile - Update user profile
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    
    // In MVP, use mock user - replace with real auth
    const userId = "demo-user"
    
    const profile = await updateUserProfile(userId, body)
    
    return NextResponse.json({ 
      success: true, 
      data: profile 
    })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ 
      error: "Failed to update profile",
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}
