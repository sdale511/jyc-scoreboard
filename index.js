const { app, BrowserWindow, screen } = require("electron");

function createWindow() {
  const displays = screen.getAllDisplays();

  // Find the display to the RIGHT of your main screen
  const targetDisplay =
    displays.find(d => d.bounds.x > 0) || displays[0];

  const { x, y } = targetDisplay.bounds;

  const scale = 2;

  const win = new BrowserWindow({
    x: x,
    y: y,
    width: 192 * scale,
    height: 96 * scale,
    frame: false,
    resizable: false,
    alwaysOnTop: true,
    backgroundColor: "#000000",
    webPreferences: {
      autoplayPolicy: "no-user-gesture-required",
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Load your scoreboard
  win.loadURL("https://nalsa.org/RaceControl?sound=1");

  // 🔊 Ensure not muted
  win.webContents.setAudioMuted(false);

  // 🔊 Force WebAudio to start
  win.webContents.on("did-finish-load", () => {
    win.webContents.executeJavaScript(`
      try {
        const AudioContext = window.AudioContext || window.webkitAudioContext;
        if (AudioContext) {
          const ctx = new AudioContext();
          ctx.resume();
        }
      } catch (e) {
        console.log("Audio init error", e);
      }
    `);
  });

  // 🔥 Optional: ESC quits app
  win.webContents.on("before-input-event", (event, input) => {
    if (input.key === "Escape") {
      app.quit();
    }
  });
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  app.quit();
});
