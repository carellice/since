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
  Fingerprint,
  Flame,
  Gamepad2,
  Home,
  HeartPulse,
  KeyRound,
  LineChart,
  Lock,
  MessageCircle,
  Monitor,
  Moon,
  Music,
  Pill,
  Pizza,
  Plus,
  RefreshCcw,
  Settings,
  ShieldCheck,
  ShoppingBag,
  Smartphone,
  Sparkles,
  Target,
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
  const { init, ready, settings, view, activeId, counters, updateSetting } = useSinceStore();
  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [unlocked, setUnlocked] = useState(false);
  const [updateRegistration, setUpdateRegistration] = useState(null);
  const lockInitializedRef = useRef(false);
  const lockEnabled = Boolean(settings.securityLock?.enabled);

  useEffect(() => {
    init();
  }, [init]);

  useEffect(() => {
    if (ready && !settings.onboardingCompleted) {
      setOnboardingOpen(true);
    }
  }, [ready, settings.onboardingCompleted]);

  useEffect(() => {
    if (!ready) return;

    if (!lockInitializedRef.current) {
      setUnlocked(!lockEnabled);
      lockInitializedRef.current = true;
      return;
    }

    if (!lockEnabled) {
      setUnlocked(true);
    }
  }, [ready, lockEnabled]);

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

  useEffect(() => {
    function handleUpdateReady(event) {
      setUpdateRegistration(event.detail.registration);
    }

    window.addEventListener("since:update-ready", handleUpdateReady);
    return () => window.removeEventListener("since:update-ready", handleUpdateReady);
  }, []);

  useEffect(() => {
    if (!import.meta.env.DEV) return;
    const params = new URLSearchParams(window.location.search);
    if (!params.has("simulateUpdate")) return;

    setUpdateRegistration({
      waiting: {
        postMessage: () => {
          const url = new URL(window.location.href);
          url.searchParams.delete("simulateUpdate");
          window.location.replace(url);
        }
      }
    });
  }, []);

  function installUpdate() {
    updateRegistration?.waiting?.postMessage({ type: "SKIP_WAITING" });
  }

  const activeCounter = counters.find((counter) => counter.id === activeId) || counters[0];

  if (!ready) {
    return (
      <main className="boot">
        <img src="/logo.png" alt="Since" />
      </main>
    );
  }

  if (lockEnabled && !unlocked) {
    return <LockScreen securityLock={settings.securityLock} onUnlock={() => setUnlocked(true)} />;
  }

  return (
    <main className="app-shell">
      <Sidebar />
      <section className="app-content">
        <div className="page-stage" key={`${view}-${activeId || "root"}`}>
          {view === "dashboard" && <Dashboard />}
          {view === "detail" && activeCounter && <Detail counter={activeCounter} />}
          {view === "settings" && <SettingsView onOpenOnboarding={() => setOnboardingOpen(true)} />}
          {view === "editor" && <Editor />}
        </div>
      </section>
      <BottomNav />
      <FloatingAction />
      {updateRegistration && <UpdatePrompt onUpdate={installUpdate} onDismiss={() => setUpdateRegistration(null)} />}
      {onboardingOpen && (
        <Onboarding
          onClose={async () => {
            await updateSetting("onboardingCompleted", true);
            setOnboardingOpen(false);
          }}
        />
      )}
    </main>
  );
}

function UpdatePrompt({ onUpdate, onDismiss }) {
  return (
    <section className="update-prompt" role="status" aria-live="polite">
      <div>
        <strong>Aggiornamento disponibile</strong>
        <p>Ricarica l'app per usare la nuova versione e aggiornare la cache.</p>
      </div>
      <div className="update-actions">
        <button className="ghost-button" type="button" onClick={onDismiss}>
          Dopo
        </button>
        <button className="primary-button" type="button" onClick={onUpdate}>
          <RefreshCcw size={18} />
          Aggiorna
        </button>
      </div>
    </section>
  );
}

