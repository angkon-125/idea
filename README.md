# ⚡ THUNDERSTORM RADIO

[![Vite](https://img.shields.io/badge/vite-%23646CFF.svg?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/react-%2320232a.svg?style=for-the-badge&logo=react&logoColor=%2361DAFB)](https://reactjs.org/)
[![TailwindCSS](https://img.shields.io/badge/tailwindcss-%2338B2AC.svg?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

> **"Status: Link_Stable // Sector_DH // Estabishing sub-space frequency..."**

Thunderstorm Radio is a high-performance, cyberpunk-themed web dashboard for global radio streaming. It provides an immersive audio experience with real-time spectral analysis, live news feeds, and an AI-driven diagnostic interface.

![Thunderstorm Dashboard Preview](https://via.placeholder.com/1200x600/050508/00f5ff?text=THUNDERSTORM+RADIO+DASHBOARD) *Note: High-fidelity Cyberpunk UI including CRT effects, scanner lines, and holographic panels.*

---

## 🚀 Core Features

### 📡 Global Radio Streaming
- **Unlimited Stations**: Access thousands of global radio stations via the Radio Browser API.
- **Smart Filtering**: Filter by genres (Synthwave, Metal, Lofi, Techno, etc.) or search for specific frequencies.
- **Signal Strength Logic**: Visual indicators for bitrate and signal quality.

### 📊 Spectral Field Analyzer
- **Real-time Visualization**: Dynamic spectrum bars that react to audio playback.
- **Frequency Calibration**: Simulated frequency tracking with smooth, spring-based animations.

### 🔬 AI Diagnostic Agent
- **Module Memory Analysis**: Real-time tracking of memory usage and potential leak risks (simulated).
- **Sub-space Troubleshooting**: AI-driven suggestions and system optimization logs.
- **Offline RAG Support**: Integrated "Local AI Model" for troubleshooting in the lower sectors.

### 📰 Storm-Net News Ticker
- **Live Feed**: Scrolling news ticker with critical system alerts and global updates.
- **Gravity Drift Detection**: Real-time monitoring of sector-specific events.

---

## 🛠️ Technical Stack

- **Frontend**: React (v19)
- **Build Tool**: Vite (v7)
- **Styling**: Tailwind CSS (v4) with custom "Cyberpunk" design tokens.
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **API**: Radio Browser API, Custom Mock News API

---

## ⚙️ Getting Started

### Prerequisites

- [Node.js](https://nodejs.org/) (Latest LTS recommended)
- npm or yarn

### Installation

1.  **Clone the Repository**
    ```bash
    git clone https://github.com/your-username/Thunderstruck-the-online-radio.git
    cd Thunderstruck-the-online-radio
    ```

2.  **Install Dependencies**
    ```bash
    npm install
    ```

3.  **Launch the System**
    ```bash
    npm run dev
    ```

4.  **Production Build**
    ```bash
    npm run build
    ```

---

## 📂 Project Structure

```text
src/
├── api/            # API service layers (Radio, News)
├── components/     
│   ├── Agent/      # AI Diagnostic Panel & logic
│   ├── Audio/      # Audio hooks & filters
│   ├── Radio/      # Dashboard, Visualizer, Station logic
│   └── Layout/     # Reusable layout components
├── hooks/          # Custom React hooks (useAudioFilter, etc.)
├── assets/         # Static visual assets
└── index.css       # Core design system & Cyberpunk theme
```

---

## 🎨 Design System

Thunderstorm uses a bespoke CSS-in-theme system defined in `index.css`:
- **Neon Palette**: `electric-cyan`, `neon-purple`, `plasma-blue`.
- **Global Effects**: CRT screen scanlines, holographic card shines, and particle floating animations.
- **Typography**: `Orbitron` (Display), `Rajdhani` (Body), `JetBrains Mono` (Data).

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

> [!TIP]
> **Pro-tip**: Move your cursor over the dashboard! The AI Diagnostic Agent tracks movement to recalibrate sub-space filters in real-time.
