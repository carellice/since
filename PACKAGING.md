# Packaging Since

Questa app resta una Vite/PWA, ma ora puo essere impacchettata anche come app installabile:

- Desktop macOS: Electron + electron-builder genera `.dmg` e `.zip`.
- Desktop Windows: Electron + electron-builder genera installer `.exe` NSIS.
- Android: Capacitor genera un progetto Android nativo e poi un `.apk`.

Fonti ufficiali utili:

- Capacitor: https://capacitorjs.com/docs
- Capacitor setup: https://capacitorjs.com/
- Electron packaging: https://www.electronjs.org/docs/latest/tutorial/tutorial-packaging
- electron-builder CLI: https://www.electron.build/cli
- electron-builder config: https://www.electron.build/configuration.html

## Prerequisiti

Per tutto:

1. Node.js recente.
2. Dipendenze installate:

```bash
npm install
```

Per macOS `.dmg`:

1. macOS.
2. Xcode Command Line Tools:

```bash
xcode-select --install
```

Per Windows `.exe`:

1. Consigliato: compilare su Windows, oppure usare una GitHub Action Windows.
2. Da macOS electron-builder puo generare target Windows in alcuni casi, ma firma e compatibilita sono piu affidabili su Windows.

Per Android `.apk`:

1. Android Studio installato.
2. Android SDK installato tramite Android Studio.
3. JDK configurato. Android Studio di solito include gia un JDK adatto.
4. Primo avvio di Android Studio completato almeno una volta, cosi Gradle/SDK sono configurati.

## Comandi comuni

Installa o aggiorna le dipendenze:

```bash
npm install
```

Build web normale, utile per verificare che l'app React compili:

```bash
npm run build
```

Pulisci gli installer generati, cosi puoi rigenerarli da zero:

```bash
npm run package:clean
```

Il comando rimuove `release/` e `dist-electron/`. Non tocca `src/`, `public/`, `electron/`, `android/`, `package.json` o altre configurazioni.

## macOS

Genera `.dmg` e `.zip` per macOS:

```bash
npm run package:mac
```

Output atteso: `release/desktop/Since-<version>-mac-<arch>.dmg`.

Il `.dmg` locale usa firma ad-hoc: va bene per test e installazioni manuali. Per distribuire a utenti finali serve firma Apple Developer e notarizzazione.

## Windows

Genera installer `.exe` NSIS per Windows:

```bash
npm run package:win
```

Output atteso: `release/desktop/Since-<version>-win-x64.exe`.

Consiglio pratico: per un `.exe` affidabile compila su Windows o in una GitHub Action Windows. Da macOS puo funzionare, ma firma e compatibilita sono piu semplici su Windows.

## Desktop Completo

Genera sia macOS sia Windows:

```bash
npm run package:desktop
```

Questo comando esegue prima la build macOS e poi quella Windows.

## Android

Genera APK Android debug:

```bash
npm run package:android
```

La prima volta lo script crea la cartella `android/` con Capacitor. Prima di compilare rigenera anche le icone Android dal logo in `public/logo.png`, con sfondo bianco per il launcher. Output finale copiato in:

```text
release/android/Since-debug.apk
```

Apri il progetto Android in Android Studio:

```bash
npm run cap:open:android
```

Per pubblicare davvero su Google Play serviranno una keystore release e, di solito, un file `.aab`.

## Tutte Le Piattaforme

Genera macOS, Windows e Android in sequenza:

```bash
npm run package:all
```

Usalo quando hai gia configurato anche Android Studio/SDK, altrimenti il comando si fermera sulla parte Android.

## Cosa fa lo script

Lo script `scripts/package-app.mjs` esegue sempre prima:

```bash
npm run build
```

Poi:

- per desktop chiama `electron-builder`;
- per Android esegue `npx cap add android` se il progetto nativo non esiste ancora;
- rigenera le icone Android con `scripts/generate_android_icons.py`;
- sincronizza `dist/` dentro Android con `npx cap sync android`;
- compila un APK debug con Gradle;
- copia l'APK in `release/android/Since-debug.apk`.
- con `clean` rimuove solo gli output di packaging (`release/` e `dist-electron/`).

## Cambiare versione

La versione principale sta in `package.json`:

```json
{
  "version": "1.0.0"
}
```

Per aggiornarla in modo pulito usa npm:

```bash
npm version patch --no-git-tag-version
```

Oppure:

```bash
npm version minor --no-git-tag-version
npm version major --no-git-tag-version
```

Regole pratiche:

- `patch`: correzioni piccole, esempio `1.0.0` -> `1.0.1`.
- `minor`: nuove funzioni compatibili, esempio `1.0.1` -> `1.1.0`.
- `major`: cambi grandi, esempio `1.1.0` -> `2.0.0`.

electron-builder usa questa versione per nominare `.dmg` e `.exe`.

Per Android, dopo la prima generazione del progetto Capacitor, Android ha anche un suo version code nativo dentro `android/app/build.gradle`. Per test locali l'APK debug funziona anche senza toccarlo. Per pubblicare sul Play Store dovrai incrementare `versionCode` oltre alla `versionName`.

## Firma e distribuzione

Gli installer generati localmente sono pensati per test e distribuzione manuale.

macOS:

- il `.dmg` locale usa una firma ad-hoc, utile su Apple Silicon e per test;
- un `.dmg` non notarizzato puo mostrare avvisi Gatekeeper su altri Mac;
- per distribuirlo bene serve Apple Developer Program, firma e notarizzazione.

Windows:

- un `.exe` non firmato puo mostrare SmartScreen;
- per distribuirlo bene serve un certificato di code signing.

Android:

- `package:android` genera un APK debug, adatto per installazione manuale e test;
- per produzione serve una keystore release e, di solito, un `.aab` per Google Play.

## Note importanti

- `dist/` e `release/` sono output generati e non vanno committati.
- La cartella `android/`, quando viene creata, normalmente va committata se vuoi mantenere impostazioni native, icone, versioni e firme Android sotto controllo.
- Dopo ogni modifica al codice React, rigenera sempre il pacchetto: gli script fanno gia `npm run build` prima di impacchettare.
