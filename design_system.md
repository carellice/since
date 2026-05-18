# Since Design System

Linee guida per creare app con una grafica coerente con Since: sobria, mobile-first, local-first, personale e molto tattile.

## Identità

Since deve sembrare un'app nativa moderna, non una landing page. L'interfaccia è calma, compatta e centrata sull'azione quotidiana. Usa superfici morbide, ombre controllate, colori naturali e animazioni fisiche ma non spettacolari.

Principi:

- Priorità ai dati e alle azioni principali.
- Layout densi ma respirati.
- Componenti grandi quanto basta per touch, mai decorativi senza funzione.
- Motion fluida e intenzionale: entra/esce da una direzione reale.
- Copy breve, concreto, non motivazionale.

## Palette

Token principali:

```css
--bg: #f7f1e9;
--surface: rgba(255, 252, 246, 0.9);
--surface-strong: #fffaf2;
--text: #1d211d;
--muted: #667067;
--line: rgba(43, 52, 42, 0.12);
--primary: #2f6d54;
--primary-ink: #ffffff;
--danger: #a63f3b;
```

Tema scuro:

```css
--bg: #151814;
--surface: rgba(31, 36, 31, 0.9);
--surface-strong: #242b25;
--text: #f2f1ec;
--muted: #adb8ad;
--line: rgba(240, 244, 236, 0.13);
--primary: #8fc4a5;
--primary-ink: #102016;
```

Accenti consigliati:

```css
#2f6d54
#2f8f8a
#5378a7
#5f73d9
#9a6fb0
#b84a62
#bc5f45
#cc8b2c
```

Regole:

- Usare `primary` per azioni principali, selezioni attive e stato positivo.
- Usare `danger` solo per azioni distruttive.
- Evitare palette monocromatiche: ogni schermata può avere un colore dominante, ma non deve diventare tutta dello stesso tono.
- Quando un colore diventa sfondo di icona o bottone, calcolare sempre un colore testo leggibile.

## Tipografia

Font stack:

```css
Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif
```

Scala indicativa:

- Titolo pagina desktop: `clamp(2rem, 5vw, 4.8rem)`, line-height `0.96`.
- Titolo pagina mobile: circa `2.55rem`.
- Titolo card: `1.2rem - 1.45rem`.
- Label uppercase: `0.73rem - 0.82rem`, font-weight `800-900`.
- Testo secondario: `0.86rem - 1rem`, colore `muted`.

Regole:

- Letter spacing `0`.
- Usare uppercase solo per eyebrow, label e micro-stati.
- Non usare hero type dentro pannelli compatti.
- Numeri importanti possono essere molto grandi, ma devono essere accompagnati da label breve.

## Layout

Desktop:

- Shell a due colonne: sidebar fissa `248px` + contenuto centrale.
- Contenuto: `width: min(100%, 1120px)`, padding `30px 32px 44px`.
- Sidebar sticky, full height, blur e bordo destro.

Mobile:

- Sidebar nascosta.
- Bottom navigation fissa.
- FAB per azione primaria.
- Padding contenuto: `max(18px, env(safe-area-inset-top)) 16px 112px`.
- Le esperienze principali devono entrare bene nel viewport, soprattutto lock screen e onboarding.

Spacing:

- Gap schermata: `22px`.
- Gap card/grid: `10px - 16px`.
- Padding pannelli: `16px - 22px`.
- Radius principale: `24px`.
- Card compatte: `18px - 20px`.
- Icon tile: `11px - 18px`.

## Superfici

Superfici base:

```css
background: var(--surface-strong);
box-shadow: inset 0 0 0 1px var(--line), var(--shadow);
border-radius: var(--radius);
```

Ombra:

```css
--shadow: 0 20px 60px rgba(37, 42, 34, 0.13);
```

Regole:

- Usare card solo per elementi ripetuti, strumenti, pannelli e modali.
- Non annidare card dentro card.
- Evitare sezioni decorative tipo marketing.
- Usare `color-mix()` per accenti leggeri, non gradienti forti.

## Navigazione

Sidebar desktop:

- Brand con logo `44px`.
- Voci nav alte `48px`, radius `16px`.
- Stato attivo: sfondo `primary`, testo `primary-ink`.

Bottom nav mobile:

- Posizione fixed.
- Due o tre azioni massimo.
- Indicatore animato sotto la voce attiva.
- Altezza circa `70px`, radius `28px`, blur e ombra.

FAB:

- `62px`, radius `22px`.
- Fixed in basso a destra.
- Solo per azione primaria globale.

## Bottoni

Primary:

```css
min-height: 46px;
border-radius: 999px;
background: var(--primary);
color: var(--primary-ink);
font-weight: 850;
```

Secondary:

```css
background: color-mix(in srgb, var(--primary) 13%, var(--surface-strong));
box-shadow: inset 0 0 0 1px var(--line);
```

Ghost:

```css
background: transparent;
color: var(--text);
```

Icon button:

```css
width: 46px;
height: 46px;
border-radius: 50%;
background: var(--surface-strong);
box-shadow: inset 0 0 0 1px var(--line);
```

Regole:

- Usare icone Lucide dove possibile.
- Azioni distruttive: testo `danger`, o bottone `danger-button`.
- Effetto active: `transform: scale(0.96)`.

