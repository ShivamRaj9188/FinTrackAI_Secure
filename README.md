# FinTrackAI: Advanced Financial Intelligence and Analytics Platform

FinTrackAI is a sophisticated financial technology ecosystem engineered to provide automated transaction tracking, intelligent expense categorization, and actionable financial insights. Powered by the Google Gemini AI engine, the platform transforms raw financial data from bank statements into a structured, analytical overview of spending habits and savings opportunities.

## Production Environment
The application is deployed and accessible at the following production endpoint:
[https://fin-track-ai-secure.vercel.app](https://fin-track-ai-secure.vercel.app)

---

## Visual Previews

### Landing Page Interface
![FinTrackAI landing page preview](./docs/previews/landing-page-preview.png)

### Core Analytics Architecture
![FinTrackAI features section preview](./docs/previews/features-section-preview.png)

---

## Core Capabilities

### AI-Driven Financial Intelligence
The platform integrates the Google Gemini Pro Large Language Model (LLM) to perform deep semantic analysis of transaction histories. This engine identifies spending patterns, detects latent subscription models, and provides personalized optimization strategies. The implementation includes strict structural validation to ensure high precision and eliminate model hallucinations.

### ML-Enhanced Categorization Engine
FinTrackAI utilizes a hybrid categorization system combining deterministic rule-based matching with probabilistic scoring models. This engine automatically assigns labels to transactions based on merchant signatures and historical data, significantly reducing manual data entry for the end user.

### Advanced Data Ingestion and Validation
The system features a robust ingestion pipeline for CSV and PDF financial records. Every upload undergoes a multi-stage validation process that includes schema verification, row-level integrity checks, and preview generation. This ensures that only sanitized and structured data is persisted within the MongoDB environment.

### Secure Payment Gateway and Subscription Management
Integrated with the Razorpay ecosystem, FinTrackAI manages professional subscription tiers (Basic, Pro, and Enterprise). The implementation supports real-time order creation, secure terminal checkout, and server-side HMAC-SHA256 signature verification to ensure secure entitlement management.

### Dynamic Insights and Analytics
A high-performance dashboard provides real-time visualizations of categorical expenditure, weekly spending velocity, and savings projections. The analytics layer aggregates thousands of data points into high-level summaries, enabling users to make data-driven financial decisions.

### Multi-Factor Authentication and Security
The application supports secure onboarding via JSON Web Token (JWT) based email/password authentication or Google OAuth 2.0 integration. Password security is maintained through salted bcrypt hashing. The platform implementing several layers of security including XSS protection, rate limiting, and NoSQL injection guardrails.

---

## Technical Architecture

### Tech Stack
- **Frontend**: React.js with Vite, optimized for high-performance rendering.
- **Backend**: Node.js and Express.js, utilizing a modular controller-service architecture.
- **Database**: MongoDB with Mongoose ODM for flexible document-based persistence.
- **AI/ML**: Google Gemini Pro API for semantic financial analysis.
- **Payments**: Razorpay API for secure global transactions.

### System Directory Structure
```text
FinTrackAI_Secure/
├── backend/                # Server-side logic and API infrastructure
│   ├── authentication/     # Identity management and OAuth flows
│   ├── controllers/        # Domain-specific business logic
│   ├── middleware/         # Security, rate limiting, and plan validation
│   ├── models/             # Data structure definitions (Mongoose)
│   ├── services/           # External API integrations (AI, Email)
│   └── server.js           # Main application entry point
│
└── frontendpart/           # Client-side interface
    ├── src/
    │   ├── api/            # Centralized communication layer
    │   ├── components/     # Modular UI architecture
    │   ├── Dashboard/      # Analytics and state management
    │   └── App.jsx         # Component orchestration and routing
```

---

## Local Development Setup

### Backend Service Initialization
1. Navigate to the backend directory:
   ```bash
   cd backend
   npm install
   ```
2. Configure environmental variables in `.env`:
   - `MONGODB_URI`: Primary database connection string.
   - `JWT_SECRET`: Token signing key.
   - `GEMINI_API_KEY`: Google AI credentials.
   - `RAZORPAY_KEY_ID`: Payment gateway public identifier.
   - `RAZORPAY_KEY_SECRET`: Payment gateway private key.
   - `GOOGLE_CLIENT_ID`: OAuth 2.0 client ID.
   - `GOOGLE_CLIENT_SECRET`: OAuth 2.0 client secret.
3. Launch development instance:
   ```bash
   npm run dev
   ```

### Frontend Application Initialization
1. Navigate to the client directory:
   ```bash
   cd frontendpart
   npm install
   ```
2. Define API path in `.env`:
   - `VITE_API_URL`: Backend service endpoint.
3. Launch client:
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

### Payment and Subscription Endpoints
- `POST /api/payment/create-order`: Razorpay order orchestration.
- `POST /api/payment/verify`: Transaction signature verification.
- `GET /api/subscription/status`: Real-time entitlement check.
- `GET /api/user/plan-limits`: Usage tracking and bandwidth check.

### Data Ingestion Endpoints
- `POST /api/ingestion/upload`: Secure file ingestion (PDF/CSV).
- `GET /api/ingestion/:id`: Job status and validation summary.

### Analytics Endpoints
- `GET /api/insights/dashboard`: Aggregated financial summary.
- `GET /api/insights/categories`: Categorical spending breakdown.

---

## Verification and Testing
### Backend Smoke Tests
```bash
cd backend
npm test
```
### Frontend Production Build
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
