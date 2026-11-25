export type SubjectType = "veteran" | "senior" | "other";
export type StoryFormat = "written" | "interview" | "photo_essay";
export type StoryStatus = "pending" | "approved" | "rejected" | "withdrawn";

export interface Photo {
  id: string;
  url: string | null; // signed URL, or null if unavailable
  caption: string | null;
  alt_text: string | null;
}

/** What the public sees. Mirrors the published_stories view. */
export interface PublicStory {
  id: string;
  slug: string;
  featured: boolean;
  title: string;
  summary: string;
  body: string;
  pull_quote: string | null;
  format: StoryFormat;
  themes: string[];
  subject_display_name: string;
  subject_type: SubjectType;
  subject_type_other: string | null;
  service_branch: string | null;
  service_era: string | null;
  city: string | null;
  region: string;
  country: string;
  contributor_credit: string;
  contributor_school: string | null;
  consent_photos: boolean;
  published_at: string | null;
  photos?: Photo[];
}

/** Full row, admin only. */
export interface AdminStory extends Omit<PublicStory, "slug" | "photos"> {
  slug: string | null;
  status: StoryStatus;
  interview_setting: string;
  partner_org: string | null;
  contributor_name: string;
  contributor_email: string;
  contributor_age_group: "13-17" | "18+";
  guardian_name: string | null;
  guardian_email: string | null;
  guardian_approved: boolean;
  consent_signed_by: string;
  consent_signed_on: string;
  consent_file_path: string;
  consent_real_name: boolean;
  consent_book: boolean;
  reviewer_notes: string | null;
  reviewed_at: string | null;
  withdrawn_at: string | null;
  created_at: string;
}

export interface StoryFilters {
  subject?: string;
  theme?: string;
  region?: string;
  q?: string;
}
