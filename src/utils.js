export const iconOptions = [
  "Flame",
  "Cigarette",
  "Coffee",
  "Candy",
  "Cookie",
  "Wine",
  "Beer",
  "Pizza",
  "Smartphone",
  "MessageCircle",
  "Monitor",
  "Gamepad2",
  "ShoppingBag",
  "WalletCards",
  "Utensils",
  "Dumbbell",
  "Bike",
  "BookOpen",
  "Music",
  "Pill",
  "HeartPulse",
  "Moon"
];

export const colorOptions = [
  "#3f7d58",
  "#2f8f8a",
  "#5378a7",
  "#5f73d9",
  "#9a6fb0",
  "#b84a62",
  "#bc5f45",
  "#cc8b2c",
  "#7d8f3f",
  "#5b6f47",
  "#2f6d54",
  "#40606f",
  "#7a5a42",
  "#8d4d76",
  "#d48a6a",
  "#6d7f94"
];

export const milestones = [
  { days: 3, label: "3 giorni", badge: "Primo slancio" },
  { days: 7, label: "1 settimana", badge: "Bronzo" },
  { days: 14, label: "2 settimane", badge: "Argento" },
  { days: 30, label: "1 mese", badge: "Oro" },
  { days: 60, label: "2 mesi", badge: "Platino" },
  { days: 100, label: "100 giorni", badge: "Centenario" },
  { days: 365, label: "1 anno", badge: "Leggenda" },
  { days: 730, label: "2 anni", badge: "Maestro" },
  { days: 1095, label: "3 anni", badge: "Veterano" },
  { days: 1460, label: "4 anni", badge: "Icona" },
  { days: 1825, label: "5 anni", badge: "Eterno" }
];

export function uid() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random().toString(16).slice(2)}`;
}

export function daysBetween(start, end = Date.now()) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.floor(diff / 86400000));
}

export function hoursRemainder(start, end = Date.now()) {
  const diff = new Date(end).getTime() - new Date(start).getTime();
  return Math.max(0, Math.floor((diff % 86400000) / 3600000));
}

export function formatDateTime(value) {
  return new Intl.DateTimeFormat("it-IT", {
    dateStyle: "medium",
    timeStyle: "short"
  }).format(new Date(value));
}

export function nextMilestone(days) {
  return milestones.find((milestone) => milestone.days > days) || milestones[milestones.length - 1];
}

export function bestBadge(days) {
  return [...milestones].reverse().find((milestone) => days >= milestone.days)?.badge || "Inizio";
}

export function progressToNext(days) {
  const next = nextMilestone(days);
  const previous = [...milestones].reverse().find((milestone) => milestone.days <= days)?.days || 0;
  const span = Math.max(1, next.days - previous);
  return Math.min(100, Math.round(((days - previous) / span) * 100));
}
