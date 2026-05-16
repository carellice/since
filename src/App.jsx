import React, { useEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import {
  Bell,
  Beer,
  Bike,
  BookOpen,
  CalendarClock,
  CalendarDays,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  ChevronUp,
  Coffee,
  Cigarette,
  Clock,
  Cookie,
  Download,
  Dumbbell,
  Flame,
  Gamepad2,
  Home,
  HeartPulse,
  MessageCircle,
  Monitor,
  Moon,
  Music,
  Pill,
  Pizza,
  Plus,
  RefreshCcw,
  Settings,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Trophy,
  Upload,
  Utensils,
  WalletCards,
  Wine,
  X,
  Candy
} from "lucide-react";
import { routeFromLocation, useSinceStore } from "./store";
import {
  bestBadge,
  colorOptions,
  daysBetween,
  formatDateTime,
  hoursRemainder,
  iconOptions,
  milestones,
  nextMilestone,
  progressToNext
} from "./utils";

const iconMap = {
  Flame,
  Cigarette,
  Coffee,
  Candy,
  Cookie,
  Wine,
  Beer,
  Pizza,
  Smartphone,
  MessageCircle,
  Monitor,
  Gamepad2,
  ShoppingBag,
  WalletCards,
  Utensils,
  Dumbbell,
  Bike,
  BookOpen,
  Music,
  Pill,
  HeartPulse,
  Moon
};

const accentOptions = ["#2f6d54", "#2f8f8a", "#5378a7", "#5f73d9", "#9a6fb0", "#b84a62", "#bc5f45", "#cc8b2c"];

function HabitIcon({ name, size = 22 }) {
  const Icon = iconMap[name] || Sparkles;
  return <Icon size={size} strokeWidth={2.2} />;
}

function useClock() {
  const [now, setNow] = useState(Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 60000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function App() {
  const { init, ready, settings, view, activeId, counters } = useSinceStore();

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    const root = document.documentElement;
    root.dataset.theme = settings.theme;
    root.style.setProperty("--primary", settings.accentColor || "#2f6d54");
    root.style.setProperty("--primary-ink", readableInk(settings.accentColor || "#2f6d54"));
  }, [settings.theme, settings.accentColor]);

  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" });
  }, [view, activeId]);

  useEffect(() => {
    const route = routeFromLocation();
    useSinceStore.getState().setView(route.view, route.activeId, { history: false });

    const handlePopState = () => {
      const nextRoute = routeFromLocation();
      useSinceStore.getState().setView(nextRoute.view, nextRoute.activeId, { history: false });
    };

    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  const activeCounter = counters.find((counter) => counter.id === activeId) || counters[0];

  if (!ready) {
    return (
      <main className="boot">
        <img src="/logo.png" alt="Since" />
      </main>
    );
  }

  return (
    <main className="app-shell">
      <Sidebar />
      <section className="app-content">
        <div className="page-stage" key={`${view}-${activeId || "root"}`}>
          {view === "dashboard" && <Dashboard />}
          {view === "detail" && activeCounter && <Detail counter={activeCounter} />}
          {view === "settings" && <SettingsView />}
          {view === "editor" && <Editor />}
        </div>
      </section>
      <BottomNav />
      <FloatingAction />
    </main>
  );
}

function Sidebar() {
  const { view, setView } = useSinceStore();
  return (
    <aside className="sidebar">
      <button className="brand" onClick={() => setView("dashboard")} aria-label="Since">
        <img src="/logo.png" alt="" />
        <span>Since</span>
      </button>
      <nav>
        <button className={view === "dashboard" ? "active" : ""} onClick={() => setView("dashboard")}>
          <Home size={20} />
          <span>Dashboard</span>
        </button>
        <button className={view === "editor" ? "active" : ""} onClick={() => setView("editor")}>
          <Plus size={20} />
          <span>Nuovo</span>
        </button>
        <button className={view === "settings" ? "active" : ""} onClick={() => setView("settings")}>
          <Settings size={20} />
          <span>Impostazioni</span>
        </button>
      </nav>
    </aside>
  );
}

function Dashboard() {
  const counters = useSinceStore((state) => state.counters);
  const now = useClock();
  const totalDays = counters.reduce((sum, counter) => sum + daysBetween(counter.startedAt, now), 0);
  const best = counters.reduce((max, counter) => Math.max(max, counter.bestDays || 0, daysBetween(counter.startedAt, now)), 0);

  return (
    <div className="screen">
      <header className="topbar">
        <div>
          <p className="eyebrow">Today</p>
          <h1>Since</h1>
        </div>
      </header>

      <section className="summary-band">
        <div>
          <span>Giorni puliti</span>
          <strong>{totalDays}</strong>
        </div>
        <div>
          <span>Percorsi</span>
          <strong>{counters.length}</strong>
        </div>
        <div>
          <span>Record</span>
          <strong>{best}</strong>
        </div>
      </section>

      {counters.length === 0 ? (
        <EmptyState />
      ) : (
        <section className="counter-grid" aria-label="Contatori">
          {counters.map((counter) => (
            <CounterCard key={counter.id} counter={counter} now={now} />
          ))}
        </section>
      )}
    </div>
  );
}

function EmptyState() {
  const setView = useSinceStore((state) => state.setView);
  return (
    <section className="empty-state">
      <img src="/logo.png" alt="" />
      <h2>Inizia il primo percorso</h2>
      <p>Scegli un’abitudine, imposta quando hai iniziato e lascia che Since tenga il conto.</p>
      <button className="primary-button" onClick={() => setView("editor")}>
        <Plus size={20} />
        Nuovo contatore
      </button>
    </section>
  );
}

function CounterCard({ counter, now }) {
  const setView = useSinceStore((state) => state.setView);
  const days = daysBetween(counter.startedAt, now);
  const hours = hoursRemainder(counter.startedAt, now);
  const next = nextMilestone(days);

  return (
    <article className="counter-card" style={{ "--accent": counter.color }} onClick={() => setView("detail", counter.id)}>
      <div className="card-head">
        <div className="habit-mark">
          <HabitIcon name={counter.icon} />
        </div>
        <span className="badge">{bestBadge(Math.max(days, counter.bestDays || 0))}</span>
      </div>
      <h2>{counter.name}</h2>
      <div className="streak">
        <strong>{days}</strong>
        <span>giorni</span>
        <small>{hours}h</small>
      </div>
      <div className="progress-line">
        <span style={{ width: `${progressToNext(days)}%` }} />
      </div>
      <footer>
        <span>Prossimo: {next.label}</span>
        <span>Record {Math.max(counter.bestDays || 0, days)}g</span>
      </footer>
    </article>
  );
}

function Detail({ counter }) {
  const now = useClock();
  const { attempts, setView, resetCounter, deleteCounter } = useSinceStore();
  const [note, setNote] = useState("");
  const [showReset, setShowReset] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const days = daysBetween(counter.startedAt, now);
  const counterAttempts = attempts.filter((attempt) => attempt.counterId === counter.id);
  const unlocked = milestones.filter((milestone) => days >= milestone.days);

  async function handleReset() {
    await resetCounter(counter.id, note);
    setNote("");
    setShowReset(false);
  }

  return (
    <div className="screen detail-screen">
      <header className="topbar">
        <button className="icon-button" onClick={() => setView("dashboard")} aria-label="Indietro">
          <ChevronLeft size={24} />
        </button>
        <button className="icon-button" onClick={() => setView("editor", counter.id)} aria-label="Modifica">
          <Settings size={20} />
        </button>
      </header>

      <section className="detail-hero" style={{ "--accent": counter.color }}>
        <div className="habit-mark large">
          <HabitIcon name={counter.icon} size={30} />
        </div>
        <p className="eyebrow">Since {formatDateTime(counter.startedAt)}</p>
        <h1>{counter.name}</h1>
        <div className="giant-count">
          <strong>{days}</strong>
          <span>giorni</span>
        </div>
        <div className="hero-actions">
          <button className="secondary-button" onClick={() => setShowReset(true)}>
            <RefreshCcw size={18} />
            Reset
          </button>
          <button className="ghost-button danger" onClick={() => setConfirmDelete(true)}>
            <X size={18} />
            Elimina
          </button>
        </div>
      </section>

      {showReset && (
        <section className="reset-panel">
          <h2>Registra ricaduta</h2>
          <textarea value={note} onChange={(event) => setNote(event.target.value)} placeholder="Nota opzionale" rows={3} />
          <div>
            <button className="ghost-button" onClick={() => setShowReset(false)}>
              Annulla
            </button>
            <button className="primary-button" onClick={handleReset}>
              <Check size={18} />
              Salva reset
            </button>
          </div>
        </section>
      )}

      <section className="detail-grid">
        <Metric title="Record" value={`${Math.max(counter.bestDays || 0, days)}g`} icon={Trophy} />
        <Metric title="Badge" value={bestBadge(Math.max(counter.bestDays || 0, days))} icon={Sparkles} />
        <Metric title="Tentativi" value={counterAttempts.length + 1} icon={RefreshCcw} />
      </section>

      <section className="panel">
        <h2>Traguardi</h2>
        <div className="milestone-list">
          {milestones.map((milestone) => (
            <div key={milestone.days} className={days >= milestone.days ? "done" : ""}>
              <Trophy size={18} />
              <span>{milestone.label}</span>
              <strong>{days >= milestone.days ? "Sbloccato" : `${milestone.days - days}g`}</strong>
            </div>
          ))}
        </div>
      </section>

      <section className="panel">
        <h2>Cronologia</h2>
        {counterAttempts.length === 0 ? (
          <div className="history-empty">
            <RefreshCcw size={22} />
            <div>
              <strong>Nessun reset registrato</strong>
              <p>Quando farai un reset, qui compariranno durata, date e nota del tentativo concluso.</p>
            </div>
          </div>
        ) : (
          <div className="timeline">
            {counterAttempts.map((attempt, index) => (
              <article key={attempt.id} className="timeline-entry">
                <div className="timeline-marker">{counterAttempts.length - index}</div>
                <div className="timeline-content">
                  <header>
                    <span>Tentativo concluso</span>
                    <strong>{attempt.days} giorni</strong>
                  </header>
                  <dl>
                    <div>
                      <dt>Inizio</dt>
                      <dd>{formatDateTime(attempt.startedAt)}</dd>
                    </div>
                    <div>
                      <dt>Fine</dt>
                      <dd>{formatDateTime(attempt.endedAt)}</dd>
                    </div>
                  </dl>
                  {attempt.note ? <p>{attempt.note}</p> : <p className="muted-note">Nessuna nota inserita.</p>}
                </div>
              </article>
            ))}
          </div>
        )}
      </section>

      {confirmDelete && (
        <ConfirmSheet
          title="Eliminare percorso?"
          body={`Verranno eliminati "${counter.name}" e tutta la sua cronologia. Questa azione non puo essere annullata.`}
          confirmLabel="Elimina"
          onCancel={() => setConfirmDelete(false)}
          onConfirm={async () => {
            await deleteCounter(counter.id);
            setConfirmDelete(false);
          }}
        />
      )}
    </div>
  );
}

function ConfirmSheet({ title, body, confirmLabel, onCancel, onConfirm }) {
  return createPortal(
    <div className="picker-overlay" role="presentation" onClick={onCancel}>
      <section className="confirm-sheet" role="dialog" aria-modal="true" aria-label={title} onClick={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        <div className="confirm-icon">
          <X size={24} />
        </div>
        <div className="confirm-copy">
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
        <div className="confirm-actions">
          <button className="secondary-button" type="button" onClick={onCancel}>
            Annulla
          </button>
          <button className="primary-button danger-button" type="button" onClick={onConfirm}>
            {confirmLabel}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

function Metric({ title, value, icon: Icon }) {
  return (
    <article className="metric">
      <Icon size={19} />
      <span>{title}</span>
      <strong>{value}</strong>
    </article>
  );
}

function Editor() {
  const { activeId, counters, upsertCounter, setView } = useSinceStore();
  const editing = counters.find((counter) => counter.id === activeId);
  const [picker, setPicker] = useState(null);
  const [draft, setDraft] = useState(() => ({
    id: editing?.id,
    name: editing?.name || "",
    icon: editing?.icon || "Flame",
    color: editing?.color || colorOptions[0],
    startedAt: editing ? toInputDate(editing.startedAt) : toInputDate(new Date()),
    bestDays: editing?.bestDays,
    createdAt: editing?.createdAt
  }));
  const selectedStart = new Date(draft.startedAt);
  const startDate = draft.startedAt.slice(0, 10);
  const startTime = draft.startedAt.slice(11, 16);

  function updateStart(nextDate, nextTime) {
    setDraft({ ...draft, startedAt: `${nextDate}T${nextTime}` });
  }

  function setQuickStart(minutesAgo) {
    const date = new Date(Date.now() - minutesAgo * 60000);
    setDraft({ ...draft, startedAt: toInputDate(date) });
  }

  async function submit(event) {
    event.preventDefault();
    if (!draft.name.trim()) return;
    const id = await upsertCounter(draft);
    setView(editing ? "detail" : "dashboard", editing ? id : null);
  }

  return (
    <div className="screen">
      <header className="topbar">
        <button className="icon-button" onClick={() => setView(editing ? "detail" : "dashboard", editing?.id)} aria-label="Indietro">
          <ChevronLeft size={24} />
        </button>
        <h1>{editing ? "Modifica" : "Nuovo"}</h1>
      </header>

      <form className="editor-form" onSubmit={submit}>
        <label>
          Nome
          <input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Fumo, zuccheri, social..." />
        </label>
        <section className="start-picker" aria-label="Inizio percorso">
          <div className="start-picker-head">
            <div>
              <span>Inizio</span>
              <strong>{formatDateTime(selectedStart)}</strong>
            </div>
            <CalendarClock size={24} />
          </div>

          <div className="quick-starts">
            <button type="button" onClick={() => setQuickStart(0)}>
              Adesso
            </button>
            <button type="button" onClick={() => setQuickStart(24 * 60)}>
              Ieri
            </button>
          </div>

          <div className="date-time-grid">
            <button className="date-time-field" type="button" onClick={() => setPicker("date")}>
              <span className="date-time-icon">
                <CalendarDays size={18} />
              </span>
              <span className="date-time-copy">
                <span>Data</span>
                <strong>{formatCompactDate(startDate)}</strong>
              </span>
            </button>
            <button className="date-time-field" type="button" onClick={() => setPicker("time")}>
              <span className="date-time-icon">
                <Clock size={18} />
              </span>
              <span className="date-time-copy">
                <span>Ora</span>
                <strong>{startTime}</strong>
              </span>
            </button>
          </div>
        </section>

        <fieldset>
          <legend>Icona</legend>
          <div className="choice-grid">
            {iconOptions.map((icon) => (
              <button type="button" key={icon} className={draft.icon === icon ? "selected" : ""} onClick={() => setDraft({ ...draft, icon })} aria-label={icon}>
                <HabitIcon name={icon} />
              </button>
            ))}
          </div>
        </fieldset>

        <fieldset>
          <legend>Colore</legend>
          <div className="swatches">
            {colorOptions.map((color) => (
              <button
                type="button"
                key={color}
                className={draft.color === color ? "selected" : ""}
                style={{ "--swatch": color }}
                onClick={() => setDraft({ ...draft, color })}
                aria-label={color}
              />
            ))}
          </div>
        </fieldset>

        <button className="primary-button full" type="submit">
          <Check size={19} />
          Salva
        </button>
      </form>

      {picker && (
        <DateTimeSheet
          mode={picker}
          value={draft.startedAt}
          onClose={() => setPicker(null)}
          onChange={(value) => setDraft({ ...draft, startedAt: value })}
        />
      )}
    </div>
  );
}

function DateTimeSheet({ mode, value, onClose, onChange }) {
  const selected = new Date(value);
  const [visibleMonth, setVisibleMonth] = useState(() => new Date(selected.getFullYear(), selected.getMonth(), 1));
  const selectedDate = value.slice(0, 10);
  const selectedTime = value.slice(11, 16);

  function updateDate(date) {
    onChange(`${toDateInput(date)}T${selectedTime}`);
    onClose();
  }

  function updateTime(hours, minutes) {
    const nextHours = String((hours + 24) % 24).padStart(2, "0");
    const nextMinutes = String((minutes + 60) % 60).padStart(2, "0");
    onChange(`${selectedDate}T${nextHours}:${nextMinutes}`);
  }

  const hours = Number(selectedTime.slice(0, 2));
  const minutes = Number(selectedTime.slice(3, 5));

  return createPortal(
    <div className="picker-overlay" role="presentation" onClick={onClose}>
      <section className="picker-sheet" role="dialog" aria-modal="true" aria-label={mode === "date" ? "Seleziona data" : "Seleziona ora"} onClick={(event) => event.stopPropagation()}>
        <div className="sheet-handle" />
        {mode === "date" ? (
          <>
            <header className="picker-header">
              <button type="button" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() - 1, 1))} aria-label="Mese precedente">
                <ChevronLeft size={20} />
              </button>
              <strong>{monthLabel(visibleMonth)}</strong>
              <button type="button" onClick={() => setVisibleMonth(new Date(visibleMonth.getFullYear(), visibleMonth.getMonth() + 1, 1))} aria-label="Mese successivo">
                <ChevronRight size={20} />
              </button>
            </header>
            <div className="calendar-weekdays">
              {["L", "M", "M", "G", "V", "S", "D"].map((day) => (
                <span key={day}>{day}</span>
              ))}
            </div>
            <div className="calendar-grid">
              {calendarDays(visibleMonth).map((day, index) =>
                day ? (
                  <button
                    type="button"
                    key={day.toISOString()}
                    className={toDateInput(day) === selectedDate ? "selected" : ""}
                    onClick={() => updateDate(day)}
                  >
                    {day.getDate()}
                  </button>
                ) : (
                  <span key={`blank-${index}`} />
                )
              )}
            </div>
          </>
        ) : (
          <>
            <header className="picker-title">
              <span>Ora di inizio</span>
              <strong>{selectedTime}</strong>
            </header>
            <div className="time-picker-grid">
              <TimeColumn label="Ore" value={hours} onUp={() => updateTime(hours + 1, minutes)} onDown={() => updateTime(hours - 1, minutes)} />
              <TimeColumn label="Minuti" value={minutes} onUp={() => updateTime(hours, minutes + 1)} onDown={() => updateTime(hours, minutes - 1)} />
            </div>
            <button type="button" className="primary-button full" onClick={onClose}>
              <Check size={18} />
              Conferma
            </button>
          </>
        )}
      </section>
    </div>,
    document.body
  );
}

function TimeColumn({ label, value, onUp, onDown }) {
  return (
    <div className="time-column">
      <RepeatButton action={onUp} label={`${label} avanti`}>
        <ChevronUp size={22} />
      </RepeatButton>
      <span>{label}</span>
      <strong>{String(value).padStart(2, "0")}</strong>
      <RepeatButton action={onDown} label={`${label} indietro`}>
        <ChevronDown size={22} />
      </RepeatButton>
    </div>
  );
}

function RepeatButton({ action, label, children }) {
  const timeoutRef = useRef(null);
  const intervalRef = useRef(null);
  const actionRef = useRef(action);

  useEffect(() => {
    actionRef.current = action;
  }, [action]);

  function stopRepeat() {
    window.clearTimeout(timeoutRef.current);
    window.clearInterval(intervalRef.current);
    timeoutRef.current = null;
    intervalRef.current = null;
  }

  function startRepeat(event) {
    event.preventDefault();
    stopRepeat();
    actionRef.current();
    timeoutRef.current = window.setTimeout(() => {
      intervalRef.current = window.setInterval(() => actionRef.current(), 80);
    }, 340);
  }

  useEffect(() => stopRepeat, []);

  return (
    <button
      type="button"
      aria-label={label}
      onPointerDown={startRepeat}
      onPointerUp={stopRepeat}
      onPointerCancel={stopRepeat}
      onPointerLeave={stopRepeat}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") startRepeat(event);
      }}
      onKeyUp={stopRepeat}
    >
      {children}
    </button>
  );
}