const onboardingSteps = [
  {
    icon: Target,
    title: "Scegli cosa vuoi lasciare alle spalle",
    body: "Since crea un contatore per ogni abitudine o dipendenza che vuoi monitorare: fumo, social, zuccheri, spese impulsive o qualsiasi percorso personale.",
    accent: "#3f7d58"
  },
  {
    icon: CalendarClock,
    title: "Imposta da quando sei in cammino",
    body: "Puoi partire da adesso, da ieri o da una data precisa. L'app tiene il conto dei giorni, delle ore e del progresso verso il prossimo traguardo.",
    accent: "#5378a7"
  },
  {
    icon: Trophy,
    title: "Leggi i progressi senza giudicarti",
    body: "Ogni percorso mostra record, badge e milestone. Se capita una ricaduta, fai reset: Since salva il tentativo concluso e ti lascia ripartire con chiarezza.",
    accent: "#bc5f45"
  },
  {
    icon: LineChart,
    title: "I tuoi dati restano con te",
    body: "Since è local-first: conserva i dati sul dispositivo, permette backup JSON e ti lascia personalizzare tema, colore e notifiche dalle impostazioni.",
    accent: "#2f8f8a"
  }
];

function Onboarding({ onClose }) {
  const [step, setStep] = useState(0);
  const [direction, setDirection] = useState(1);
  const current = onboardingSteps[step];
  const Icon = current.icon;
  const isLast = step === onboardingSteps.length - 1;

  function nextStep() {
    if (isLast) {
      onClose();
      return;
    }
    setDirection(1);
    setStep((value) => value + 1);
  }

  function previousStep() {
    setDirection(-1);
    setStep((value) => Math.max(0, value - 1));
  }

  function goToStep(index) {
    if (index === step) return;
    setDirection(index > step ? 1 : -1);
    setStep(index);
  }

  return createPortal(
    <div className="onboarding-overlay" role="presentation">
      <section
        className="onboarding-sheet"
        role="dialog"
        aria-modal="true"
        aria-labelledby="onboarding-title"
        style={{
          "--onboarding-accent": current.accent,
          "--step-direction": direction,
          "--step-offset": `${direction * 34}px`,
          "--copy-offset": `${direction * 22}px`,
          "--icon-rotate": `${direction * -10}deg`,
          "--mini-offset": `${direction * 22}px`,
          "--progress-offset": `${direction * -18}px`,
          "--onboarding-progress": `${((step + 1) / onboardingSteps.length) * 100}%`
        }}
      >
        <button className="icon-button onboarding-close" type="button" onClick={onClose} aria-label="Chiudi onboarding">
          <X size={20} />
        </button>

        <div className="onboarding-brand">
          <img src="/logo.png" alt="" />
          <span>Since</span>
        </div>

        <div className="onboarding-visual" aria-hidden="true" key={`visual-${step}`}>
          <span className="onboarding-orbit one" />
          <span className="onboarding-orbit two" />
          <span className="onboarding-icon">
            <Icon size={38} />
          </span>
          <div className="onboarding-mini-card">
            <strong>{step === 0 ? "0" : step === 1 ? "1" : step === 2 ? "7" : "30"}</strong>
            <span>giorni</span>
          </div>
          <div className="onboarding-progress-card">
            <span />
            <strong>{step + 1}/{onboardingSteps.length}</strong>
          </div>
        </div>

        <div className="onboarding-copy" key={`copy-${step}`}>
          <p className="eyebrow">Primo avvio</p>
          <h1 id="onboarding-title">{current.title}</h1>
          <p>{current.body}</p>
        </div>

        <div className="onboarding-dots" aria-label={`Passaggio ${step + 1} di ${onboardingSteps.length}`}>
          {onboardingSteps.map((item, index) => (
            <button
              key={item.title}
              type="button"
              className={index === step ? "active" : ""}
              onClick={() => goToStep(index)}
              aria-label={`Vai al passaggio ${index + 1}`}
            />
          ))}
        </div>

        <div className="onboarding-actions">
          <button className="ghost-button" type="button" onClick={step === 0 ? onClose : previousStep}>
            {step === 0 ? (
              "Salta"
            ) : (
              <>
                <ChevronLeft size={18} />
                Indietro
              </>
            )}
          </button>
          <button className="primary-button" type="button" onClick={nextStep}>
            {isLast ? "Inizia" : "Avanti"}
            {!isLast && <ChevronRight size={18} />}
          </button>
        </div>
      </section>
    </div>,
    document.body
  );
}

