KVY TECH — Full-stack Engineer Take-Home Project
Project: Document Verification Workflow
Deadline: 5 days from receipt of this brief
Submission: GitHub repository with required artifacts + deployed implementation
Read This First — What This Project Actually Tests
This project looks different from most take-homes you've done. Please read carefully before you
start.
What we're evaluating is how you think:
1. Design thinking — Can you decompose a problem into a coherent architecture? Can
you see trade-offs? Can you pick a path and defend it?
2. Process and ownership — How do you actually work? How honestly can you describe
your own process and your use of AI tools?
3. Comprehension and judgment — Do you understand your own design deeply enough
to defend it?
4. Execution — Can you translate design into real working code? This matters, but less
than the above.
You will produce 2 artifacts, each capturing something code alone cannot. The weight of
evaluation sits mostly on thinking, not on lines of code shipped.
The Feature: Document Verification Workflow
A marketplace platform needs a document verification workflow. When a seller applies to join
the marketplace, they upload a business verification document (e.g., business license, tax
registration). The document must be verified before the seller can list products.
The verification flow works like this:
1. Seller uploads a document via the storefront
2. System sends the document to an external verification service (mock — a
simulated third-party API). This call is asynchronous and may take seconds to hours to
return a result.
3. The external service responds with one of:
○ verified — high confidence the document is valid
○ rejected — high confidence the document is invalid
○ inconclusive — cannot determine automatically, requires human review
4. If inconclusive, an admin must manually review the document and make a decision
5. The seller is notified of the final outcome (approved, rejected) with an optional reason
6. Admins can see the full history of all verification attempts, including automated results
and manual decisions, with who did what and when
That's the full feature. Your job is to design this feature well and build a meaningful
implementation of it from scratch.
What You Will Produce
2 artifacts, submitted together in a single GitHub repository:
Artifact 1 — Design Document (DESIGN.md, ~2 hours)
This is the primary artifact we evaluate. Save it as DESIGN.md at your repo root.
It must contain the following sections. Shallow answers signal shallow thinking — go deep.
1. Problem Framing
● What is the real problem this feature solves? (Not a restatement of the brief — what
does the platform actually need?)
● Who are the stakeholders (seller, admin, platform) and what does success look like for
each?
● What's explicitly out of scope for this feature?
2. Clarifying Questions
● List at least 8 questions you would ask the product owner before building this, in priority
order
● For each question: why does the answer change your design?
● For the 3 most important questions, state your working assumption so you can proceed
3. Architecture
● A diagram showing the components and data flow (ASCII, Mermaid, or linked image)
● Component breakdown: what each piece does and why it exists
● Data model: entities, relationships, state fields
● State machine for a document verification record: states, transitions, guards, terminal
states. Draw it explicitly.
4. Stack Decisions
State your chosen stack (see Technical Constraints below) and briefly justify each major choice:
● Backend framework and why
● Frontend framework and why
● Database and why
● Async processing approach and why
● Any additional infrastructure you introduced (queue, cache, etc.) and why
For each: what alternative did you consider and reject?
5. Trade-offs and Decisions
Pick the 5 most important technical decisions in your design (beyond stack choices). For each:
● The decision
● At least 2 alternatives you considered
● Why you chose what you chose
● What you'd change if a specific condition changed
Decisions we'd expect to see (your actual list may differ):
● How the async verification call is structured (background job? queue? simple
setTimeout? workflow engine?)
● How external API failures are handled (timeouts, partial responses, unreachable service)
● How the "inconclusive → admin review" handoff works
● How notifications are delivered to the seller
● How the audit history is structured and queried
● How file uploads are stored and served
6. Failure Modes
List at least 5 things that can go wrong in production and how your design handles (or would
handle) each. Examples of the kind of failure we mean:
● The external verification service returns a malformed response
● The service is unreachable for hours
● The seller uploads a 50MB PDF
● Two admins review the same document simultaneously
● A notification email fails to send
Be specific. "We add retries" is not enough.
7. Descoped Items
What did you deliberately not design? For each:
● Why you descoped it
● Roughly how you'd add it later
● What risks the descoping creates
8. Implementation Plan
● Ordered steps to build the full feature (if you had 2 weeks)
● Rough effort estimate per step
● What depends on what
Artifact 2 — Implementation (source code + README.md, ~2 hours)
Build the feature from scratch. You will not finish the whole feature — that's fine. Build the parts
that most clearly demonstrate the architecture from your design document in working code.
Your README.md must include:
"What I built" — A short section stating exactly what's working, what's partially working, and
what's not built. Be honest. A 60% working submission with an accurate README is stronger
than a claimed-100% submission that's actually 50%.
"What I'd build next" — If you had 2 more hours, what's next? Why?
"How to run it" — Clear local setup instructions. Test credentials for any seeded users (at least
one seller, one admin). Deployment URL.
Quality expectations within the scope of what you did build:
● Works end-to-end for at least one complete path (e.g., seller uploads → automated
result → admin sees it, OR seller uploads → inconclusive → admin reviews → seller
notified)
● Input validation on backend
● Error handling that doesn't leak internals
● At least one meaningful test covering the core behavior of what you built
● No secrets in the repo (include .env.example)
● Deployed and accessible at a public URL
Technical Constraints
Stack family: TypeScript / JavaScript ecosystem only.
Within that family, you choose:
● Backend: Node.js with Express, NestJS, Fastify, Hono, or similar — your pick
● Frontend: React, Next.js, Vue, Nuxt, or similar — your pick
● Database: PostgreSQL, MySQL, or SQLite — your pick
● Async processing: Your pick (BullMQ, pg-boss, native workers, cron, or simpler
approaches — defend your choice)
TypeScript is required on both backend and frontend.
The implementation must include a UI with two distinct views:
● Seller view — Login, upload document, see verification status
● Admin view — Login, see pending verifications, review inconclusive documents, make
decisions
Both views can be in the same Next.js/Nuxt app with role-based routing, or in two separate apps
— your call.
The external verification service is mocked. You build a simple mock — could be a separate
endpoint in your backend that returns a random result after a random delay, or a separate tiny
Node service, or any approach you can justify. How you structure this mock is itself a design
decision.
Deployment: Any free tier — Vercel, Railway, Render, Fly.io, Supabase. Both backend and
frontend must be live.
Submission
A single public GitHub repository (or one with access granted to us) containing:
● DESIGN.md
● README.md with "What I built," "What I'd build next," setup instructions, demo URL, test
credentials
● Source code
● Any diagrams as images or Mermaid source
Email when ready, subject: KVY Take-home Submission — [Your Name].
Deadline: [INSERT DATE — 5 days from send] at 23:59 [TIMEZONE].
If you need an extension for a legitimate reason, email as early as possible.