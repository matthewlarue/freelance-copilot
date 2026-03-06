import { NextResponse } from 'next/server';
import { prisma } from '@/lib/db';

const formatCurrency = (amount: number) => 
  new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');

    if (!userId) {
      return NextResponse.json({ error: 'User ID required' }, { status: 400 });
    }

    // Get date ranges
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    // Revenue metrics - from paid invoices
    const currentMonthRevenue = await prisma.invoice.aggregate({
      where: {
        userId,
        status: 'paid',
        paidAt: { gte: startOfMonth }
      },
      _sum: { amount: true }
    });

    const lastMonthRevenue = await prisma.invoice.aggregate({
      where: {
        userId,
        status: 'paid',
        paidAt: { gte: startOfLastMonth, lte: endOfLastMonth }
      },
      _sum: { amount: true }
    });

    // Total revenue all time
    const totalRevenue = await prisma.invoice.aggregate({
      where: { userId, status: 'paid' },
      _sum: { amount: true }
    });

    // Pipeline metrics
    const [totalJobs, activeJobs, proposals] = await Promise.all([
      prisma.job.count({ where: { userId } }),
      prisma.job.count({ where: { userId, status: 'active' } }),
      prisma.proposal.findMany({
        where: { userId },
        select: { status: true, submittedAt: true, wonAt: true, createdAt: true, price: true }
      })
    ]);

    const submittedProposals = proposals.filter(p => p.submittedAt);
    const wonProposals = proposals.filter(p => p.status === 'won');
    const pendingProposals = proposals.filter(p => p.status === 'pending' || p.status === 'submitted');

    // Win rate
    const winRate = submittedProposals.length > 0 
      ? (wonProposals.length / submittedProposals.length) * 100 
      : 0;

    // Average proposal value
    const avgProposalValue = proposals.reduce((sum, p) => sum + (p.price || 0), 0) / (proposals.length || 1);

    // Time to close - calculate from first proposal to won
    const timeToClose: number[] = [];
    for (const proposal of wonProposals) {
      if (proposal.submittedAt && proposal.wonAt) {
        const days = Math.floor((proposal.wonAt.getTime() - proposal.submittedAt.getTime()) / (1000 * 60 * 60 * 24));
        timeToClose.push(days);
      }
    }
    const avgTimeToClose = timeToClose.length > 0 
      ? timeToClose.reduce((a, b) => a + b, 0) / timeToClose.length 
      : 0;

    // Client metrics
    const contracts = await prisma.contract.findMany({
      where: { userId },
      select: { status: true, value: true, createdAt: true }
    });

    const activeContracts = contracts.filter(c => c.status === 'active');
    const completedContracts = contracts.filter(c => c.status === 'completed');

    // Outstanding invoices
    const outstandingInvoices = await prisma.invoice.aggregate({
      where: { userId, status: { in: ['draft', 'sent'] } },
      _sum: { amount: true },
      _count: true
    });

    // Pipeline value (pending proposals)
    const pipelineValue = pendingProposals.reduce((sum, p) => sum + (p.price || 0), 0);

    // Monthly revenue history (last 6 months)
    const monthlyRevenue = [];
    for (let i = 5; i >= 0; i--) {
      const monthStart = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const monthEnd = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
      
      const revenue = await prisma.invoice.aggregate({
        where: {
          userId,
          status: 'paid',
          paidAt: { gte: monthStart, lte: monthEnd }
        },
        _sum: { amount: true }
      });
      
      monthlyRevenue.push({
        month: monthStart.toLocaleString('default', { month: 'short' }),
        revenue: revenue._sum.amount || 0
      });
    }

    // Proposals by status
    const proposalsByStatus = {
      draft: proposals.filter(p => p.status === 'draft').length,
      submitted: proposals.filter(p => p.status === 'submitted').length,
      pending: proposals.filter(p => p.status === 'pending').length,
      won: wonProposals.length,
      lost: proposals.filter(p => p.status === 'lost').length
    };

    // Growth metrics
    const revenueGrowth = lastMonthRevenue._sum.amount 
      ? ((currentMonthRevenue._sum.amount || 0) - lastMonthRevenue._sum.amount) / lastMonthRevenue._sum.amount * 100
      : 0;

    // ============ CLIENT QUALITY SCORING ============
    // Get contracts with client info and invoices for quality scoring
    const contractsWithInvoices = await prisma.contract.findMany({
      where: { userId },
      include: {
        invoices: {
          select: { status: true, amount: true, paidAt: true, dueDate: true }
        },
        proposal: {
          select: { job: { select: { title: true } } }
        }
      },
      orderBy: { createdAt: 'desc' }
    });

    // Calculate client quality scores
    const clientQualityScores = [];
    const clientRevenueMap = new Map<string, { name: string; totalRevenue: number; contractCount: number; paidOnTime: number; totalInvoices: number }>();

    for (const contract of contractsWithInvoices) {
      const clientKey = contract.clientEmail || contract.clientName || contract.id;
      const clientName = contract.clientName || contract.clientEmail || 'Unknown';
      
      if (!clientRevenueMap.has(clientKey)) {
        clientRevenueMap.set(clientKey, { name: clientName, totalRevenue: 0, contractCount: 0, paidOnTime: 0, totalInvoices: 0 });
      }
      
      const clientData = clientRevenueMap.get(clientKey)!;
      clientData.contractCount++;
      clientData.totalRevenue += contract.value || 0;

      // Payment timeliness
      for (const invoice of contract.invoices) {
        if (invoice.status === 'paid' && invoice.paidAt && invoice.dueDate) {
          clientData.totalInvoices++;
          const daysEarly = Math.floor((invoice.dueDate.getTime() - invoice.paidAt.getTime()) / (1000 * 60 * 60 * 24));
          if (daysEarly >= 0) {
            clientData.paidOnTime++;
          }
        }
      }
    }

    // Build client quality scores
    for (const [_, clientData] of clientRevenueMap) {
      const repeatBusinessScore = Math.min(clientData.contractCount * 25, 100); // 25 pts per contract, max 100
      const paymentTimelinessScore = clientData.totalInvoices > 0 
        ? (clientData.paidOnTime / clientData.totalInvoices) * 100 
        : 50; // Default 50 if no invoices
      const valueScore = Math.min((clientData.totalRevenue / 5000) * 30, 100); // $5k = 100 pts
      
      const overallScore = (repeatBusinessScore * 0.4) + (paymentTimelinessScore * 0.35) + (valueScore * 0.25);
      
      clientQualityScores.push({
        name: clientData.name,
        score: Math.round(overallScore),
        repeatBusiness: clientData.contractCount,
        totalRevenue: clientData.totalRevenue,
        paymentTimeliness: Math.round(paymentTimelinessScore)
      });
    }

    // Sort by score and take top 5
    clientQualityScores.sort((a, b) => b.score - a.score);
    const topClients = clientQualityScores.slice(0, 5);

    // Overall client quality stats
    const avgClientScore = clientQualityScores.length > 0
      ? clientQualityScores.reduce((sum, c) => sum + c.score, 0) / clientQualityScores.length
      : 0;
    
    const repeatClientCount = clientQualityScores.filter(c => c.repeatBusiness > 1).length;
    const repeatClientRate = clientQualityScores.length > 0
      ? (repeatClientCount / clientQualityScores.length) * 100
      : 0;

    // ============ INSIGHTS ============
    const insights = [];

    // Win rate insight
    if (winRate >= 50) {
      insights.push({ type: 'positive', message: `Excellent win rate! You're winning ${winRate.toFixed(0)}% of proposals.` });
    } else if (winRate >= 25) {
      insights.push({ type: 'neutral', message: `Win rate is ${winRate.toFixed(0)}%. Focus on proposal quality to improve.` });
    } else if (submittedProposals.length > 0) {
      insights.push({ type: 'warning', message: `Win rate is ${winRate.toFixed(0)}%. Consider improving your proposal templates.` });
    }

    // Pipeline value insight
    if (pipelineValue > 10000) {
      insights.push({ type: 'positive', message: `Strong pipeline of ${formatCurrency(pipelineValue)} in pending proposals.` });
    }

    // Client retention insight
    if (repeatClientRate >= 50) {
      insights.push({ type: 'positive', message: `Great client retention! ${repeatClientRate.toFixed(0)}% of clients have repeat business.` });
    }

    // Time to close insight
    if (avgTimeToClose > 0 && avgTimeToClose < 7) {
      insights.push({ type: 'positive', message: `Fast closing! Average time to close is only ${avgTimeToClose.toFixed(0)} days.` });
    } else if (avgTimeToClose > 30) {
      insights.push({ type: 'warning', message: `Long sales cycle (${avgTimeToClose.toFixed(0)} days). Consider faster follow-ups.` });
    }

    // Revenue growth insight
    if (revenueGrowth > 20) {
      insights.push({ type: 'positive', message: `Revenue up ${revenueGrowth.toFixed(0)}% this month!` });
    } else if (revenueGrowth < -20) {
      insights.push({ type: 'warning', message: `Revenue down ${Math.abs(revenueGrowth).toFixed(0)}%. Focus on closing pending proposals.` });
    }

    return NextResponse.json({
      revenue: {
        currentMonth: currentMonthRevenue._sum.amount || 0,
        lastMonth: lastMonthRevenue._sum.amount || 0,
        total: totalRevenue._sum.amount || 0,
        growth: revenueGrowth,
        outstanding: outstandingInvoices._sum.amount || 0,
        outstandingCount: outstandingInvoices._count
      },
      pipeline: {
        totalJobs,
        activeJobs,
        totalProposals: proposals.length,
        submittedProposals: submittedProposals.length,
        wonProposals: wonProposals.length,
        pendingProposals: pendingProposals.length,
        winRate,
        avgProposalValue,
        avgTimeToClose,
        pipelineValue
      },
      clients: {
        totalContracts: contracts.length,
        activeContracts: activeContracts.length,
        completedContracts: completedContracts.length,
        avgQualityScore: Math.round(avgClientScore),
        repeatClientRate: Math.round(repeatClientRate),
        topClients
      },
      insights,
      monthlyRevenue,
      proposalsByStatus
    });
  } catch (error) {
    console.error('Analytics error:', error);
    return NextResponse.json({ error: 'Failed to fetch analytics' }, { status: 500 });
  }
}
