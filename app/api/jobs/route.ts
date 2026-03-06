import { NextRequest, NextResponse } from "next/server";
import { jobAggregation } from '@/lib/job-sources';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient()

// Mock user for MVP - replace with real auth later
const MOCK_USER_ID = "demo-user";

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const source = searchParams.get('source')
  const aggregate = searchParams.get('aggregate')
  
  // If aggregate=true, fetch from all sources and return
  if (aggregate === 'true') {
    try {
      const sources = source ? source.split(',') : undefined
      const jobs = await jobAggregation.aggregateJobs(sources)
      return NextResponse.json({ 
        success: true, 
        data: jobs,
        sources: jobAggregation.getAvailableSources()
      });
    } catch (error) {
      console.error('Aggregation error:', error)
      return NextResponse.json({ 
        error: 'Failed to aggregate jobs',
        sources: jobAggregation.getAvailableSources()
      }, { status: 500 });
    }
  }
  
  // If source specified, fetch from that source only
  if (source) {
    try {
      const jobs = await jobAggregation.fetchFromSource(source)
      return NextResponse.json({ success: true, data: jobs, source });
    } catch (error) {
      return NextResponse.json({ error: `Failed to fetch from ${source}` }, { status: 500 });
    }
  }
  
  // Default: return jobs from database
  const jobs = await prisma.job.findMany({
    where: { userId: MOCK_USER_ID, status: 'active' },
    orderBy: { createdAt: 'desc' },
    take: 20
  })
  
  // If no jobs in DB, return aggregated
  if (jobs.length === 0) {
    const aggregatedJobs = await jobAggregation.aggregateJobs()
    return NextResponse.json({ 
      success: true, 
      data: aggregatedJobs,
      sources: jobAggregation.getAvailableSources(),
      note: 'Showing aggregated jobs (DB empty)'
    });
  }
  
  return NextResponse.json({ success: true, data: jobs });
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { title, description, budget, source, skills, aggregate, saveToDb } = body;
    
    // If aggregate=true, fetch from all sources
    if (aggregate) {
      const jobs = await jobAggregation.aggregateJobs()
      
      if (saveToDb) {
        const savedCount = await jobAggregation.saveJobsToDatabase(MOCK_USER_ID, jobs)
        return NextResponse.json({ 
          success: true, 
          data: jobs,
          saved: savedCount,
          message: `Saved ${savedCount} new jobs to database`
        });
      }
      
      return NextResponse.json({ success: true, data: jobs });
    }
    
    // Single job creation
    if (!title || !description) {
      return NextResponse.json({ error: "Title and description required" }, { status: 400 });
    }
    
    const job = await prisma.job.create({
      data: {
        userId: MOCK_USER_ID,
        title,
        description,
        budget: budget || "",
        source: source || "manual",
        skills: skills || "",
        status: "active",
      }
    });
    
    return NextResponse.json({ success: true, data: job }, { status: 201 });
  } catch (error) {
    console.error('Job API error:', error)
    return NextResponse.json({ error: "Failed to process request" }, { status: 500 });
  }
}

// PATCH - Update job
export async function PATCH(request: NextRequest) {
  try {
    const body = await request.json();
    const { id, status, ...updates } = body;
    
    if (!id) {
      return NextResponse.json({ error: "Job ID required" }, { status: 400 });
    }
    
    const job = await prisma.job.update({
      where: { id },
      data: { ...updates, status }
    });
    
    return NextResponse.json({ success: true, data: job });
  } catch (error) {
    return NextResponse.json({ error: "Failed to update job" }, { status: 500 });
  }
}

// DELETE - Remove job
export async function DELETE(request: NextRequest) {
  const { searchParams } = new URL(request.url)
  const id = searchParams.get('id')
  
  if (!id) {
    return NextResponse.json({ error: "Job ID required" }, { status: 400 });
  }
  
  await prisma.job.delete({ where: { id } })
  
  return NextResponse.json({ success: true, message: "Job deleted" });
}
