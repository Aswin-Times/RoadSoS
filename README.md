# 🚨 ROAD RESCUE — Advanced Emergency Response System

**ROAD RESCUE** is a production-grade, real-time emergency response Progressive Web Application (PWA) designed to save lives during the critical "Golden Hour" following road accidents. Built for speed, reliability, and human-centric urgency, it integrates cutting-edge deep features to handle everything from immediate crash response to long-term trauma recovery.

## ✨ Core Features & Deep Integrations (Layer 3)

### 1. Zero-Friction SOS & Golden Hour Tracking
- **One-Tap Emergency**: A persistent, pulsing SOS button initiates an emergency workflow, generating shareable cards with precise GPS coordinates, What3Words equivalents, and pre-filled emergency contacts.
- **Golden Hour Timer**: A prominent countdown timer tracks elapsed time since the incident to assist medical teams with vital triage decisions.

### 2. Advanced Telemedicine & AR Support
- **WebRTC/AR First Aid**: Live video coordination between bystanders and emergency dispatchers/medical professionals. Features augmented reality (AR) overlays for precise First Aid administration (CPR, bleeding control).

### 3. Hyper-Local Emergency Intelligence
- **Smart Geolocation**: Leverages Overpass API for real-time routing to the nearest trauma centers, hospitals, and police stations with dynamic distance calculation and ETA.
- **Blood Bank Networking**: Real-time connections to regional blood banks, matching critical blood types with live inventory to streamline transfusions.
- **Environmental Hazard & Black Spot Detection**: Pre-trip risk assessment utilizing live weather APIs and historical accident data to warn drivers of high-risk zones ("black spots") and active hazards.

### 4. Vehicle & Mass Casualty Intelligence
- **OBD-II Vehicle Intelligence**: Integrates with on-board diagnostics (OBD-II) to predict crash severity, transmit vital vehicle metrics, and automate incident reporting.
- **Mass Casualty Coordination**: Specialized protocols for large-scale incidents, managing multi-victim triage, resource allocation, and helicopter landing zone (LZ) mapping.

### 5. Post-Trauma & Mental Health Recovery
- **Recovery Timeline**: Guided rehabilitation tracking and milestone achievements for physical and mental health.
- **Trauma Support**: Integrated resources and professional networking for PTSD, accident anxiety, and long-term psychological care.

### 6. Offline Resilience
- **PWA Architecture**: Intelligently caches map tiles (up to 50km radius) and stores emergency services in IndexedDB (Dexie.js). Crucial modules like the First Aid Guide and SOS signaling remain fully functional completely offline.

### 7. Aesthetic Urgency & Accessibility
- **Design System**: "Signal Red on Asphalt Black" leverages a tailored color palette and typography (Barlow Condensed) to maximize readability under stress and direct sunlight.
- **Multi-lingual Voice Guides**: Bundled step-by-step guides with auditory readouts via the Web Speech API and visual timers.

---

## 🛠 Tech Stack

- **Frontend Core**: React 18, Vite
- **Styling**: Tailwind CSS v4 (Custom UI/UX Theme), Framer Motion
- **State & Data**: Zustand (Global State), IndexedDB / Dexie.js (Offline Storage)
- **Maps & Routing**: Leaflet.js, React-Leaflet, OpenStreetMap
- **PWA Capabilities**: `vite-plugin-pwa`

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn

### Installation & Setup

1. **Clone the Repository**
   ```bash
   git clone https://github.com/Aswin-Times/RoadSoS.git
   cd RoadSoS
   ```

2. **Install Dependencies**
   ```bash
   npm install
   ```

3. **Set Environment Variables**
   ```bash
   cp .env.example .env
   # Add your ANTHROPIC_API_KEY to the .env file
   ```

4. **Run Development Server**
   ```bash
   npm run dev
   ```
   The application will be running at `http://localhost:5173`.

4. **Build for Production**
   ```bash
   npm run build
   ```

---

## 🧪 Demo & Testing Notes

- **Simulate Offline Mode**: Disconnect from the internet or use Chrome DevTools (Network tab -> Throttle -> Offline) to test the PWA cache fallback. Observe the offline badge and access the fully cached First Aid guide.
- **Test SOS Flow**: Trigger the red SOS button. Watch the Golden Hour Timer activate and review the generated comprehensive emergency dispatch message.
- **Real-Time Data**: Navigate to "Nearby Services" to observe live OpenStreetMap data fetching. Notice how it gracefully falls back to local data if connection drops.

---

*Built with intention. Every second matters.*
