export function cn(...values: Array<string | false | null | undefined>) {
  return values.filter(Boolean).join(" ");
}

export function formatDate(date = new Date()) {
  return new Intl.DateTimeFormat("en-JM", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(date);
}
