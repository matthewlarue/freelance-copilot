# Freelance Copilot — Technical Specification

## Tech Stack
- **Framework:** Next.js 14 (App Router)
- **Database:** PostgreSQL (Neon) — separate schema or dedicated DB
- **Auth:** NextAuth.js
- **Styling:** Tailwind CSS + shadcn/ui
- **AI:** Anthropic Claude API (for proposal generation)
- **Deployment:** Vercel

## Project Structure
```
freelance-copilot/
├── app/
│   ├── (auth)/           # Login/signup
│   ├── (dashboard)/     # Main app
│   │   ├── jobs/        # Job listings
│   │   ├── proposals/    # Proposal management
│   │   ├── workspace/   # Execution workspace
│   │   └── pipeline/    # Dashboard
│   └── api/              # API routes
├── components/
├── lib/
└── prisma/
```

## Database Schema (MVP)

### Job
- id, source, sourceId, title, description, budget, url, skills, status

### Proposal
- id, jobId, content, status (draft/submitted/won/lost), submittedAt

### Workspace
- id, proposalId, messages (chat history)

## MVP Features (Priority Order)

1. **Manual job entry** — Add jobs you're interested in
2. **Proposal generator** — AI writes draft from job description
3. **Review workflow** — Edit and copy proposal
4. **Pipeline dashboard** — Track status

## Future-Ready
- API integrations for job sources
- User profiles with skills/rates
- Template library

---

*Last updated: 2026-02-25*
