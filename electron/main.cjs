const { app, BrowserWindow, shell } = require("electron");
const path = require("node:path");

const isDev = !app.isPackaged;

app.setAppUserModelId("com.flaviocecca.since");

function createWindow() {
  const win = new BrowserWindow({
    width: 420,
    height: 820,
    minWidth: 360,
    minHeight: 640,
    title: "Since",
    backgroundColor: "#f8f2e9",
    icon: path.join(__dirname, "../public/logo.png"),
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  win.setMenuBarVisibility(false);

  win.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  win.webContents.on("will-navigate", (event, url) => {
    if (!url.startsWith("file://")) {
      event.preventDefault();
      shell.openExternal(url);
    }
  });

  if (isDev && process.env.SINCE_ELECTRON_DEV_URL) {
    win.loadURL(process.env.SINCE_ELECTRON_DEV_URL);
  } else {
    win.loadFile(path.join(__dirname, "../dist/index.html"));
  }
}

app.whenReady().then(() => {
  createWindow();

  app.on("activate", () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});
