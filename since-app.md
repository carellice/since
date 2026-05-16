# Specifiche di Progetto PWA: "Since"

## 1. Panoramica del Progetto
**Since** è una Progressive Web App (PWA) progettata per funzionare come *habit tracker* "al contrario". L'obiettivo principale è permettere all'utente di monitorare da quanti giorni si è privato di una determinata abitudine o sostanza, incoraggiando il "detox" e la consapevolezza attraverso il tracciamento dei progressi e delle eventuali ricadute.

L'esperienza utente deve risultare identica a quella di un'app nativa sia su mobile che su desktop, garantendo fluidità, responsività e funzionamento offline.

## 2. Stack Tecnologico
*   **Frontend Core:** React JS
*   **UI Framework:** Material Design 3 (Material Expressive via librerie compatibili, es. Material UI v5/v6)
*   **Gestione dello Stato:** Zustand
*   **Persistenza Dati:** Approccio strettamente *Local-First*. Utilizzo di IndexedDB (consigliata libreria come Dexie.js per interfacciamento React).
*   **PWA Features:** Service Workers (per caching e offline mode), Web App Manifest.

## 3. Funzionalità Core (CRUD Contatori)
L'utente deve poter creare e gestire infiniti "contatori". Ogni contatore richiede i seguenti parametri:
*   **Nome dell'abitudine** (es. "Fumo", "Zuccheri", "Social Media").
*   **Icona** (selezionabile da un set di icone Material).
*   **Data e Ora di inizio** (da cui calcolare automaticamente "i giorni da cui...").
*   **Colore** (per personalizzazione visiva nella dashboard).

## 4. Gestione Storico e "Reset"
Quando un utente cede e interrompe la striscia positiva, il contatore non viene semplicemente cancellato, ma "resettato":
*   **Storico dei Record:** Il sistema deve salvare e mostrare il "Record massimo" (es. 45 giorni) per mantenere la motivazione.
*   **Log delle Ricadute (Note):** Al momento del reset, l'utente deve poter inserire una breve nota testuale opzionale per registrare il motivo della ricaduta (es. "Giornata stressante a lavoro").
*   **Cronologia:** Deve essere presente una vista di dettaglio per ogni contatore che mostri lo storico dei tentativi precedenti, le date di inizio/fine e le relative note.

## 5. Gamification e Traguardi
*   **Milestones:** Implementazione di traguardi visivi automatici al raggiungimento di date chiave (es. 3 giorni, 1 settimana, 1 mese, ecc.).
*   **Badge:** Sblocco di badge visivi (es. "Bronzo", "Argento", "Oro") da mostrare nella UI del singolo contatore.
*   **Notifiche Push Locali:** Notifica su dispositivo al raggiungimento del traguardo (sfruttando le API native del browser supportate dalla PWA).

## 6. Funzionalità di Sistema e UX
*   **Offline Mode:** L'app deve potersi avviare istantaneamente e permettere tutte le operazioni (lettura e scrittura dati su IndexedDB) anche senza connessione internet. I Service Workers devono gestire la cache degli asset statici.
*   **Dark Mode:** Supporto nativo per il tema scuro/chiaro, con possibilità di seguire le impostazioni di sistema dell'OS o forzare un tema specifico dalle impostazioni dell'app.
*   **Backup e Ripristino (Import/Export JSON):** Essendo un'app *local-first*, deve essere presente una sezione "Impostazioni" da cui l'utente può scaricare un file `.json` contenente tutto il database locale ed effettuare l'upload dello stesso per ripristinare i dati (utile in caso di cambio dispositivo o svuotamento cache).