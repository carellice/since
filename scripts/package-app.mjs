import { existsSync } from "node:fs";
import { cp, mkdir, rm } from "node:fs/promises";
import { spawn } from "node:child_process";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(fileURLToPath(new URL("..", import.meta.url)));
const target = process.argv[2] || "desktop";

const targets = new Set(["mac", "win", "desktop", "android", "open-android", "all", "clean"]);

if (!targets.has(target)) {
  console.error(`Target non valido: ${target}`);
  console.error("Usa uno tra: mac, win, desktop, android, open-android, all, clean");
  process.exit(1);
}

function run(command, args, options = {}) {
  return new Promise((resolveRun, reject) => {
    const child = spawn(command, args, {
      cwd: root,
      stdio: "inherit",
      shell: process.platform === "win32",
      ...options,
    });

    child.on("exit", (code) => {
      if (code === 0) {
        resolveRun();
      } else {
        reject(new Error(`${command} ${args.join(" ")} è terminato con codice ${code}`));
      }
    });
  });
}

async function buildWeb() {
  await run("npm", ["run", "build"]);
}

async function cleanPackages() {
  const releaseDir = join(root, "release");
  const desktopOutDir = join(root, "dist-electron");

  await rm(releaseDir, { recursive: true, force: true });
  await rm(desktopOutDir, { recursive: true, force: true });
  console.log("Artefatti di packaging rimossi: release/ e dist-electron/.");
}

async function packageDesktop(platform) {
  const args = ["electron-builder"];
  if (platform === "mac") args.push("--mac");
  if (platform === "win") args.push("--win");

  await run("npx", args);
}

async function ensureAndroidProject() {
  if (!existsSync(join(root, "android"))) {
    await run("npx", ["cap", "add", "android"]);
  }
}

async function generateAndroidIcons() {
  await run("python3", ["scripts/generate_android_icons.py"]);
}

async function packageAndroid() {
  await ensureAndroidProject();
  await generateAndroidIcons();
  await run("npx", ["cap", "sync", "android"]);

  const gradlew = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
  await run(gradlew, ["assembleDebug"], { cwd: join(root, "android") });

  const apkSource = join(root, "android/app/build/outputs/apk/debug/app-debug.apk");
  const apkOutDir = join(root, "release/android");
  await mkdir(apkOutDir, { recursive: true });
  await cp(apkSource, join(apkOutDir, "Since-debug.apk"));
  console.log(`APK generato in ${join(apkOutDir, "Since-debug.apk")}`);
}

if (target === "clean") {
  await cleanPackages();
  process.exit(0);
}

await buildWeb();

if (target === "mac" || target === "desktop") {
  await packageDesktop("mac");
}

if (target === "win" || target === "desktop") {
  await packageDesktop("win");
}

if (target === "android") {
  await packageAndroid();
}

if (target === "open-android") {
  await ensureAndroidProject();
  await generateAndroidIcons();
  await run("npx", ["cap", "sync", "android"]);
  await run("npx", ["cap", "open", "android"]);
}

if (target === "all") {
  await packageDesktop("mac");
  await packageDesktop("win");
  await packageAndroid();
}
