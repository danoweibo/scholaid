export function pickGreeting(): string {
  const hour = new Date().getHours();
  const tod =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  const pool = ["Hey", "Hello", tod];
  return pool[Math.floor(Math.random() * pool.length)];
}

export function pickFormalGreeting(): string {
  const hour = new Date().getHours();
  const tod =
    hour < 12 ? "Good morning" : hour < 17 ? "Good afternoon" : "Good evening";
  return tod;
}

export function initials(name: string): string {
  return name
    .replace(/^Dr\.?\s+/i, "")
    .split(/\s+/)
    .map((s) => s[0])
    .filter(Boolean)
    .slice(0, 2)
    .join("")
    .toUpperCase();
}

export function formatDate(d: Date | string): string {
  const date = typeof d === "string" ? new Date(d) : d;
  return date.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}
