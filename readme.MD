# FinTrack AI – Production Ready (v2.0)

FinTrack AI is a modern fintech application that uses Gemini AI to analyze your bank statements, track expenses, and deliver real-time actionable financial insights.

Built with a MERN stack + Vite, featuring a premium Stripe-like UI, JWT role-based access control, automated AI insights, and production-grade security.

## Core Features
- **Neural Financial Insights:** Real AI analysis using Google's Gemini API with anti-hallucination guardrails and confidence scoring.
- **Premium UI/UX:** Glassmorphism, tailored dark themes, and dynamic React components.
- **Role-Based Access Control (RBAC):** Strict JWT middleware protecting user data and granular admin routes.
- **High Performance:** Route-level code splitting (`React.lazy`) and optimized bundle sizes.
- **Production Security:** Configured with `helmet`, `express-rate-limit`, `xss-clean`, and `mongo-sanitize`.

---

## Project Architecture

```bash
FinTrackAI_Secure/
├── backend/                # Node.js + Express API
│   ├── authentication/     # Login, Signup, Admin Auth logic
│   ├── middleware/         # Security, validation, and JWT guards
│   ├── models/             # Mongoose schemas (User, Transaction, etc.)
│   └── server.js           # Express entry point
│
└── frontendpart/           # React + Vite Client
    ├── src/
    │   ├── Authentication/ # Auth flows
    │   ├── components/     # Reusable UI architecture
    │   ├── Dashboard/      # Main application hub
    │   ├── api/            # Backend communication layer
    │   └── App.jsx         # Router & suspense bounds
```

---

## Local Setup

### 1. Backend Setup
```bash
cd backend
npm install
```
Create a `.env` file in the `backend` directory:
```env
NODE_ENV=development
PORT=8000
MONGODB_URI=mongodb://localhost:27017/fintrackai
JWT_SECRET=your_super_secret_jwt_key
SESSION_SECRET=your_super_secret_session_key
GEMINI_API_KEY=your_google_gemini_api_key
FRONTEND_URL=http://localhost:5173
```
Start the server:
```bash
npm run dev
```

### 2. Frontend Setup
```bash
cd frontendpart
npm install
```
Create a `.env` file in the `frontendpart` directory:
```env
VITE_API_URL=http://localhost:8000/api
```
Start the Vite development server:
```bash
npm run dev
```

---

## Production Deployment

This repository is pre-configured for automated deployments.

### Deploying the Backend (Render)
This repository includes a `render.yaml` Blueprint.
1. Create an account at [Render.com](https://render.com).
2. Go to your Render Dashboard -> **New** -> **Blueprint**.
3. Connect this GitHub repository. Render will automatically detect the backend configuration and deploy it.
4. Add your `.env` variables (MongoDB Atlas URI, Gemini API Key, etc.) in the Render dashboard.

### Deploying the Frontend (Vercel)
This repository is optimized for Vercel.
1. Create an account at [Vercel.com](https://vercel.com).
2. Click **Add New Project** and select this repository.
3. Set the **Root Directory** to `frontendpart`.
4. Add the `VITE_API_URL` environment variable pointing to your deployed Render backend (e.g., `https://fintrackai-api.onrender.com/api`).
5. Click **Deploy**.

---

## Security Hardening (Phase 3 Complete)
- **Rate Limiting:** Prevents brute-force on `/api/auth/*`.
- **JWT Expiration:** Tokens are strictly limited to `1d` (24 hours).
- **Injection Defenses:** Requests sanitized against NoSQL injection and Cross-Site Scripting.
- **XSS Protections:** React's native DOM auto-escaping is verified. No `dangerouslySetInnerHTML` vulnerabilities exist.
- **Dependency Health:** `npm audit fix --force` actively applied ensuring 0 vulnerabilities.
