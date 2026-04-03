function trimUrl(value: string | undefined) {
  return value?.trim().replace(/\/+$/, "") || "";
}

function isLocalUrl(value: string) {
  return /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/i.test(value);
}

export function getAppBaseUrl() {
  const notificationBaseUrl = trimUrl(process.env.SLYDE_NOTIFICATION_BASE_URL);
  const websiteBaseUrl = trimUrl(process.env.SLYDE_WEBSITE_BASE_URL);
  const publicAppUrl = trimUrl(process.env.NEXT_PUBLIC_APP_URL);
  const e2eBaseUrl = trimUrl(process.env.E2E_BASE_URL);
  const port = (process.env.PORT || process.env.SLYDE_DEV_PORT || "3001").trim();
  const localFallback = `http://127.0.0.1:${port}`;
  const isProduction = process.env.NODE_ENV === "production";

  if (isProduction) {
    return notificationBaseUrl || websiteBaseUrl || publicAppUrl || e2eBaseUrl || localFallback;
  }

  if (notificationBaseUrl) return notificationBaseUrl;
  if (publicAppUrl) return publicAppUrl;
  if (e2eBaseUrl) return e2eBaseUrl;
  if (websiteBaseUrl && isLocalUrl(websiteBaseUrl)) return websiteBaseUrl;
  return localFallback;
}
