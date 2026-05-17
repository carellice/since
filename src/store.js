import { create } from "zustand";
import { deleteCounterRecord, loadDatabase, replaceDatabase, saveAttempt, saveCounter, saveSetting } from "./db";
import { daysBetween, uid } from "./utils";

const defaultSettings = {
  theme: "system",
  accentColor: "#2f6d54",
  notifications: false,
  onboardingCompleted: false,
  securityLock: {
    enabled: false,
    pinHash: null,
    pinSalt: null,
    pinLength: null,
    biometricEnabled: false,
    biometricCredentialId: null,
    biometricUserId: null
  }
};

function formatHabitName(value) {
  return value
    .trim()
    .toLocaleLowerCase("it-IT")
    .replace(/(^|[\s'-])(\p{L})/gu, (_, prefix, letter) => `${prefix}${letter.toLocaleUpperCase("it-IT")}`);
}

function viewUrl(view, activeId) {
  const url = new URL(window.location.href);
  url.searchParams.delete("action");
  url.searchParams.delete("anim");
  url.searchParams.delete("navfix");

  if (view === "dashboard") {
    url.searchParams.delete("view");
    url.searchParams.delete("id");
  } else {
    url.searchParams.set("view", view);
    if (activeId) {
      url.searchParams.set("id", activeId);
    } else {
      url.searchParams.delete("id");
    }
  }

  return `${url.pathname}${url.search}${url.hash}`;
}

function syncHistory(view, activeId, replace = false) {
  if (typeof window === "undefined") return;

  const nextUrl = viewUrl(view, activeId);
  const currentUrl = `${window.location.pathname}${window.location.search}${window.location.hash}`;
  if (nextUrl === currentUrl) return;

  const method = replace ? "replaceState" : "pushState";
  window.history[method]({ view, activeId }, "", nextUrl);
}

export function routeFromLocation(location = window.location) {
  const params = new URLSearchParams(location.search);
  if (params.get("action") === "new") return { view: "editor", activeId: null };

  const view = params.get("view");
  const activeId = params.get("id");
  if (["detail", "editor", "settings"].includes(view)) return { view, activeId };
  return { view: "dashboard", activeId: null };
}

export const useSinceStore = create((set, get) => ({
  counters: [],
  attempts: [],
  settings: defaultSettings,
  activeId: null,
  view: "dashboard",
  ready: false,

  init: async () => {
    const data = await loadDatabase();
    set({
      counters: data.counters.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)),
      attempts: data.attempts.sort((a, b) => new Date(b.endedAt) - new Date(a.endedAt)),
      settings: { ...defaultSettings, ...data.settings },
      ready: true
    });
  },

  setView: (view, activeId = null, options = {}) => {
    if (options.history !== false) {
      syncHistory(view, activeId, options.replace);
    }
    set({ view, activeId });
  },

  upsertCounter: async (draft) => {
    const now = new Date().toISOString();
    const counter = {
      id: draft.id || uid(),
      name: formatHabitName(draft.name),
      icon: draft.icon,
      color: draft.color,
      startedAt: new Date(draft.startedAt).toISOString(),
      bestDays: draft.bestDays || 0,
      createdAt: draft.createdAt || now,
      updatedAt: now
    };

    await saveCounter(counter);
    set((state) => ({
      counters: [counter, ...state.counters.filter((item) => item.id !== counter.id)]
    }));
    return counter.id;
  },

  resetCounter: async (counterId, note) => {
    const counter = get().counters.find((item) => item.id === counterId);
    if (!counter) return;

    const now = new Date().toISOString();
    const days = daysBetween(counter.startedAt, now);
    const attempt = {
      id: uid(),
      counterId,
      startedAt: counter.startedAt,
      endedAt: now,
      days,
      note: note.trim()
    };
    const updated = {
      ...counter,
      startedAt: now,
      bestDays: Math.max(counter.bestDays || 0, days),
      updatedAt: now
    };

    await Promise.all([saveAttempt(attempt), saveCounter(updated)]);
    set((state) => ({
      attempts: [attempt, ...state.attempts],
      counters: state.counters.map((item) => (item.id === counterId ? updated : item))
    }));
  },

  deleteCounter: async (counterId) => {
    await deleteCounterRecord(counterId);
    if (get().activeId === counterId) {
      syncHistory("dashboard", null);
    }
    set((state) => ({
      counters: state.counters.filter((item) => item.id !== counterId),
      attempts: state.attempts.filter((item) => item.counterId !== counterId),
      activeId: state.activeId === counterId ? null : state.activeId,
      view: state.activeId === counterId ? "dashboard" : state.view
    }));
  },

  updateSetting: async (key, value) => {
    await saveSetting(key, value);
    set((state) => ({ settings: { ...state.settings, [key]: value } }));
  },

  exportData: () => ({
    exportedAt: new Date().toISOString(),
    app: "Since",
    version: 1,
    counters: get().counters,
    attempts: get().attempts,
    settings: get().settings
  }),

  importData: async (payload) => {
    await replaceDatabase(payload);
    const data = await loadDatabase();
    set({
      counters: data.counters,
      attempts: data.attempts,
      settings: { ...defaultSettings, ...data.settings },
      view: "dashboard",
      activeId: null
    });
    syncHistory("dashboard", null, true);
  }
}));