function SettingsView() {
  const { settings, updateSetting, exportData, importData } = useSinceStore();
  const themeIndex = ["system", "light", "dark"].indexOf(settings.theme);

  async function requestNotifications() {
    if (!("Notification" in window)) return;
    const permission = await Notification.requestPermission();
    updateSetting("notifications", permission === "granted");
  }

  function downloadBackup() {
    const data = JSON.stringify(exportData(), null, 2);
    const url = URL.createObjectURL(new Blob([data], { type: "application/json" }));
    const link = document.createElement("a");
    link.href = url;
    link.download = `since-backup-${new Date().toISOString().slice(0, 10)}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  async function uploadBackup(event) {
    const file = event.target.files?.[0];
    if (!file) return;
    const payload = JSON.parse(await file.text());
    await importData(payload);
  }

  return (
    <div className="screen">
      <header className="topbar">
        <div>
          <p className="eyebrow">Local-first</p>
          <h1>Impostazioni</h1>
        </div>
      </header>

      <section className="panel settings-panel">
        <h2>Tema</h2>
        <div className="segmented" style={{ "--active-index": themeIndex }}>
          <span className="segmented-indicator" aria-hidden="true" />
          {["system", "light", "dark"].map((theme) => (
            <button key={theme} className={settings.theme === theme ? "active" : ""} onClick={() => updateSetting("theme", theme)}>
              {theme === "system" ? "Sistema" : theme === "light" ? "Chiaro" : "Scuro"}
            </button>
          ))}
        </div>
      </section>

      <section className="panel settings-panel">
        <h2>Colore app</h2>
        <div className="accent-grid" aria-label="Colore principale">
          {accentOptions.map((color) => (
            <button
              key={color}
              className={settings.accentColor === color ? "selected" : ""}
              style={{ "--accent-choice": color }}
              onClick={() => updateSetting("accentColor", color)}
              aria-label={`Colore ${color}`}
            >
              {settings.accentColor === color && <Check size={18} />}
            </button>
          ))}
        </div>
      </section>

      <section className="panel settings-panel">
        <h2>Notifiche</h2>
        <button className="secondary-button" onClick={requestNotifications}>
          <Bell size={18} />
          {settings.notifications ? "Attive" : "Attiva"}
        </button>
      </section>

      <section className="panel settings-panel">
        <h2>Backup</h2>
        <div className="backup-actions">
          <button className="secondary-button" onClick={downloadBackup}>
            <Download size={18} />
            Esporta JSON
          </button>
          <label className="secondary-button file-button">
            <Upload size={18} />
            Importa JSON
            <input type="file" accept="application/json" onChange={uploadBackup} />
          </label>
        </div>
      </section>
    </div>
  );
}

function BottomNav() {
  const { view, setView } = useSinceStore();
  const activeIndex = view === "settings" ? 1 : 0;
  return (
    <nav className="bottom-nav" style={{ "--active-index": activeIndex }}>
      <span className="nav-indicator" aria-hidden="true" />
      <button className={view === "dashboard" || view === "detail" ? "active" : ""} onClick={() => setView("dashboard")} aria-label="Dashboard">
        <Home size={22} />
      </button>
      <button className={view === "settings" ? "active" : ""} onClick={() => setView("settings")} aria-label="Impostazioni">
        <Settings size={22} />
      </button>
    </nav>
  );
}

function FloatingAction() {
  const { view, setView } = useSinceStore();
  if (view === "editor") return null;
  return (
    <button className="fab" onClick={() => setView("editor")} aria-label="Nuovo contatore">
      <Plus size={26} />
    </button>
  );
}

function toInputDate(value) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 16);
}

function toDateInput(value) {
  const date = new Date(value);
  date.setMinutes(date.getMinutes() - date.getTimezoneOffset());
  return date.toISOString().slice(0, 10);
}

function formatCompactDate(value) {
  return new Intl.DateTimeFormat("it-IT", {
    day: "2-digit",
    month: "short",
    year: "numeric"
  }).format(new Date(`${value}T12:00`));
}

function monthLabel(value) {
  return new Intl.DateTimeFormat("it-IT", {
    month: "long",
    year: "numeric"
  }).format(value);
}

function calendarDays(month) {
  const first = new Date(month.getFullYear(), month.getMonth(), 1);
  const offset = (first.getDay() + 6) % 7;
  const total = new Date(month.getFullYear(), month.getMonth() + 1, 0).getDate();
  const days = Array.from({ length: offset }, () => null);

  for (let day = 1; day <= total; day += 1) {
    days.push(new Date(month.getFullYear(), month.getMonth(), day));
  }

  while (days.length % 7 !== 0) {
    days.push(null);
  }

  return days;
}

function readableInk(hex) {
  const clean = hex.replace("#", "");
  const r = parseInt(clean.slice(0, 2), 16);
  const g = parseInt(clean.slice(2, 4), 16);
  const b = parseInt(clean.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.62 ? "#102016" : "#ffffff";
}

export default App;
