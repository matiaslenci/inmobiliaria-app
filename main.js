import { app, BrowserWindow, shell } from "electron";
import { createServer } from "http";
import { fileURLToPath } from "url";
import path from "path";
import expressApp from "./src/app.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PORT = 3000;

let mainWindow;
let server;

function startExpressServer() {
  return new Promise((resolve, reject) => {
    server = createServer(expressApp);
    server.on("error", reject);
    server.listen(PORT, "127.0.0.1", resolve);
  });
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 800,
    minHeight: 600,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
    },
    icon: path.join(__dirname, "public/assets/calculator.svg"),
    title: "Calculadora de Tasas Municipales",
    show: false,
  });

  mainWindow.loadURL(`http://127.0.0.1:${PORT}`);

  mainWindow.once("ready-to-show", () => mainWindow.show());

  // Abrir links externos en el browser del sistema, no en Electron
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  await startExpressServer();
  createWindow();

  app.on("activate", () => {
    if (!mainWindow) createWindow();
  });
});

app.on("window-all-closed", () => {
  server?.close();
  if (process.platform !== "darwin") app.quit();
});
