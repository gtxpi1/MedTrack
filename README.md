# MedTrack - Cross-Platform Medication & Supply Tracker

A modern, cross-platform medication scheduling and inventory tracking application built with **React**, **TypeScript**, **Vite**, **Modern Responsive CSS**, and **PWA (Progressive Web App)** architecture.

Designed for phones (iOS/Android), tablets, and desktop browsers.

---

## 🌟 Key Features

* **Today Dashboard**:
  * Adherence progress meter (e.g. `2 of 4 Doses Taken (50%)`)
  * Low-supply warning banner
  * Filter by time period: `All`, `Pending`, `Morning`, `Afternoon`, `Evening`, `Bedtime`
  * Actionable medication cards with one-click **Take**, **Undo**, and **Skip** actions
* **Medication Catalog**:
  * Track generic/brand names, forms (tablets, capsules, inhalers, etc.), strength, and dosage instructions
  * Built-in search and filter
* **Daily Timeline Routine**:
  * Time-of-day groupings (Morning, Afternoon, Evening, Bedtime)
* **Supply & Refill Manager**:
  * Inventory level progress bars with days-remaining calculators
  * Low-stock alert thresholds
  * Rx numbers and pharmacy contact info
  * Quick refill logging (+30 count)
* **Dose History & Adherence**:
  * Historical log of taken, skipped, and scheduled doses with timestamps
* **Cross-Platform & PWA-Ready**:
  * Installable directly on **iPhone (Safari)** and **Android (Chrome)** without app store downloads
  * Desktop standalone window support with safe area support for mobile devices
* **Pluggable Storage Layer**:
  * Decoupled `IStorageService` interface allowing easy swap between `LocalStorage`, `IndexedDB`, or Cloud Sync (`Supabase`/`Firebase`).

---

## 🚀 Quick Start

### Prerequisites
* [Node.js](https://nodejs.org/) (version 18 or newer)
* npm (bundled with Node.js)

### Installation
```bash
# Clone the repository
git clone https://github.com/<your-username>/medication-tracker.git

# Navigate into the project folder
cd medication-tracker

# Install dependencies
npm install

# Start local development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

### Production Build
```bash
npm run build
```
The optimized production bundle will be output to the `dist/` directory.

---

## 📱 How to Install on Mobile Devices

* **iOS / iPadOS (Safari)**:
  1. Open the website in Safari.
  2. Tap the **Share** icon (square with arrow pointing up).
  3. Select **Add to Home Screen**.
* **Android (Chrome)**:
  1. Open the website in Chrome.
  2. Tap the **Install** popup or open menu (⋮) -> **Install app** / **Add to Home screen**.

---

## 🛡️ Medical Disclaimer
*The sample medication data included in this repository is strictly for UI mockup and demonstration purposes. It does not provide medical advice, diagnosis, treatment, or clinical recommendations.*

---

## 📄 License
MIT License.
