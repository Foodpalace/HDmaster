export type DataMode = "SIMULATED" | "PRODUCTION";
export type MetricLabel = "ACTUAL" | "ESTIMATE" | "FORECAST" | "MODEL" | "SIMULATED";

export type Metric<T = number> = {
  value: T;
  label: MetricLabel;
};

export type AlertSeverity = "CRITICAL" | "HIGH" | "MEDIUM" | "LOW" | "INFORMATION";

export const DEFAULT_ORG_ID = "org_roshoi";
export const DEFAULT_CITY_ID = "city_karimganj";
export const DEFAULT_CITY_NAME = "Karimganj";

export type PlatformSettings = {
  commissionBps: number;
  paymentFeeBps: number;
  serviceFeePaise: number;
  riderBasePaise: number;
  riderDistancePaise: number;
  offerTimeoutSeconds: number;
  otpRequired: boolean;
  codEnabled: boolean;
  cancellationWindowMinutes: number;
  refundLimitPaise: number;
  supportSlaMinutes: number;
  languages: string[];
  defaultLanguage: string;
};

export const DEFAULT_SETTINGS: PlatformSettings = {
  commissionBps: 1000,
  paymentFeeBps: 180,
  serviceFeePaise: 500,
  riderBasePaise: 2500,
  riderDistancePaise: 800,
  offerTimeoutSeconds: 30,
  otpRequired: true,
  codEnabled: true,
  cancellationWindowMinutes: 8,
  refundLimitPaise: 50000,
  supportSlaMinutes: 30,
  languages: ["en", "bn"],
  defaultLanguage: "en",
};

export type BrandingConfig = {
  appName: string;
  logoSvg: string | null;
  faviconSvg: string | null;
  colorBg: string;
  colorFg: string;
  colorPrimary: string;
  colorPrimaryFg: string;
  colorAccent: string;
  fontDisplay: string | null;
  fontBody: string | null;
  domain: string | null;
  tagline: string;
  appStoreName: string;
  notificationSender: string;
  invoiceBranding: string;
  customerBranding: string;
  restaurantBranding: string;
  riderBranding: string;
  adminBranding: string;
  legalCompanyName: string;
  supportEmail: string;
  supportPhone: string;
};

export const DEFAULT_BRANDING: BrandingConfig = {
  appName: "Roshoi",
  logoSvg: null,
  faviconSvg: null,
  colorBg: "#0c0d0c",
  colorFg: "#f2f0ea",
  colorPrimary: "#e8e4dc",
  colorPrimaryFg: "#0c0d0c",
  colorAccent: "#c8ccd4",
  fontDisplay: "Newsreader",
  fontBody: "IBM Plex Sans",
  domain: null,
  tagline: "The kitchen, delivered.",
  appStoreName: "Roshoi",
  notificationSender: "Roshoi",
  invoiceBranding: "Roshoi Foods",
  customerBranding: "Roshoi",
  restaurantBranding: "Roshoi Partner",
  riderBranding: "Roshoi Rider",
  adminBranding: "Roshoi Command",
  legalCompanyName: "Roshoi Foods Private Limited",
  supportEmail: "support@roshoi.example",
  supportPhone: "+91 38xxx xxxxx",
};

export const FEATURE_FLAG_KEYS = [
  "customer_ai",
  "restaurant_ai",
  "rider_ai",
  "live_tracking",
  "cod",
  "delivery_otp",
  "pod_photo",
  "qr_pickup",
  "multi_order",
  "loyalty",
  "referrals",
  "subscriptions",
  "advertising",
  "advanced_dispatch",
  "whatsapp",
  "sms",
  "push",
  "restaurant_premium",
  "corporate_orders",
] as const;

export type FeatureFlagKey = (typeof FEATURE_FLAG_KEYS)[number];
export type FlagState = "ON" | "OFF" | "ROLLOUT_PERCENTAGE";
