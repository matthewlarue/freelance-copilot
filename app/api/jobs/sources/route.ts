import { NextResponse } from "next/server";
import { jobAggregation } from '@/lib/job-sources';

export async function GET() {
  return NextResponse.json({ 
    success: true, 
    sources: jobAggregation.getAvailableSources() 
  });
}
