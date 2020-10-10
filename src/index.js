const { app, BrowserWindow, dialog, ipcMain } = require("electron");
const path = require("path");
const isDev = require("electron-is-dev");
const fs = require("fs");

console.log("MD", isDev);
// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require("electron-squirrel-startup")) {
  // eslint-disable-line global-require
  app.quit();
}

if (isDev) {
  require("electron-reload")(__dirname, {
    electron: path.join(__dirname, "../node_modules", ".bin", "electron"),
    awaitWriteFinish: true,
  });
}

let window;
const createWindow = () => {
  // Create the browser window.
  window = new BrowserWindow({
    width: 452,
    height: 600,
    minWidth: 452,
    minHeight: 600,
    maxWidth: 1000,
    center: true,
    darkTheme: true,
    title: "중나오토",
    webPreferences: {
      nodeIntegration: true,
      devTools: isDev,
      webviewTag: true,
      // worldSafeExecuteJavaScript: true,
    },
  });

  // and load the index.html of the app.
  window.loadFile(path.join(__dirname, "../public/index.html"));

  // Open the DevTools.
  isDev && window.webContents.openDevTools();
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  // if (process.platform !== "darwin") {
  app.quit();
  // }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.

ipcMain.on("refresh", () => {
  window.reload();
});
ipcMain.on("pick-dir", async (event, arg) => {
  const result = await dialog.showOpenDialog(window, {
    properties: ["openDirectory"],
  });
  if (result.filePaths) {
    event.reply("picked-dir", result.filePaths[0]);
  }
});
ipcMain.on("get-photo-paths", async (event, dir) => {
  const paths = fs
    .readdirSync(dir)
    .map((p) => path.join(dir, p))
    .filter((p) => {
      const isFile = fs.lstatSync(p).isFile();
      if (!isFile) {
        return false;
      }
      const ext = path.extname(p).toLowerCase().substring(1);
      if (ext === "png" || ext === "jpg" || ext === "jpeg") {
        return true;
      }
      return false;
    });
  event.returnValue = paths;
});
