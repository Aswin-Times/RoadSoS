# ROAD RESCUE — Emergency Response System

**ROAD RESCUE** is a production-grade, real-time emergency response platform designed for road accident victims and bystanders. Built for speed, reliability, and human-centric urgency. 

## Features & Innovations

1. **Golden Hour Timer**: When SOS is triggered, a prominent countdown timer begins, tracking the elapsed time since the accident to assist medical teams with triage decisions.
2. **Offline Resilience (PWA Architecture)**: The application is built as a Progressive Web App (PWA). It intelligently caches Leaflet map tiles for a 50km radius and stores nearby emergency services in IndexedDB (Dexie.js), allowing critical features and the First Aid Guide to work completely offline.
3. **Smart Geolocation & Routing**: Leverages the Overpass API for real-time queries of nearby hospitals, trauma centers, and police stations. Includes dynamic distance calculation and ETA estimations.
4. **Zero-Friction SOS**: A persistent, pulsing SOS button initiates an emergency workflow. It generates a shareable emergency card with precise GPS coordinates, What3Words equivalents, and pre-filled WhatsApp/SMS messages.
5. **Aesthetic Urgency**: The design system ("Signal Red on Asphalt Black") uses a tailored color palette and typography (Barlow Condensed) to maximize readability under stress and direct sunlight.
6. **Multi-lingual First Aid Guide**: Fully bundled, step-by-step guides for CPR, severe bleeding, fractures, and more. Features auditory readouts via the Web Speech API and visual timers.

## Tech Stack
- **Frontend**: React 18, Vite
- **Styling**: Tailwind CSS v4 (Custom Theme)
- **State Management**: Zustand
- **Maps**: Leaflet.js, React-Leaflet, OpenStreetMap
- **Local Database**: IndexedDB (Dexie.js)
- **Icons & Animations**: Lucide React, Framer Motion
- **PWA**: vite-plugin-pwa

## Getting Started

### Prerequisites
- Node.js 18+

### Installation & Setup

1. **Install Dependencies**
   ```bash
   npm install
   ```

2. **Run Development Server**
   ```bash
   npm run dev
   ```
   The application will be available at `http://localhost:5173`.

3. **Build for Production**
   ```bash
   npm run build
   ```

## Demo & Testing Notes for Judges
- **Test Offline**: Disconnect your internet (or use Chrome DevTools Network throttling) to see the offline badge activate and cache fallback in action. The First Aid guide will still be accessible.
- **SOS Flow**: Click the prominent red SOS button, wait for the countdown or tap Confirm. See the Golden Hour Timer start and observe the generated emergency message.
- **Data Fetching**: The Nearby Services page queries live OSM data around your coordinates. If offline, it falls back gracefully to locally cached data.

Built with intention. Every second matters.
