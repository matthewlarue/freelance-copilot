import { NextResponse } from 'next/server';
import { suggestRates, extractSkills, assessComplexity, assessScope, formatRate, formatRateRange, type RateSuggestion } from '@/lib/pricing';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, description, budget, jobId } = body;

    if (!title || !description) {
      return NextResponse.json(
        { error: 'Title and description are required' },
        { status: 400 }
      );
    }

    // Get rate suggestions
    const suggestion = suggestRates(title, description, budget);

    // Extract key info
    const skills = extractSkills(title, description);
    const complexity = assessComplexity(title, description);
    const scope = assessScope(title, description, budget);

    return NextResponse.json({
      success: true,
      data: {
        jobId,
        suggestion,
        analysis: {
          skills,
          complexity,
          scope,
        },
      },
    });
  } catch (error) {
    console.error('Pricing API error:', error);
    return NextResponse.json(
      { error: 'Failed to generate pricing suggestion' },
      { status: 500 }
    );
  }
}

// GET endpoint for testing
export async function GET() {
  // Example response for testing
  const exampleSuggestion = suggestRates(
    'Build a React web application with Node.js backend',
    'We need a full-stack developer to build a custom web application with React frontend and Node.js API. Experience with PostgreSQL required.',
    '5000-10000'
  );

  return NextResponse.json({
    success: true,
    example: exampleSuggestion,
  });
}
