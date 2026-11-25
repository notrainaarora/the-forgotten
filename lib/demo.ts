import type { AdminStory, PublicStory } from "@/lib/types";

/**
 * Placeholder content shown ONLY in demo mode (no database connected).
 * These are invented examples to show the layout. Every page in demo mode
 * displays a banner saying so. Replace with real, consented stories.
 */
const p = (...paras: string[]) => paras.join("\n\n");

export const DEMO_STORIES: PublicStory[] = [
  {
    id: "demo-1",
    slug: "sample-the-radio-operator",
    featured: true,
    title: "The radio operator who still fixes everyone's transistors",
    summary:
      "SAMPLE STORY. A Navy veteran who spent two winters without a home now runs an informal repair table at his shelter, and he wants people to know he was a sailor before he was a statistic.",
    body: p(
      "This is a sample story written to show how a narrative will look on the site. It is not about a real person.",
      "Walter keeps a small canvas bag of screwdrivers under his cot. Most evenings, someone drifts over with a dead phone charger or a cracked radio, and he goes quiet in the way people do when their hands know more than their words.",
      "\"In the Navy they gave me a headset and a stack of manuals,\" he said. \"Forty years later I still read wiring like a newspaper.\"",
      "He lost his apartment after a hospital stay drained his savings. He doesn't dwell on that part. He would rather talk about the ship, the friend who taught him to play cribbage in the radio shack, and the granddaughter who sends him drawings.",
      "When I asked what he wanted readers to take away, he thought for a long time. \"That everybody you walk past had a job once. Some of us had important ones.\""
    ),
    pull_quote: "Everybody you walk past had a job once. Some of us had important ones.",
    format: "written",
    themes: ["service", "homelessness", "work"],
    subject_display_name: "Walter",
    subject_type: "veteran",
    subject_type_other: null,
    service_branch: "Navy",
    service_era: "Vietnam",
    city: "San Jose",
    region: "California",
    country: "United States",
    contributor_credit: "Sample contributor",
    contributor_school: null,
    consent_photos: false,
    published_at: "2026-11-20T18:00:00Z",
  },
  {
    id: "demo-2",
    slug: "sample-sunday-letters",
    featured: true,
    title: "Sunday letters",
    summary:
      "SAMPLE STORY. A retired schoolteacher who lives alone writes a letter every Sunday to a former student. Most never write back. She writes anyway.",
    body: p(
      "This is a sample story written to show how a narrative will look on the site. It is not about a real person.",
      "Margaret taught fourth grade for thirty-one years. She can still name the class that gave her a goldfish in 1979.",
      "Her husband died six years ago, and her children live across the country. The phone rings less than it used to. So on Sundays she picks a name from an old class list and writes.",
      "\"I tell them what I remember about them,\" she said. \"Usually something small. The way a boy always sharpened his pencil before a test, even when it was sharp.\"",
      "A few have written back. One former student, now a nurse, visits every month."
    ),
    pull_quote: "I tell them what I remember about them. Usually something small.",
    format: "written",
    themes: ["isolation", "memory", "community"],
    subject_display_name: "Margaret",
    subject_type: "senior",
    subject_type_other: null,
    service_branch: null,
    service_era: null,
    city: null,
    region: "Ohio",
    country: "United States",
    contributor_credit: "Sample contributor",
    contributor_school: null,
    consent_photos: false,
    published_at: "2026-11-18T18:00:00Z",
  },
  {
    id: "demo-3",
    slug: "sample-motor-pool",
    featured: false,
    title: "Q&A: Twenty years in the motor pool",
    summary:
      "SAMPLE STORY. An Army mechanic talks about the trucks she kept running overseas, the transition home, and the job-training program that got her back on her feet.",
    body: p(
      "This is a sample interview written to show how a Q&A will look on the site. It is not about a real person.",
      "**What did you do in the Army?**\nI was a wheeled-vehicle mechanic. If it had tires, I fixed it, usually in the dark and usually in a hurry.",
      "**What was the hardest part about coming home?**\nNobody needed me at two in the morning anymore. That sounds strange, but it's true.",
      "**What helped?**\nA job-training program at a community college. And a counselor who didn't rush me.",
      "**What do you want people to know?**\nAsk us what we did. Most of us would love to tell you."
    ),
    pull_quote: "Ask us what we did. Most of us would love to tell you.",
    format: "interview",
    themes: ["service", "resilience", "work"],
    subject_display_name: "Denise",
    subject_type: "veteran",
    subject_type_other: null,
    service_branch: "Army",
    service_era: "Iraq / Afghanistan (post-9/11)",
    city: null,
    region: "Texas",
    country: "United States",
    contributor_credit: "Sample contributor",
    contributor_school: null,
    consent_photos: false,
    published_at: "2026-11-15T18:00:00Z",
  },
];

