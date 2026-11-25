# SafeWithUs — Frontend UI

A futuristic, premium React front-end for a women's safety & emergency assistance platform. Frontend only — all data is mocked/static, no backend calls are made.

## Tech stack
- React 18 + Vite
- React Router v6 (SPA routing, no page reloads)
- Bootstrap 5 (+ react-bootstrap for Modal)
- React Icons (Feather set)
- Three.js via @react-three/fiber for the holographic Earth & 3D shield
- SweetAlert2 for confirmation dialogs
- Framer Motion for page transitions
- Plain CSS3 (glassmorphism, custom properties for dark/light theming) — see `src/index.css`

## Getting started
```bash
npm install
npm run dev
```
Then open the printed local URL (usually http://localhost:5173).

## Structure
```
src/
├── components/     Reusable UI: Navbar, Sidebar, Footer, SOSButton, GlassCard,
│                   AlertCard, ContactCard, LocationCard, ProfileCard, Modal,
│                   HolographicEarth, SafetyShield, ParticleBackground, etc.
├── layouts/        MainLayout (public pages) and DashboardLayout (app pages)
├── pages/          Landing, Login, Register, ForgotPassword, Dashboard,
│                   Emergency, LiveLocation, TrustedContacts, Alerts,
│                   SafetyZones, Profile, Settings
├── context/         ThemeContext — dark/light mode, persisted to localStorage
├── data/            mockData.js — static demo data for the whole app
├── hooks/           useCountUp, useReveal — scroll-triggered animation hooks
└── App.jsx          Route table
```

## Notes
- Dark/Light theme toggle persists via `localStorage` and is available from the
  navbar, sidebar and Settings page.
- The SOS flow (dashboard + dedicated Emergency page) uses SweetAlert2 for the
  confirmation dialog, then shows a simulated active-emergency state with a
  live response timer — no real location or contact data leaves the browser.
- The 3D globe/shield are built with `@react-three/fiber`; they're intentionally
  lightweight (basic materials, no textures) to keep the app fast.
- This is a static, backend-free UI: forms validate client-side and simulate
  success — wire up your own API layer to make it functional.
