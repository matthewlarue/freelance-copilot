import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

export interface JobMatchResult {
  job: any
  score: number
  matchReasons: string[]
}

// Score a single job against user profile
export async function scoreJobAgainstProfile(
  job: { id: string; title: string; description: string; skills: string | null; budget: string | null; source: string },
  profile: { skills: string | null; categories: string | null; minHourlyRate: number | null; maxHourlyRate: number | null; jobTypes: string | null; experienceLevel: string | null; preferredSources: string | null } | null
): Promise<{ score: number; matchReasons: string[] }> {
  if (!profile) {
    return { score: 50, matchReasons: ['Set up your profile for better matches'] }
  }

  let score = 0
  const reasons: string[] = []

  // Parse user skills
  const userSkills = (profile.skills || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)
  
  // Parse job skills
  const jobSkills = (job.skills || '')
    .split(',')
    .map(s => s.trim().toLowerCase())
    .filter(Boolean)

  // Skill matching (40% weight)
  if (userSkills.length > 0 && jobSkills.length > 0) {
    const matchedSkills = jobSkills.filter(js => 
      userSkills.some(us => us.includes(js) || js.includes(us))
    )
    const skillScore = (matchedSkills.length / Math.max(jobSkills.length, userSkills.length)) * 40
    score += skillScore
    
    if (matchedSkills.length > 0) {
      reasons.push(`Matches ${matchedSkills.length} of your skills`)
    }
  } else {
    score += 10 // Base score for having no skills to compare
  }

  // Budget matching (20% weight)
  if (job.budget && profile.minHourlyRate) {
    // Try to extract hourly rate from budget string
    const hourlyMatch = job.budget.match(/\$?(\d+)(?:-(\d+))?\/?hr?/i)
    if (hourlyMatch) {
      const jobRate = parseInt(hourlyMatch[1])
      if (jobRate >= profile.minHourlyRate && 
          (!profile.maxHourlyRate || jobRate <= profile.maxHourlyRate)) {
        score += 20
        reasons.push(`Within your rate: $${jobRate}/hr`)
      } else if (jobRate < profile.minHourlyRate) {
        score += 5
        reasons.push('Below your rate')
      }
    } else {
      // Fixed price - give partial score if no info
      score += 10
    }
  } else {
    score += 10
  }

  // Source preference (10 rate% weight)
  if (profile.preferredSources) {
    const preferred = profile.preferredSources.split(',').map(s => s.trim().toLowerCase())
    if (preferred.includes(job.source.toLowerCase())) {
      score += 10
      reasons.push(`From preferred source: ${job.source}`)
    }
  }

  // Job title/description keyword matching (20% weight)
  const titleLower = job.title.toLowerCase()
  const descLower = job.description.toLowerCase()
  
  // Check for senior/expert keywords for experience level
  if (profile.experienceLevel === 'senior' || profile.experienceLevel === 'expert') {
    const seniorKeywords = ['senior', 'expert', 'architect', 'lead', 'principal', 'staff']
    if (seniorKeywords.some(k => titleLower.includes(k) || descLower.includes(k))) {
      score += 15
      reasons.push('Senior-level position')
    }
  } else if (profile.experienceLevel === 'junior' || profile.experienceLevel === 'mid') {
    const juniorKeywords = ['junior', 'entry', 'intern', 'associate']
    if (juniorKeywords.some(k => titleLower.includes(k) || descLower.includes(k))) {
      score += 15
      reasons.push('Entry-level position')
    }
  }

  // Category matching (10% weight)
  if (profile.categories) {
    const categories = profile.categories.split(',').map(c => c.trim().toLowerCase())
    const titleWords = titleLower.split(/\s+/)
    const categoryMatch = categories.some(cat => 
      titleWords.some(word => word.includes(cat) || cat.includes(word)) ||
      descLower.includes(cat)
    )
    if (categoryMatch) {
      score += 10
      reasons.push('Matches your preferred categories')
    }
  }

  // Cap at 100
  score = Math.min(100, Math.round(score))

  return { score, matchReasons: reasons }
}

// Get top matched jobs for a user
export async function getMatchedJobs(
  userId: string,
  limit: number = 10
): Promise<JobMatchResult[]> {
  // Get user profile
  const profile = await prisma.userProfile.findUnique({
    where: { userId }
  })

  // Get active jobs
  const jobs = await prisma.job.findMany({
    where: {
      userId,
      status: 'active'
    },
    orderBy: { createdAt: 'desc' },
    take: 50 // Get more jobs to filter
  })

  // Score each job
  const scoredJobs = await Promise.all(
    jobs.map(async (job) => {
      const { score, matchReasons } = await scoreJobAgainstProfile(job, profile)
      return { job, score, matchReasons }
    })
  )

  // Sort by score and return top matches
  return scoredJobs
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
}

// Get or create user profile
export async function getOrCreateProfile(userId: string) {
  let profile = await prisma.userProfile.findUnique({
    where: { userId }
  })

  if (!profile) {
    profile = await prisma.userProfile.create({
      data: { userId }
    })
  }

  return profile
}

// Update user profile
export async function updateUserProfile(
  userId: string,
  data: {
    skills?: string
    categories?: string
    minHourlyRate?: number
    maxHourlyRate?: number
    jobTypes?: string
    availability?: string
    experienceLevel?: string
    successfulProjects?: string
    preferredSources?: string
    aiSummary?: string
  }
) {
  return prisma.userProfile.upsert({
    where: { userId },
    update: data,
    create: { userId, ...data }
  })
}

export default prisma
