# 🧭 Nadeem | نديم

> **The digital platform for discovering, booking, and managing licensed tour guides across Saudi Arabia.**

Nadeem connects travelers with certified, licensed local tour guides across the Kingdom of Saudi Arabia. The platform delivers authentic cultural, heritage, and adventure experiences through a modern, responsive, bilingual interface (Arabic RTL & English LTR).

---

## ✨ Key Features

- **🏛️ Tour Discovery & Booking:** Browse verified guides, search by city, spoken languages, and tour specialties, with real-time rate calculations in Saudi Riyal (SAR).
- **🛡️ Official Accreditation & Verification:** Administrative audit workflow reviewing official Ministry of Tourism licenses, national identity documents, and language certificates prior to public listing.
- **📍 Field Operations & Real-Time Coordination:**
  - Secure real-time chat between travelers and assigned guides.
  - Tour Start OTP verification ensuring authenticated check-in.
  - Official Emergency SOS card with Saudi emergency hotlines (Red Crescent, Police, Tourism Support) and direct meeting point navigation.
- **💳 Payments & Guide Earnings:** End-to-end simulated electronic checkout, automatic booking confirmation, fee breakdown, and dedicated guide earnings ledger.
- **🌓 Enterprise-Grade Responsive UI:** Native Dark & Light modes, 100% responsive across mobile, tablet, and desktop form factors, styled with curated typography and Lucide vector icons.

---

## 🛠️ Tech Stack

| Layer | Technologies |
| :--- | :--- |
| **Frontend Framework** | [Next.js 16](https://nextjs.org/) (App Router & Turbopack) + React 19 |
| **Styling & Icons** | Tailwind CSS v4 + Vanilla CSS Design Tokens + Lucide Icons |
| **Backend & Database** | [Supabase](https://supabase.com/) (PostgreSQL + Row-Level Security + Storage + Auth) |
| **Testing & Quality Assurance** | Node Native Test Runner + PGlite (isolated local database suite) + Playwright |

---

## 🚀 Quick Start & Local Setup

### 1. Prerequisites
- **Node.js** 22.0.0 or later (Node 24 recommended, managed via `.nvmrc`)
- **npm** package manager

### 2. Installation & Running
```bash
# Clone the repository
git clone https://github.com/nadeem-2026/nadeem.git
cd nadeem

# Install dependencies
npm ci

# Configure environment variables
cp .env.example .env.local

# Launch the development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser (automatically routes to `/ar` or `/en`).

### 3. Available Scripts
```bash
npm run dev        # Starts local development server
npm run build      # Creates production bundle with Turbopack
npm run start      # Serves production build
npm test           # Executes automated test suite (43 unit & database tests)
npm run lint       # Runs ESLint code quality checks
npm run typecheck  # Validates TypeScript types
npm run check      # Full CI pipeline: lint + typecheck + test + build
```

---

## 📁 Repository Structure

```text
src/
├── app/              # Next.js App Router pages, layouts, and API routes
├── components/       # Reusable UI components, modals, and interactive forms
├── content/          # Bilingual content dictionaries (Arabic / English)
└── lib/              # Core business logic, auth utilities, and Supabase client
supabase/             # SQL database migrations, security policies (RLS), and configurations
tests/                # Unit, integration, database constraint, and E2E specs
nadeem-brand-kit/     # Official brand assets, logos, tokens, and verification checksums
```

---

## 📜 Compliance & Standards
Designed and developed in alignment with Saudi tourism accreditation standards, Ministry of Tourism regulations, and national digital identity guidelines.
