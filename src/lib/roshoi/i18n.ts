export const LOCALES = ["en", "bn", "as", "hi"] as const;
export type Locale = (typeof LOCALES)[number];

const en = {
  app: { name: "Order King Command", tagline: "Order like a King." },
  nav: {
    dashboard: "Today", ceo: "CEO Command", live: "Live Control", orders: "Orders", dispatch: "Dispatch", zones: "Zones", restaurants: "Restaurants", riders: "Riders", customers: "Customers", kyc: "KYC", support: "Support", finance: "Finance", settlements: "Settlements", economics: "Economics", promotions: "Promotions", loyalty: "Loyalty", marketing: "Marketing", cms: "CMS", analytics: "Analytics", reports: "Reports", risk: "Risk", ai: "AI Assistant", employees: "Employees", branding: "Branding", flags: "Feature flags", settings: "Settings", notifications: "Notifications", audit: "Audit log", health: "System health",
  },
  groups: { today: "Today", executive: "Executive", operations: "Operations", network: "Network", support: "Support", finance: "Finance", growth: "Growth", intelligence: "Intelligence", system: "System" },
  auth: { signIn: "Sign in", signOut: "Sign out", email: "Work email", password: "Password", continueGoogle: "Continue with Google", continueX: "Continue with X", firstUser: "The first person to sign in becomes Super Admin.", pending: "Your access is pending an administrator invite.", enter: "Enter Command" },
  common: { simulated: "Simulated / development data", actual: "Actual", estimate: "Estimate", forecast: "Forecast", model: "Model", search: "Search Command", save: "Save", cancel: "Cancel", confirm: "Confirm", reason: "Reason", export: "Export CSV", empty: "Nothing to show", loading: "Loading", delayed: "Delayed", online: "Online", offline: "Offline" },
};

const bn: typeof en = {
  app: { name: "অর্ডার কিং কমান্ড", tagline: "রাজার মতো অর্ডার করুন।" },
  nav: { dashboard: "আজ", ceo: "সিইও কমান্ড", live: "লাইভ নিয়ন্ত্রণ", orders: "অর্ডার", dispatch: "ডিসপ্যাচ", zones: "জোন", restaurants: "রেস্তোরাঁ", riders: "রাইডার", customers: "গ্রাহক", kyc: "কেওয়াইসি", support: "সহায়তা", finance: "অর্থ", settlements: "সেটেলমেন্ট", economics: "অর্থনীতি", promotions: "প্রমোশন", loyalty: "লয়ালটি", marketing: "মার্কেটিং", cms: "সিএমএস", analytics: "বিশ্লেষণ", reports: "রিপোর্ট", risk: "ঝুঁকি", ai: "এআই সহায়ক", employees: "কর্মচারী", branding: "ব্র্যান্ডিং", flags: "ফিচার ফ্ল্যাগ", settings: "সেটিংস", notifications: "বিজ্ঞপ্তি", audit: "অডিট লগ", health: "সিস্টেম স্বাস্থ্য" },
  groups: { today: "আজ", executive: "নির্বাহী", operations: "অপারেশন", network: "নেটওয়ার্ক", support: "সহায়তা", finance: "অর্থ", growth: "গ্রোথ", intelligence: "ইন্টেলিজেন্স", system: "সিস্টেম" },
  auth: { signIn: "সাইন ইন", signOut: "সাইন আউট", email: "কর্মস্থলের ইমেইল", password: "পাসওয়ার্ড", continueGoogle: "Google দিয়ে চালিয়ে যান", continueX: "X দিয়ে চালিয়ে যান", firstUser: "প্রথম সাইন-ইনকারী সুপার অ্যাডমিন হবেন।", pending: "আপনার অ্যাক্সেস অ্যাডমিনের আমন্ত্রণের অপেক্ষায়।", enter: "কমান্ডে প্রবেশ করুন" },
  common: { simulated: "সিমুলেটেড / ডেভেলপমেন্ট ডেটা", actual: "প্রকৃত", estimate: "আনুমানিক", forecast: "পূর্বাভাস", model: "মডেল", search: "কমান্ড খুঁজুন", save: "সংরক্ষণ", cancel: "বাতিল", confirm: "নিশ্চিত", reason: "কারণ", export: "CSV রপ্তানি", empty: "দেখানোর কিছু নেই", loading: "লোড হচ্ছে", delayed: "বিলম্বিত", online: "অনলাইন", offline: "অফলাইন" },
};

export const DICTIONARIES: Record<Locale, typeof en> = {
  en,
  bn,
  as: { ...en, app: { name: "অৰ্ডাৰ কিং কমাণ্ড", tagline: "ৰজাৰ দৰে অৰ্ডাৰ কৰক।" } },
  hi: { ...en, app: { name: "ऑर्डर किंग कमांड", tagline: "राजा की तरह ऑर्डर करें।" } },
};

export type MessageTree = typeof en;

function lookup(tree: unknown, path: string): string | undefined {
  const parts = path.split(".");
  let cur: unknown = tree;
  for (const p of parts) {
    if (typeof cur !== "object" || cur === null || !(p in cur)) return undefined;
    cur = (cur as Record<string, unknown>)[p];
  }
  return typeof cur === "string" ? cur : undefined;
}

export function t(locale: Locale, path: string): string {
  return lookup(DICTIONARIES[locale], path) ?? lookup(en, path) ?? path;
}

export const LOCALE_LABELS: Record<Locale, string> = { en: "English", bn: "বাংলা", as: "অসমীয়া", hi: "हिन्दी" };
