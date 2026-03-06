import { NextResponse } from 'next/server'
import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// GET /api/follow-ups - Check for proposals needing follow-up
// Query params: daysSinceSubmit (default 5), daysBetweenFollowUps (default 3)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const daysSinceSubmit = parseInt(searchParams.get('daysSinceSubmit') || '5')
    const daysBetweenFollowUps = parseInt(searchParams.get('daysBetweenFollowUps') || '3')

    const cutoffDate = new Date()
    cutoffDate.setDate(cutoffDate.getDate() - daysSinceSubmit)

    const followUpCutoff = new Date()
    followUpCutoff.setDate(followUpCutoff.getDate() - daysBetweenFollowUps)

    // Find proposals that need follow-up:
    // - Status is submitted or pending
    // - Either never followed up and submitted > daysSinceSubmit ago
    // - Or last follow-up was > daysBetweenFollowUps ago
    const proposalsNeedingFollowUp = await prisma.proposal.findMany({
      where: {
        status: {
          in: ['submitted', 'pending']
        },
        submittedAt: {
          lte: cutoffDate
        },
        OR: [
          {
            lastFollowUpAt: null
          },
          {
            lastFollowUpAt: {
              lte: followUpCutoff
            }
          }
        ]
      },
      include: {
        job: true
      },
      orderBy: {
        submittedAt: 'asc'
      }
    })

    return NextResponse.json({
      success: true,
      count: proposalsNeedingFollowUp.length,
      proposals: proposalsNeedingFollowUp.map(p => ({
        id: p.id,
        title: p.job.title,
        status: p.status,
        submittedAt: p.submittedAt,
        lastFollowUpAt: p.lastFollowUpAt,
        followUpCount: p.followUpCount,
        daysSinceSubmit: p.submittedAt 
          ? Math.floor((Date.now() - p.submittedAt.getTime()) / (1000 * 60 * 60 * 24))
          : null,
        jobUrl: p.job.url
      }))
    })
  } catch (error) {
    console.error('Error checking follow-ups:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to check follow-ups' },
      { status: 500 }
    )
  }
}

// PATCH /api/follow-ups - Mark a proposal as followed up
export async function PATCH(request: Request) {
  try {
    const { proposalId } = await request.json()

    if (!proposalId) {
      return NextResponse.json(
        { success: false, error: 'proposalId required' },
        { status: 400 }
      )
    }

    const proposal = await prisma.proposal.update({
      where: { id: proposalId },
      data: {
        lastFollowUpAt: new Date(),
        followUpCount: {
          increment: 1
        }
      }
    })

    return NextResponse.json({
      success: true,
      proposal: {
        id: proposal.id,
        lastFollowUpAt: proposal.lastFollowUpAt,
        followUpCount: proposal.followUpCount
      }
    })
  } catch (error) {
    console.error('Error marking follow-up:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to mark follow-up' },
      { status: 500 }
    )
  }
}
