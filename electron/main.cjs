// Allow self-signed / untrusted TLS certificates used by government services
process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";

const { app, BrowserWindow, Menu, shell } = require("electron");
const path = require("path");
const url = require("url");

let mainWindow = null;
let httpServer = null;

async function startServer() {
  const appUrl = url.pathToFileURL(
    path.join(__dirname, "..", "src", "app.js")
  ).href;
  const { default: expressApp } = await import(appUrl);

  return new Promise((resolve, reject) => {
    httpServer = expressApp.listen(0, "127.0.0.1", () => {
      resolve(httpServer.address().port);
    });
    httpServer.on("error", reject);
  });
}

function createWindow(port) {
  mainWindow = new BrowserWindow({
    width: 1280,
    height: 900,
    minWidth: 900,
    minHeight: 600,
    title: "Tasas Inmobiliarias",
    autoHideMenuBar: true,
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false,
      sandbox: true,
    },
  });

  Menu.setApplicationMenu(null);
  mainWindow.loadURL(`http://127.0.0.1:${port}/`);

  mainWindow.webContents.setWindowOpenHandler(({ url: targetUrl }) => {
    shell.openExternal(targetUrl);
    return { action: "deny" };
  });

  mainWindow.on("closed", () => {
    mainWindow = null;
  });
}

app.whenReady().then(async () => {
  try {
    const port = await startServer();
    createWindow(port);

    app.on("activate", () => {
      if (BrowserWindow.getAllWindows().length === 0) createWindow(port);
    });
  } catch (err) {
    console.error("Error al arrancar el servidor interno:", err);
    app.quit();
  }
});

app.on("window-all-closed", () => {
  if (httpServer) httpServer.close();
  if (process.platform !== "darwin") app.quit();
});
