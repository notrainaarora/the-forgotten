export const SITE = {
  name: "The Forgotten",
  tagline: "Honoring the veterans our communities overlook.",
  motto: "Listen. Document. Share.",
  founder: "Raina Arora",
  contactEmail: "teamtheforgotten@gmail.com",
  url: process.env.NEXT_PUBLIC_SITE_URL || "https://theforgotten.site",
};

export const SUBJECT_TYPES = [
  { value: "veteran", label: "Veteran" },
  { value: "senior", label: "Senior" },
  { value: "other", label: "Someone else overlooked" },
] as const;

export const FORMATS = [
  { value: "written", label: "Written narrative" },
  { value: "interview", label: "Interview (Q&A)" },
  { value: "photo_essay", label: "Photo essay" },
] as const;

export const INTERVIEW_SETTINGS = [
  { value: "partner_org", label: "Through a partner organization (shelter, senior center, VA program)" },
  { value: "supervised", label: "Supervised by a parent, teacher, or other adult" },
  { value: "public_place", label: "In a public place (library, café, community center)" },
  { value: "family_member", label: "They're a member of my own family" },
  { value: "other", label: "Other" },
] as const;

export const BRANCHES = [
  "Army", "Navy", "Air Force", "Marine Corps", "Coast Guard", "Space Force", "National Guard", "Merchant Marine", "Other / not sure",
];

export const ERAS = [
  "World War II", "Korea", "Vietnam", "Cold War", "Gulf War", "Iraq / Afghanistan (post-9/11)", "Peacetime", "Other / not sure",
];

// Used when the database isn't connected; keep in sync with the themes table seed.
export const DEFAULT_THEMES = [
  { slug: "service", label: "Service & sacrifice" },
  { slug: "homelessness", label: "Homelessness" },
  { slug: "isolation", label: "Isolation & aging" },
  { slug: "family", label: "Family" },
  { slug: "resilience", label: "Resilience" },
  { slug: "work", label: "Work & craft" },
  { slug: "community", label: "Community" },
  { slug: "faith", label: "Faith & meaning" },
  { slug: "memory", label: "Memory & history" },
  { slug: "health", label: "Health & recovery" },
];

export const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "District of Columbia", "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas",
  "Kentucky", "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico", "New York",
  "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania", "Puerto Rico", "Rhode Island",
  "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont", "Virginia", "Washington",
  "West Virginia", "Wisconsin", "Wyoming",
];

export const RESOURCES = [
  {
    name: "National Call Center for Homeless Veterans",
    detail: "Free, confidential, 24/7. Call 1-877-424-3838 (1-877-4AID-VET) or chat online.",
    href: "https://www.va.gov/homeless/nationalcallcenter.asp",
    group: "Get help now",
  },
  {
    name: "Veterans Crisis Line",
    detail: "Dial 988 then press 1, text 838255, or chat online. You don't need to be enrolled in VA care.",
    href: "https://www.veteranscrisisline.net/",
    group: "Get help now",
  },
  {
    name: "Eldercare Locator",
    detail: "Connects older adults and caregivers to local help: meals, home care, transportation. Call 1-800-677-1116.",
    href: "https://eldercare.acl.gov/",
    group: "Get help now",
  },
  {
    name: "VA Homeless Programs",
    detail: "The VA's programs for veterans who are homeless or at risk, and how communities can help.",
    href: "https://www.va.gov/homeless/",
    group: "Support the work",
  },
  {
    name: "National Coalition for Homeless Veterans",
    detail: "A national network of community groups working to end veteran homelessness.",
    href: "https://nchv.org/",
    group: "Support the work",
  },
  {
    name: "Meals on Wheels America",
    detail: "Find a local program to volunteer with or support, delivering meals and visits to seniors.",
    href: "https://www.mealsonwheelsamerica.org/",
    group: "Support the work",
  },
];