function LockScreen({ securityLock, onUnlock }) {
  const [pin, setPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const [biometricPrompting, setBiometricPrompting] = useState(false);
  const biometricAttemptedRef = useRef(false);
  const pinLength = securityLock?.pinLength || 4;
  const biometricReady = Boolean(securityLock?.biometricEnabled && securityLock?.biometricCredentialId && canUseWebAuthn());

  useEffect(() => {
    if (!biometricReady || biometricAttemptedRef.current) return;
    biometricAttemptedRef.current = true;
    unlockWithBiometric();
  }, [biometricReady]);

  useEffect(() => {
    function handleKeyDown(event) {
      if (event.metaKey || event.ctrlKey || event.altKey) return;
      if (/^\d$/.test(event.key)) {
        event.preventDefault();
        pressDigit(event.key);
      }
      if (event.key === "Backspace" || event.key === "Delete") {
        event.preventDefault();
        deleteDigit();
      }
    }

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  });

  async function unlockWithPin(nextPin = pin) {
    if (!nextPin) return;

    setBusy(true);
    setError("");
    const valid = await verifyPin(nextPin, securityLock);
    setBusy(false);

    if (valid) {
      setPin("");
      onUnlock();
      return;
    }

    setError("PIN non corretto.");
    setPin("");
  }

  function pressDigit(digit) {
    if (busy || pin.length >= 8) return;
    setError("");
    const nextPin = `${pin}${digit}`;
    setPin(nextPin);
    if (nextPin.length >= pinLength) {
      window.setTimeout(() => unlockWithPin(nextPin), 80);
    }
  }

  function deleteDigit() {
    if (busy) return;
    setError("");
    setPin((value) => value.slice(0, -1));
  }

  async function unlockWithBiometric() {
    setBusy(true);
    setBiometricPrompting(true);
    setError("");
    try {
      await authenticateWithBiometric(securityLock.biometricCredentialId);
      onUnlock();
    } catch {
      setError("Autenticazione biometrica non riuscita. Puoi usare il PIN.");
    } finally {
      setBusy(false);
      setBiometricPrompting(false);
    }
  }

  return (
    <main className="lock-shell">
      <section className="lock-card" aria-labelledby="lock-title">
        <img src="/logo.png" alt="" />
        <div className="lock-copy">
          <p className="eyebrow">Accesso protetto</p>
          <h1 id="lock-title">Sblocca Since</h1>
          <p>I tuoi percorsi restano nascosti finché non confermi il PIN.</p>
        </div>

        <div className="lock-pin-area" aria-label="Inserisci PIN">
          {biometricPrompting && <p className="settings-note center">Conferma con biometria per sbloccare.</p>}
          <div className="pin-dots" aria-label={`${pin.length} cifre inserite`}>
            {Array.from({ length: pinLength }).map((_, index) => (
              <span key={index} className={index < pin.length ? "filled" : ""} />
            ))}
          </div>
          {error && <p className="form-error">{error}</p>}
          <div className="pin-keypad">
            {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((digit) => (
              <button key={digit} type="button" onClick={() => pressDigit(digit)} disabled={busy} aria-label={`Numero ${digit}`}>
                {digit}
              </button>
            ))}
            <span />
            <button type="button" onClick={() => pressDigit(0)} disabled={busy} aria-label="Numero 0">
              0
            </button>
            <button type="button" onClick={deleteDigit} disabled={busy || pin.length === 0} aria-label="Cancella">
              <ChevronLeft size={24} />
            </button>
          </div>
        </div>

        {biometricReady && (
          <button className="secondary-button full" type="button" onClick={unlockWithBiometric} disabled={busy}>
            <Fingerprint size={18} />
            Usa biometria
          </button>
        )}
      </section>
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
  const longestCounter = counters.reduce((longest, counter) => {
    const days = daysBetween(counter.startedAt, now);
    if (!longest || days > longest.days) return { ...counter, days };
    return longest;
  }, null);
  const nextGoal = counters
    .map((counter) => {
      const days = daysBetween(counter.startedAt, now);
      const next = nextMilestone(days);
      return { counter, missing: Math.max(0, next.days - days), label: next.label };
    })
    .sort((a, b) => a.missing - b.missing)[0];

  return (
    <div className="screen">
      <header className="topbar">
        <div>
          <p className="eyebrow">Today</p>
          <h1>Since</h1>
        </div>
      </header>

      <section className="summary-band">
        <SummaryMetric icon={Flame} label="Giorni puliti" value={totalDays} note={counters.length ? "Totale dei percorsi attivi" : "Crea il primo percorso"} tone="#3f7d58" />
        <SummaryMetric
          icon={Target}
          label="Percorsi"
          value={counters.length}
          note={nextGoal ? `${nextGoal.missing}g a ${nextGoal.label}` : "Nessun traguardo in corso"}
          tone="#5378a7"
        />
        <SummaryMetric icon={Trophy} label="Record" value={best} note={longestCounter ? `${longestCounter.name}: ${longestCounter.days}g` : "Il tuo miglior streak"} tone="#bc5f45" />
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

function SummaryMetric({ icon: Icon, label, value, note, tone }) {
  return (
    <article className="summary-metric" style={{ "--metric-tone": tone, "--metric-ink": readableInk(tone) }}>
      <div className="summary-metric-head">
        <span className="summary-icon">
          <Icon size={18} />
        </span>
        <span>{label}</span>
      </div>
      <strong>{value}</strong>
      <p>{note}</p>
    </article>
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
  const sheet = useBottomSheetDismiss(onCancel);

  return createPortal(
    <div className={`picker-overlay ${sheet.closing ? "sheet-closing" : ""}`} role="presentation" onClick={sheet.requestClose}>
      <section
        className={`confirm-sheet ${sheet.entered ? "sheet-entered" : ""} ${sheet.dragging ? "sheet-dragging" : ""} ${sheet.closing ? "sheet-closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={title}
        ref={sheet.sheetRef}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" {...sheet.dragHandleProps} />
        <div className="confirm-icon">
          <X size={24} />
        </div>
        <div className="confirm-copy">
          <h2>{title}</h2>
          <p>{body}</p>
        </div>
        <div className="confirm-actions">
          <button className="secondary-button" type="button" onClick={sheet.requestClose}>
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

function useBottomSheetDismiss(onClose) {
  const [closing, setClosing] = useState(false);
  const [dragging, setDragging] = useState(false);
  const [entered, setEntered] = useState(false);
  const sheetRef = useRef(null);
  const closeRef = useRef(onClose);
  const startYRef = useRef(0);
  const dragYRef = useRef(0);
  const lastYRef = useRef(0);
  const lastTimeRef = useRef(0);
  const velocityRef = useRef(0);
  const activeRef = useRef(false);
  const closingRef = useRef(false);

  useEffect(() => {
    closeRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const id = window.setTimeout(() => setEntered(true), 440);
    return () => window.clearTimeout(id);
  }, []);

  function requestClose() {
    if (closingRef.current) return;
    closingRef.current = true;
    setClosing(true);
    window.setTimeout(() => closeRef.current(), 320);
  }

  function stopDragListeners() {
    window.removeEventListener("pointermove", handlePointerMove);
    window.removeEventListener("pointerup", handlePointerUp);
    window.removeEventListener("pointercancel", handlePointerUp);
  }

  function setSheetDrag(value) {
    dragYRef.current = value;
    sheetRef.current?.style.setProperty("--sheet-drag", `${value}px`);
  }

  function handlePointerMove(event) {
    if (!activeRef.current) return;
    event.preventDefault();
    const nextY = Math.max(0, event.clientY - startYRef.current);
    const now = performance.now();
    velocityRef.current = (nextY - lastYRef.current) / Math.max(1, now - lastTimeRef.current);
    lastYRef.current = nextY;
    lastTimeRef.current = now;
    setSheetDrag(nextY);
  }

  function handlePointerUp() {
    if (!activeRef.current) return;
    activeRef.current = false;
    stopDragListeners();
    setDragging(false);

    if (dragYRef.current > 120 || (dragYRef.current > 42 && velocityRef.current > 1.15)) {
      requestClose();
      return;
    }

    dragYRef.current = 0;
    velocityRef.current = 0;
    sheetRef.current?.style.setProperty("--sheet-drag", "0px");
  }

  function startDrag(event) {
    if (closingRef.current || event.pointerType === "mouse" && event.button !== 0) return;
    event.preventDefault();
    activeRef.current = true;
    setEntered(true);
    startYRef.current = event.clientY;
    dragYRef.current = 0;
    lastYRef.current = 0;
    lastTimeRef.current = performance.now();
    velocityRef.current = 0;
    setDragging(true);
    event.currentTarget.setPointerCapture?.(event.pointerId);
    window.addEventListener("pointermove", handlePointerMove);
    window.addEventListener("pointerup", handlePointerUp);
    window.addEventListener("pointercancel", handlePointerUp);
  }

  useEffect(
    () => () => {
      stopDragListeners();
    },
    []
  );

  return {
    closing,
    dragging,
    entered,
    requestClose,
    sheetRef,
    dragHandleProps: {
      onPointerDown: startDrag,
      role: "button",
      "aria-label": "Trascina verso il basso per chiudere",
      tabIndex: 0
    }
  };
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
  const sheet = useBottomSheetDismiss(onClose);

  function updateDate(date) {
    onChange(`${toDateInput(date)}T${selectedTime}`);
    sheet.requestClose();
  }

  function updateTime(hours, minutes) {
    const nextHours = String((hours + 24) % 24).padStart(2, "0");
    const nextMinutes = String((minutes + 60) % 60).padStart(2, "0");
    onChange(`${selectedDate}T${nextHours}:${nextMinutes}`);
  }

  const hours = Number(selectedTime.slice(0, 2));
  const minutes = Number(selectedTime.slice(3, 5));

  return createPortal(
    <div className={`picker-overlay ${sheet.closing ? "sheet-closing" : ""}`} role="presentation" onClick={sheet.requestClose}>
      <section
        className={`picker-sheet ${sheet.entered ? "sheet-entered" : ""} ${sheet.dragging ? "sheet-dragging" : ""} ${sheet.closing ? "sheet-closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-label={mode === "date" ? "Seleziona data" : "Seleziona ora"}
        ref={sheet.sheetRef}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" {...sheet.dragHandleProps} />
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
            <button type="button" className="primary-button full" onClick={sheet.requestClose}>
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

function SettingsView({ onOpenOnboarding }) {
  const { settings, updateSetting, exportData, importData } = useSinceStore();
  const themeIndex = ["system", "light", "dark"].indexOf(settings.theme);
  const securityLock = normalizeSecurityLock(settings.securityLock);
  const [pinSheet, setPinSheet] = useState(null);
  const [biometricSupported, setBiometricSupported] = useState(false);
  const [securityMessage, setSecurityMessage] = useState("");
  const [securityBusy, setSecurityBusy] = useState(false);

  useEffect(() => {
    checkBiometricSupport().then(setBiometricSupported);
  }, []);

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

  async function saveSecurityLock(nextLock) {
    await updateSetting("securityLock", normalizeSecurityLock(nextLock));
  }

  async function enablePin(pin) {
    const pinRecord = await createPinRecord(pin);
    await saveSecurityLock({ ...securityLock, ...pinRecord, enabled: true });
    setSecurityMessage("Blocco con PIN attivato.");
  }

  async function changePin(pin) {
    const pinRecord = await createPinRecord(pin);
    await saveSecurityLock({ ...securityLock, ...pinRecord, enabled: true });
    setSecurityMessage("PIN aggiornato.");
  }

  async function disableLock() {
    await saveSecurityLock({
      enabled: false,
      pinHash: null,
      pinSalt: null,
      pinLength: null,
      biometricEnabled: false,
      biometricCredentialId: null,
      biometricUserId: null
    });
    setSecurityMessage("Blocco disattivato.");
  }

  async function enableBiometric() {
    setSecurityBusy(true);
    setSecurityMessage("");
    try {
      const credential = await registerBiometricCredential();
      await saveSecurityLock({
        ...securityLock,
        biometricEnabled: true,
        biometricCredentialId: credential.credentialId,
        biometricUserId: credential.userId
      });
      setSecurityMessage("Biometria attivata su questo dispositivo.");
    } catch {
      setSecurityMessage("Biometria non disponibile o registrazione annullata.");
    } finally {
      setSecurityBusy(false);
    }
  }

  async function disableBiometric() {
    await saveSecurityLock({
      ...securityLock,
      biometricEnabled: false,
      biometricCredentialId: null,
      biometricUserId: null
    });
    setSecurityMessage("Biometria disattivata.");
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
        <div className="settings-panel-head">
          <div>
            <h2>Privacy</h2>
            <p>{securityLock.enabled ? "PIN richiesto all'apertura dell'app." : "Proteggi l'accesso ai tuoi percorsi."}</p>
          </div>
          <span className={securityLock.enabled ? "status-pill enabled" : "status-pill"}>
            {securityLock.enabled ? "Attivo" : "Non attivo"}
          </span>
        </div>
        <div className="security-actions">
          {securityLock.enabled ? (
            <>
              <button className="secondary-button" onClick={() => setPinSheet("change")}>
                <KeyRound size={18} />
                Cambia PIN
              </button>
              <button className="ghost-button danger" onClick={() => setPinSheet("disable")}>
                <Lock size={18} />
                Disattiva blocco
              </button>
            </>
          ) : (
            <button className="secondary-button" onClick={() => setPinSheet("enable")}>
              <ShieldCheck size={18} />
              Attiva PIN
            </button>
          )}
          {securityLock.enabled && biometricSupported && (
            <button className="secondary-button" onClick={securityLock.biometricEnabled ? disableBiometric : enableBiometric} disabled={securityBusy}>
              <Fingerprint size={18} />
              {securityLock.biometricEnabled ? "Disattiva biometria" : "Attiva biometria"}
            </button>
          )}
        </div>
        {securityLock.enabled && !biometricSupported && <p className="settings-note">Biometria non disponibile in questo browser o dispositivo.</p>}
        {securityMessage && <p className="settings-note">{securityMessage}</p>}
      </section>

      <section className="panel settings-panel">
        <h2>Guida iniziale</h2>
        <button className="secondary-button" onClick={onOpenOnboarding}>
          <Sparkles size={18} />
          Rivedi onboarding
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

      {pinSheet && (
        <PinLockSheet
          mode={pinSheet}
          securityLock={securityLock}
          onClose={() => setPinSheet(null)}
          onEnable={enablePin}
          onChange={changePin}
          onDisable={disableLock}
        />
      )}
    </div>
  );
}

function PinLockSheet({ mode, securityLock, onClose, onEnable, onChange, onDisable }) {
  const [currentPin, setCurrentPin] = useState("");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  const sheet = useBottomSheetDismiss(onClose);
  const needsCurrentPin = mode === "change" || mode === "disable";
  const needsNewPin = mode === "enable" || mode === "change";
  const title = mode === "enable" ? "Attiva PIN" : mode === "change" ? "Cambia PIN" : "Disattiva blocco";

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    setError("");

    if (needsCurrentPin) {
      const currentIsValid = await verifyPin(currentPin, securityLock);
      if (!currentIsValid) {
        setError("Il PIN attuale non è corretto.");
        setBusy(false);
        return;
      }
    }

    if (needsNewPin) {
      if (pin.length < 4) {
        setError("Scegli un PIN di almeno 4 cifre.");
        setBusy(false);
        return;
      }

      if (pin !== confirmPin) {
        setError("I PIN inseriti non coincidono.");
        setBusy(false);
        return;
      }
    }

    try {
      if (mode === "enable") await onEnable(pin);
      if (mode === "change") await onChange(pin);
      if (mode === "disable") await onDisable();
      sheet.requestClose();
    } catch {
      setError("Non sono riuscito ad aggiornare il blocco. Riprova.");
    } finally {
      setBusy(false);
    }
  }

  return createPortal(
    <div className={`picker-overlay ${sheet.closing ? "sheet-closing" : ""}`} role="presentation" onClick={sheet.requestClose}>
      <section
        className={`pin-sheet ${sheet.entered ? "sheet-entered" : ""} ${sheet.dragging ? "sheet-dragging" : ""} ${sheet.closing ? "sheet-closing" : ""}`}
        role="dialog"
        aria-modal="true"
        aria-labelledby="pin-sheet-title"
        ref={sheet.sheetRef}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="sheet-handle" {...sheet.dragHandleProps} />
        <div className="pin-sheet-icon">
          <Lock size={24} />
        </div>
        <div className="confirm-copy">
          <h2 id="pin-sheet-title">{title}</h2>
          <p>{mode === "disable" ? "Inserisci il PIN attuale per rimuovere la protezione." : "Usa da 4 a 8 cifre. Ti servirà all'apertura dell'app."}</p>
        </div>

        <form className="pin-form" onSubmit={submit}>
          {needsCurrentPin && (
            <label>
              PIN attuale
              <input
                value={currentPin}
                onChange={(event) => setCurrentPin(onlyPinDigits(event.target.value))}
                inputMode="numeric"
                type="password"
                autoComplete="current-password"
                maxLength={8}
              />
            </label>
          )}
          {needsNewPin && (
            <>
              <label>
                Nuovo PIN
                <input
                  value={pin}
                  onChange={(event) => setPin(onlyPinDigits(event.target.value))}
                  inputMode="numeric"
                  type="password"
                  autoComplete="new-password"
                  minLength={4}
                  maxLength={8}
                />
              </label>
              <label>
                Conferma PIN
                <input
                  value={confirmPin}
                  onChange={(event) => setConfirmPin(onlyPinDigits(event.target.value))}
                  inputMode="numeric"
                  type="password"
                  autoComplete="new-password"
                  minLength={4}
                  maxLength={8}
                />
              </label>
            </>
          )}
          {error && <p className="form-error">{error}</p>}
          <div className="confirm-actions">
            <button className="secondary-button" type="button" onClick={sheet.requestClose}>
              Annulla
            </button>
            <button className={mode === "disable" ? "primary-button danger-button" : "primary-button"} type="submit" disabled={busy}>
              {mode === "disable" ? "Disattiva" : "Salva"}
            </button>
          </div>
        </form>
      </section>
    </div>,
    document.body
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

function normalizeSecurityLock(lock = {}) {
  return {
    enabled: Boolean(lock.enabled),
    pinHash: lock.pinHash || null,
    pinSalt: lock.pinSalt || null,
    pinLength: lock.pinLength || null,
    biometricEnabled: Boolean(lock.biometricEnabled),
    biometricCredentialId: lock.biometricCredentialId || null,
    biometricUserId: lock.biometricUserId || null
  };
}

function onlyPinDigits(value) {
  return value.replace(/\D/g, "").slice(0, 8);
}

async function createPinRecord(pin) {
  const salt = randomBase64Url(16);
  return {
    pinSalt: salt,
    pinHash: await hashPin(pin, salt),
    pinLength: pin.length
  };
}

async function verifyPin(pin, lock) {
  if (!lock?.pinHash || !lock?.pinSalt) return false;
  return (await hashPin(pin, lock.pinSalt)) === lock.pinHash;
}

async function hashPin(pin, salt) {
  const data = new TextEncoder().encode(`${salt}:${pin}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return bufferToBase64Url(digest);
}

function canUseWebAuthn() {
  return Boolean(window.isSecureContext && window.PublicKeyCredential && navigator.credentials);
}

async function checkBiometricSupport() {
  if (!canUseWebAuthn() || !PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable) return false;
  try {
    return await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
  } catch {
    return false;
  }
}

async function registerBiometricCredential() {
  if (!(await checkBiometricSupport())) throw new Error("Biometric authentication is not available.");

  const userId = crypto.getRandomValues(new Uint8Array(16));
  const credential = await navigator.credentials.create({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      rp: { name: "Since" },
      user: {
        id: userId,
        name: "since-local-user",
        displayName: "Since"
      },
      pubKeyCredParams: [
        { type: "public-key", alg: -7 },
        { type: "public-key", alg: -257 }
      ],
      authenticatorSelection: {
        authenticatorAttachment: "platform",
        residentKey: "preferred",
        userVerification: "required"
      },
      timeout: 60000,
      attestation: "none"
    }
  });

  return {
    credentialId: bufferToBase64Url(credential.rawId),
    userId: bufferToBase64Url(userId)
  };
}

async function authenticateWithBiometric(credentialId) {
  if (!credentialId || !canUseWebAuthn()) throw new Error("Biometric authentication is not available.");

  return navigator.credentials.get({
    publicKey: {
      challenge: crypto.getRandomValues(new Uint8Array(32)),
      allowCredentials: [
        {
          type: "public-key",
          id: base64UrlToBuffer(credentialId)
        }
      ],
      userVerification: "required",
      timeout: 60000
    }
  });
}

function randomBase64Url(length) {
  return bufferToBase64Url(crypto.getRandomValues(new Uint8Array(length)));
}

function bufferToBase64Url(buffer) {
  const bytes = buffer instanceof Uint8Array ? buffer : new Uint8Array(buffer);
  let value = "";
  bytes.forEach((byte) => {
    value += String.fromCharCode(byte);
  });
  return btoa(value).replace(/\+/g, "-").replace(/\//g, "_").replace(/=+$/g, "");
}

function base64UrlToBuffer(value) {
  const base64 = value.replace(/-/g, "+").replace(/_/g, "/").padEnd(Math.ceil(value.length / 4) * 4, "=");
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let index = 0; index < binary.length; index += 1) {
    bytes[index] = binary.charCodeAt(index);
  }
  return bytes;
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
