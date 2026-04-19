# FinTrackAI: Advanced Financial Intelligence and Analytics Platform

FinTrackAI is a sophisticated financial technology ecosystem engineered to provide automated transaction tracking, intelligent expense categorization, and actionable financial insights. Powered by the Google Gemini AI engine, the platform transforms raw financial data from bank statements into a structured, analytical overview of spending habits and savings opportunities.

## Production Environment
The application is deployed and accessible at the following production endpoint:
[https://fin-track-ai-secure.vercel.app](https://fin-track-ai-secure.vercel.app)

## Visual Previews
### Landing Page Interface
![FinTrackAI Landing Page](./docs/previews/landing-page-preview.png)
### User Dashboard Interface
![FinTrackAI User Dashboard](./docs/previews/dashboard-preview.png)

## Core Capabilities
### AI-Driven Financial Intelligence
The platform integrates the Google Gemini Pro Large Language Model (LLM) to perform semantic analysis of transaction histories. This engine identifies spending patterns, detects latent subscription models, and provides personalized optimization strategies with strict structural validation.
### ML-Enhanced Categorization Engine
FinTrackAI utilizes a hybrid categorization system combining deterministic rule-based matching with probabilistic scoring models. This engine automatically assigns labels to transactions based on merchant signatures and historical data.
### Advanced Data Ingestion and Validation
The system features a robust ingestion pipeline for CSV and PDF financial records. Every upload undergoes a multi-stage validation process that includes schema verification, row-level integrity checks, and preview generation.
### Secure Payment Gateway and Subscription Management
Integrated with the Razorpay ecosystem, FinTrackAI manages professional subscription tiers (Basic, Pro, and Enterprise). The implementation supports real-time order creation, secure terminal checkout, and server-side HMAC-SHA256 signature verification.
### Dynamic Insights and Analytics
A high-performance dashboard provides real-time visualizations of categorical expenditure, weekly spending velocity, and savings projections. The analytics layer aggregates thousands of data points into high-level summaries.
### Multi-Factor Authentication and Security
The application supports secure onboarding via JWT-based email/password authentication or Google OAuth 2.0 integration. The platform implements several layers of security including XSS protection, rate limiting, and NoSQL injection guardrails.

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

## Local Development Setup
### Backend Service Initialization
1. Navigate to the backend directory: `cd backend && npm install`
2. Configure environmental variables in `.env`:
   - `MONGODB_URI`: Primary database connection string.
   - `JWT_SECRET`: Token signing key.
   - `GEMINI_API_KEY`: Google AI credentials.
   - `RAZORPAY_KEY_ID`: Payment gateway public identifier.
   - `RAZORPAY_KEY_SECRET`: Payment gateway private key.
3. Launch development instance: `npm run dev`

### Frontend Application Initialization
1. Navigate to the client directory: `cd frontendpart && npm install`
2. Define API path in `.env`: `VITE_API_URL`: Backend service endpoint.
3. Launch client: `npm run dev`

## API Documentation
### Authentication Endpoints
- `POST /api/auth/register`: User registration.
- `POST /api/auth/login`: Identity verification.
- `GET /api/auth/google/url`: OAuth synchronization url.
### Payment and Subscription Endpoints
- `POST /api/payment/create-order`: Razorpay order orchestration.
- `POST /api/payment/verify`: Transaction signature verification.
- `GET /api/subscription/status`: Real-time entitlement check.
### Data Ingestion Endpoints
- `POST /api/ingestion/upload`: Secure file ingestion (PDF/CSV).
- `GET /api/ingestion/:id`: Job status and validation summary.
### Analytics Endpoints
- `GET /api/insights/dashboard`: Aggregated financial summary.
- `GET /api/insights/categories`: Categorical spending breakdown.

## Verification and Testing
### Backend Smoke Tests
`cd backend && npm test`
### Frontend Production Build
`cd frontendpart && npm run build`

## Contact and Professional Support
For support or enterprise inquiries:
- **Regional HQ**: Uttarakhand, India
- **Communication Channel**: +91 63996 66608
- **Official Inquiries**: ashish.raj.00099@gmail.com
