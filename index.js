const { app, BrowserWindow, screen } = require("electron");

const DEFAULT_SCALE = 2;
const DEFAULT_URL = "https://nalsa.org/RaceControl?sound=1";
const FINISH_URL = "https://nalsa.org/FinishControl";
const BASE_WIDTH = 180;
const BASE_HEIGHT = 102;

function hasCliFlag(name) {
  return process.argv.includes(`--${name}`);
}

function readCliOption(name) {
  const exactPrefix = `--${name}=`;

  for (let i = 0; i < process.argv.length; i += 1) {
    const arg = process.argv[i];

    if (arg.startsWith(exactPrefix)) {
      return arg.slice(exactPrefix.length);
    }

    if (arg === `--${name}`) {
      return process.argv[i + 1];
    }
  }

  return undefined;
}

function getScale() {
  return getPositiveNumberOption("scale", DEFAULT_SCALE);
}

function getScoreboardUrl() {
  const rawUrl = readCliOption("url");

  if (rawUrl) {
    try {
      return new URL(rawUrl).toString();
    } catch (error) {
      console.warn(
        `Invalid --url value "${rawUrl}". Falling back to ${DEFAULT_URL}.`
      );
      return DEFAULT_URL;
    }
  }

  if (hasCliFlag("finish")) {
    return FINISH_URL;
  }

  return DEFAULT_URL;
}

function getPositiveNumberOption(name, fallback) {
  const rawValue = readCliOption(name);
  const parsedValue = Number(rawValue);

  if (!rawValue) {
    return fallback;
  }

  if (Number.isFinite(parsedValue) && parsedValue > 0) {
    return parsedValue;
  }

  console.warn(
    `Invalid --${name} value "${rawValue}". Falling back to ${fallback}.`
  );
  return fallback;
}

function getWindowSize(scale) {
  const defaultWidth = Math.round(BASE_WIDTH * scale);
  const defaultHeight = Math.round(BASE_HEIGHT * scale);

  return {
    width: Math.round(getPositiveNumberOption("width", defaultWidth)),
    height: Math.round(getPositiveNumberOption("height", defaultHeight))
  };
}

function showHelp() {
  const defaultWidth = BASE_WIDTH * DEFAULT_SCALE;
  const defaultHeight = BASE_HEIGHT * DEFAULT_SCALE;

  console.log(`jyc-scoreboard

Usage:
  npm start -- [options]

Options:
  --help            Show this help and exit
  --finish          Load the FinishControl page
  --scale=<number>  Set the window size multiplier (default: ${DEFAULT_SCALE})
  --width=<pixels>  Set the window width explicitly (default: ${defaultWidth})
  --height=<pixels> Set the window height explicitly (default: ${defaultHeight})
  --url=<https-url> Load a different scoreboard page
                    (default: ${DEFAULT_URL})

Examples:
  npm start
  npm start -- --finish
  npm start -- --scale=3
  npm start -- --width=640 --height=320
  npm start -- --scale=3 --url="https://nalsa.org/RaceControl?sound=1"`);
}

function createWindow() {
  const displays = screen.getAllDisplays();

  // Find the display to the RIGHT of your main screen
  const targetDisplay =
    displays.find(d => d.bounds.x > 0) || displays[0];

  const { x, y } = targetDisplay.bounds;

  const scale = getScale();
  const scoreboardUrl = getScoreboardUrl();
  const { width, height } = getWindowSize(scale);

  const win = new BrowserWindow({
    x: x,
    y: y,
    width: width,
    height: height,
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
  win.loadURL(scoreboardUrl);

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

if (hasCliFlag("help")) {
  showHelp();
  process.exit(0);
}

if (app) {
  app.whenReady().then(createWindow);

  app.on("window-all-closed", () => {
    app.quit();
  });
}
