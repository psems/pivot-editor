
# Pivot Editor

**Author:** [Paul Sems](https://paulsems.com) (<paulsems@gmail.com>)

**Description:**
Pivot Editor is an open source utility for editing Odoo pipeline pivot table definitions (`osheet.json` files) with a modern, user-friendly UI. It supports both web and Electron desktop modes, and is designed for Odoo 17+ compatibility.

---

> **A simple desktop and web app for editing pivot table definitions in Odoo pipeline JSON files.**

---

## What is Pivot Editor?

Pivot Editor is a lightweight tool for editing the `pivots` section inside `Pipeline.osheet.json` files (used by Odoo and similar systems). It provides a user-friendly interface to view, modify, and create pivot table definitions, making it easier to manage complex reporting configurations.

- **Edit**: View and update existing pivots, or add new ones.
- **Validate**: Ensures your JSON is well-formed before saving.
- **Download**: Export your modified file for use in your pipeline.
- **Native dialogs**: (Electron mode) Use your OS's file dialogs for open/save.

---

## Installation & Running

### 1. Prerequisites

You will need:

- [Node.js](https://nodejs.org/) (v16 or newer recommended)
- [npm](https://www.npmjs.com/) (comes with Node.js)
- [git](https://git-scm.com/) (to clone the repository)

#### Installing Prerequisites

**On macOS (using Homebrew):**

```sh
brew install node git
```

If you don't have Homebrew, install it from <https://brew.sh> first.

**On Windows:**

1. Download and install [Node.js (includes npm)](https://nodejs.org/)
2. Download and install [Git for Windows](https://git-scm.com/download/win)

After installing, you can use the Command Prompt or PowerShell for the following steps.

### 2. Clone & Install

```sh
# Clone the repository (if you haven't already)
git clone <repo-url>
cd pivot-editor

# Install dependencies
npm install
```

### 3. Run as a Web App (Vite Dev Server)

```sh
npm run dev
```

- Open the local URL printed in the terminal (usually <http://localhost:5173>)
- Use the file picker to open your `Pipeline.osheet.json`, edit pivots, and download the modified file.

### 4. Run as a Desktop App (Electron)

```sh
npm run electron:dev
```

- This launches the app in an Electron window with native Open/Save dialogs.
- All editing features are the same as the web version.

---

## Building for Production

- **Web build:**

```sh
npm run build
# Output in dist/
```

- **Electron package:**

```sh
npm run dist
# Creates a packaged Electron app (see electron-builder docs)
```

---

## Project Structure

- `src/` — React source code
- `main.js` — Electron main process
- `preload.js` — Electron preload script (secure API bridge)
- `index.html` — App entry point
- `package.json` — Scripts and dependencies

---

## License

MIT

---

### Icon Attribution

The table icon (`table.svg`) is from [Bootstrap Icons](https://icons.getbootstrap.com/icons/table/), licensed under the MIT License.

Attribution: © 2019-2024 The Bootstrap Authors
