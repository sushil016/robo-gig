const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const isProduction = process.env.NODE_ENV === "production";
const isLocalhostApiUrl =
  configuredApiUrl !== undefined && /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?/.test(configuredApiUrl);

export const API_BASE_URL =
  configuredApiUrl && !(isProduction && isLocalhostApiUrl)
    ? configuredApiUrl
    : isProduction
      ? "/_/backend"
      : "http://localhost:4000";
