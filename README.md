# jyc-scoreboard

`jyc-scoreboard` is a lightweight Electron wrapper for the NALSA RaceControl scoreboard.

It launches a dedicated, always-on-top window that displays the live race page at [https://nalsa.org/RaceControl?sound=1](https://nalsa.org/RaceControl?sound=1), making it easier to use a TV or external monitor as a race display during events.

## What this app does

- Opens the RaceControl scoreboard in a standalone desktop window instead of a normal browser tab
- Positions that window on the display to the right of the main monitor when one is available
- Sizes the window for a small LED-style display area
- Keeps the window frameless, fixed-size, and always on top
- Enables audio so race start sounds can play reliably
- Lets the operator quit quickly with the `Escape` key

## Typical use case

This app is useful when you want a simple race-day display computer that:

- shows only the scoreboard
- stays visible above other windows
- automatically lands on the scoreboard monitor
- plays countdown or start audio from RaceControl

## How it works

When started, Electron creates a borderless window and loads the hosted RaceControl page directly from NALSA. The app does not render its own scoreboard UI locally; it is a focused launcher for the live web-based scoreboard.

## Requirements

- Node.js and npm
- An internet connection to reach `nalsa.org`
- Optional: a second display positioned to the right of the main display for automatic placement

If no right-hand display is found, the app falls back to the first available display.

## Run locally

Install dependencies:

```bash
npm install
```

Start the app:

```bash
npm start
```

Show command-line help:

```bash
npm start -- --help
```

Open FinishControl instead of RaceControl:

```bash
npm start -- --finish
```

Override the default scale, size, or URL:

```bash
npm start -- --scale=3 --width=640 --height=320 --url="https://nalsa.org/RaceControl?sound=1"
```

Supported flags:

- `--help`: prints usage information and exits
- `--finish`: loads `https://nalsa.org/FinishControl`
- `--scale=<number>`: sets the window size multiplier, default `2`
- `--width=<pixels>`: sets the window width explicitly, default `360`
- `--height=<pixels>`: sets the window height explicitly, default `204`
- `--url=<https-url>`: loads a different scoreboard page, default `https://nalsa.org/RaceControl?sound=1`

## Current behavior and limitations

- Default scoreboard URL is [configured in `index.js`](/Users/scott/git/jyc-scoreboard/index.js).
- `--finish` switches the app to `https://nalsa.org/FinishControl`.
- Default window size is `180 x 102`, scaled by `2`, and can be overridden with `--scale`, `--width`, and `--height`.
- The app depends on the remote RaceControl site being available.
- There is no local configuration UI yet for choosing the display, URL, or size.

## File overview

- [index.js](/Users/scott/git/jyc-scoreboard/index.js): Electron app entrypoint and window setup
- [package.json](/Users/scott/git/jyc-scoreboard/package.json): project metadata and start script