## Metriche Home

Le metriche in alto devono essere compatte.

Desktop:

- Tre card in riga.
- Altezza circa `108px`.
- Icona piccola, label uppercase, numero grande, nota breve.

Mobile:

- Tre card in riga.
- Altezza circa `104px`.
- Nascondere note secondarie per non occupare spazio.
- Evitare overflow testuale: label corte.

Pattern:

```css
.summary-metric {
  min-height: 108px;
  padding: 16px;
  border-radius: 20px;
}
```

## Form

Input:

```css
min-height: 52px;
padding: 0 15px;
border: 1px solid var(--line);
border-radius: 16px;
background: color-mix(in srgb, var(--surface-strong) 78%, var(--bg));
```

Focus:

```css
border-color: var(--primary);
box-shadow: 0 0 0 4px color-mix(in srgb, var(--primary) 16%, transparent);
```

Regole:

- Campi numerici sensibili, come PIN, devono usare `inputMode="numeric"`.
- Per lock screen preferire tastierino custom rispetto a input classico.

## Bottom Sheet

I bottom sheet devono comportarsi come componenti nativi.

Regole:

- Entrano da sotto lo schermo: `translate3d(0, calc(100% + 40px), 0)`.
- Escono tornando sotto lo schermo.
- Drag solo dalla maniglia superiore.
- Durante il drag il foglio deve seguire il dito 1:1.
- Piccolo drag: torna su.
- Drag deciso o flick intenzionale: chiude.
- Overlay con blur leggero e fade.

Handle:

```css
.sheet-handle {
  width: 58px;
  height: 18px;
  touch-action: none;
  cursor: grab;
}
```

## Onboarding

Desktop:

- Dialog centrato.
- Non deve scrollare internamente.
- Dimensioni adattive in base all'altezza viewport.

Mobile:

- Full-screen.
- Niente bordo da modal.
- Deve sembrare una prima schermata nativa.

Motion:

- Step avanti: visual/copy entrano da destra.
- Step indietro: entrano da sinistra.
- Icona con micro-spring.
- Mini card e progress card con animazione separata.
- Dots con transizione morbida.

Elementi:

- Brand in alto.
- Visual card.
- Icona principale.
- Card “giorni”.
- Progress card `1/4`.
- Copy breve.
- Dots.
- Azioni `Indietro/Avanti` o `Salta/Inizia`.

## Lock Screen

La schermata di sblocco deve entrare tutta nel viewport desktop e mobile.

Componenti:

- Logo centrato.
- Titolo `Sblocca Since`.
- Dots PIN pari alla lunghezza reale del PIN.
- Tastierino numerico circolare.
- Backspace.
- Supporto tastiera fisica desktop.
- Biometria automatica se attiva, fallback PIN manuale.

Regole:

- No scroll verticale in desktop.
- Tastierino dimensionato con `dvh`.
- Non mostrare banner update o contenuti dietro il lock screen.

## Motion

Curve:

```css
--motion-snap: cubic-bezier(0.2, 0.9, 0.2, 1);
--motion-smooth: cubic-bezier(0.22, 1, 0.36, 1);
```

Durate:

- Page transition: `420ms`.
- Card rise: `460ms - 520ms`.
- Bottom sheet in: `440ms`.
- Bottom sheet out: `280ms`.
- Button active: `160ms - 180ms`.

Regole:

- Le animazioni devono indicare provenienza o stato.
- Evitare fade isolati quando un movimento spaziale è più chiaro.
- Rispettare `prefers-reduced-motion`.

## PWA E Aggiornamenti

Service worker:

- `index.html` e navigazioni network-first.
- Asset fingerprintati cache-first.
- `sw.js` e `sw-version.js` sempre network-first.
- Cache versionata per build.
- Banner update quando `registration.waiting` è disponibile.
- Pulsante `Aggiorna` manda `SKIP_WAITING` e ricarica su `controllerchange`.

Netlify headers:

```txt
/
  Cache-Control: no-cache, no-store, must-revalidate

/index.html
  Cache-Control: no-cache, no-store, must-revalidate

/sw.js
  Cache-Control: no-cache, no-store, must-revalidate

/sw-version.js
  Cache-Control: no-cache, no-store, must-revalidate

/assets/*
  Cache-Control: public, max-age=31536000, immutable
```

## Copy

Tono:

- Diretto.
- Calmo.
- Non giudicante.
- Utile, non celebrativo.

Esempi:

- “Proteggi l'accesso ai tuoi percorsi.”
- “PIN richiesto all'apertura dell'app.”
- “Ricarica l'app per usare la nuova versione e aggiornare la cache.”
- “Quando farai un reset, qui compariranno durata, date e nota del tentativo concluso.”

Evitare:

- Frasi motivazionali generiche.
- Testi lunghi dentro card compatte.
- Spiegazioni di funzionalità visibili direttamente in UI.

## Checklist Nuova Schermata

Prima di considerare finita una schermata:

- Funziona su mobile e desktop.
- Nessun overflow orizzontale.
- Nessun testo tagliato nei bottoni.
- Stati vuoti presenti.
- Stato dark verificato.
- Touch target almeno `44px`.
- Motion coerente con direzione dell'azione.
- Se usa dati locali, non rompe import/export.
- Se è PWA-critical, non blocca update/cache.