export const DEMO_ADMIN_STORIES: AdminStory[] = [
  {
    ...DEMO_STORIES[0],
    status: "pending",
    slug: null,
    interview_setting: "partner_org",
    partner_org: "Sample Shelter",
    contributor_name: "Sample Contributor",
    contributor_email: "contributor@example.com",
    contributor_age_group: "13-17",
    guardian_name: "Sample Parent",
    guardian_email: "parent@example.com",
    guardian_approved: true,
    consent_signed_by: "Walter (sample)",
    consent_signed_on: "2026-11-10",
    consent_file_path: "demo/consent.pdf",
    consent_real_name: true,
    consent_book: true,
    reviewer_notes: null,
    reviewed_at: null,
    withdrawn_at: null,
    created_at: "2026-11-24T18:00:00Z",
  },
  ...DEMO_STORIES.slice(1).map((s) => ({
    ...s,
    status: "approved" as const,
    interview_setting: "supervised",
    partner_org: null,
    contributor_name: "Sample Contributor",
    contributor_email: "contributor@example.com",
    contributor_age_group: "18+" as const,
    guardian_name: null,
    guardian_email: null,
    guardian_approved: false,
    consent_signed_by: `${s.subject_display_name} (sample)`,
    consent_signed_on: "2026-11-01",
    consent_file_path: "demo/consent.pdf",
    consent_real_name: true,
    consent_book: false,
    reviewer_notes: null,
    reviewed_at: s.published_at,
    withdrawn_at: null,
    created_at: "2026-11-01T18:00:00Z",
  })),
];

// ---------- Preview-mode data for the owner dashboard (invented) ----------
export const DEMO_SIGNUPS = [
  { id: "s1", name: "Sample Student A", email: "student.a@example.com", age_group: "13-17", school: "Sample High School", city: "San Jose", region: "California", country: "United States", guardian_email: "parent.a@example.com", interests: ["interview", "write"], message: "My grandfather served in the Navy.", handled: false, created_at: "2026-11-24T20:00:00Z" },
  { id: "s2", name: "Sample Student B", email: "student.b@example.com", age_group: "18+", school: "Sample College", city: "Austin", region: "Texas", country: "United States", guardian_email: null, interests: ["photograph"], message: null, handled: true, created_at: "2026-11-20T20:00:00Z" },
];

export const DEMO_WITHDRAWALS = [
  { id: "w1", story_id: "demo-2", story_reference: "Sunday letters", requester_name: "Sample Family Member", requester_email: "family@example.com", relationship: "family", reason: "Please remove the town name.", status: "open", created_at: "2026-11-23T20:00:00Z", resolved_at: null, stories: { id: "demo-2", title: "Sunday letters", slug: "sample-sunday-letters", status: "approved" } },
];

export const DEMO_ACTIVITY = [
  { id: 1, actor_email: null, action: "story.submitted", summary: 'Sample Contributor submitted "The radio operator who still fixes everyone\'s transistors" (Walter, California)', created_at: "2026-11-24T18:00:00Z" },
  { id: 2, actor_email: null, action: "signup.created", summary: "Sample Student A signed up as a contributor (Sample High School)", created_at: "2026-11-24T20:00:00Z" },
  { id: 3, actor_email: null, action: "withdrawal.requested", summary: "Sample Family Member (family) asked to change or remove: Sunday letters", created_at: "2026-11-23T20:00:00Z" },
  { id: 4, actor_email: "owner@theforgotten.site", action: "story.approved", summary: 'Approved "Q&A: Twenty years in the motor pool"', created_at: "2026-11-15T18:00:00Z" },
];

export const DEMO_TEAM = [
  { user_id: "demo", email: "owner@theforgotten.site", role: "owner", display_name: "Demo owner", created_at: "2026-11-01T00:00:00Z" },
  { user_id: "demo-r", email: "reviewer@example.com", role: "reviewer", display_name: "Sample reviewer", created_at: "2026-11-10T00:00:00Z" },
];
