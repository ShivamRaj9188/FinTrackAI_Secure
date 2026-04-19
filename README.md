# FinTrackAI: AI-Powered Financial Intelligence

FinTrackAI is a comprehensive financial technology platform designed to provide automated expense tracking and actionable financial insights using the Google Gemini AI engine. The platform is built on the MERN stack (MongoDB, Express, React, Node.js) with a high-performance Vite frontend and secure JWT-based authentication.

## Live Application
The production environment is accessible at the following URL:
[https://fin-track-ai-secure.vercel.app](https://fin-track-ai-secure.vercel.app)

## Preview

### Landing Page

![FinTrackAI landing page preview](./docs/previews/landing-page-preview.png)

### Features Section

![FinTrackAI features section preview](./docs/previews/features-section-preview.png)

---

## Core Capabilities

### AI-Driven Analytics
The platform integrates with the Google Gemini Pro API to perform deep analysis of financial data. It identifies spending patterns, detects redundant subscriptions, and suggests optimization strategies with high precision and anti-hallucination guardrails.

### Payment Gateway & Subscriptions
Integrated with **Razorpay**, FinTrackAI offers a seamless upgrade path from Basic to Pro/Enterprise plans. The system supports full order creation, secure checkout, and automated signature verification to manage user entitlements in real-time.

### Usage Limits & Plan Management
- **Basic (Free)**: 5 statement uploads per month, standard dashboard, basic AI categorization.
- **Pro (₹149/mo)**: Unlimited uploads, advanced AI insights, category trend analysis, savings summaries, and priority support.
- **Enterprise**: Custom multi-user access, API integrations, and dedicated account management.

### Account Management
Secure user onboarding is handled via traditional email/password registration or Google OAuth 2.0. The authentication layer uses signed JWTs and bcrypt password hashing to ensure data privacy and integrity.

### Validated Ingestion and Categorization
The upgraded platform supports additive CSV/PDF ingestion jobs with validation summaries, preview rows, structured MongoDB storage metadata, and lightweight expense categorization using rule-based matching plus TF-IDF-style scoring.

---

## Technical Architecture

### Directory Structure

```text
FinTrackAI_Secure/
├── backend/                # Node.js + Express API
│   ├── authentication/     # Core logic for Login, Signup, and OAuth
│   ├── controllers/        # Business logic for payments, uploads, etc.
│   ├── models/             # Mongoose schemas for data persistence
│   ├── utils/              # Cryptographic helpers and secret management
│   └── server.js           # Service entry point and middleware configuration
│
└── frontendpart/           # React + Vite Client
    ├── src/
    │   ├── api/            # Centralized API abstraction layer
    │   ├── components/     # Reusable UI (PaymentModal, Pricing, etc.)
    │   ├── Dashboard/      # Main application state and analytics
    │   └── App.jsx         # Router and Suspense boundaries
```

---

## Local Development Setup

### 1. Backend Service
1. Navigate to the backend directory and install dependencies:
   ```bash
   cd backend
   npm install
   ```
2. Configure the `.env` file with the following environment variables:
   - `MONGODB_URI`: Connection string for your MongoDB instance.
   - `JWT_SECRET`: Secure string for token signing.
   - `GEMINI_API_KEY`: API key for Google Gemini model access.
   - `RAZORPAY_KEY_ID`: Razorpay public key for checkout.
   - `RAZORPAY_KEY_SECRET`: Razorpay secret for signature verification.
   - `GOOGLE_CLIENT_ID`: OAuth 2.0 client ID for Google Sign-In.
   - `GOOGLE_CLIENT_SECRET`: OAuth 2.0 client secret.
3. Start the service:
   ```bash
   npm run dev
   ```

### 2. Frontend Application
1. Navigate to the frontend directory and install dependencies:
   ```bash
   cd frontendpart
   npm install
   ```
2. Configure the `.env` file in the `frontendpart` directory:
   - `VITE_API_URL`: Path to the backend service (e.g., `http://localhost:8000/api`)
3. Launch the development server:
   ```bash
   npm run dev
   ```

---

## Additive Upgrade Modules

- **Razorpay Integration**: End-to-end payment processing with signature verification.
- **Plan Limits**: Usage tracking and automated blocking for Basic users.
- **Validated Ingestion**: CSV/PDF uploads with preview and warning summaries.
- **Categorization Service**: ML-style scoring and rule-based fallback.
- **Insights Engine**: Savings summaries and categorical expenditure intelligence.

---

## New API Endpoints

### Auth
- `GET /api/auth/google/url`

### Payments & Subscriptions
- `POST /api/payment/create-order`: Create Razorpay order ID.
- `POST /api/payment/verify`: Verify Razorpay signature and activate plan.
- `GET /api/subscription/status`: Fetch current plan usage and expiry.
- `GET /api/user/plan-limits`: Get specific max-limit/usage data.

### Ingestion
- `POST /api/ingestion/upload`
- `GET /api/ingestion/:id`

### Analytics
- `GET /api/insights/summary`
- `GET /api/insights/dashboard`

---

## Verification Commands

### Backend smoke tests
```bash
cd backend
npm test
```

### Frontend production build
```bash
cd frontendpart
npm run build
```

---

## Contact & Support
For support or enterprise inquiries, please contact:
- **Location**: Uttarakhand, India
- **Phone**: +91 63996 66608
- **Email**: ashish.raj.00099@gmail.com

---

## Security and Compliance
- **XSS Protection**: Enforced through Helmet and React-internal sanitization.
- **Rate Limiting**: Protects authentication and payment endpoints.
- **NoSQL Injection Guard**: Specialized middleware sanitizes all MongoDB queries.
- **HMAC Verification**: All payment status updates require valid Razorpay signatures.
