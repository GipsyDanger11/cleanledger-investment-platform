# CleanLedger Investment Platform — Comprehensive Design Document

> **Stitch Project ID:** `16512632333525978420`
> **Created:** April 18, 2026  · **Last Updated:** April 18, 2026
> **Project Type:** TEXT_TO_UI_PRO · **Device Target:** Desktop · **Visibility:** Private
> **Design System:** Linear Ledger (`assets/c886c51eada64cedbc052cffd523c670`)
> **MERN Stack Version:** This document guides the full-stack implementation of the CleanLedger UI design.

---

## Table of Contents

1. [Project Overview](#1-project-overview)
2. [Design Philosophy](#2-design-philosophy)
3. [Design System — Linear Ledger](#3-design-system--linear-ledger)
   - [Color Palette](#31-color-palette)
   - [Typography](#32-typography)
   - [Elevation & Depth](#33-elevation--depth)
   - [Component Patterns](#34-component-patterns)
   - [Interaction Signatures](#35-interaction-signatures)
4. [Screen Inventory](#4-screen-inventory)
5. [Screen-by-Screen Analysis](#5-screen-by-screen-analysis)
   - [Screen 1 — Landing Page](#51-screen-1--landing-page)
   - [Screen 2 — Investor Dashboard](#52-screen-2--investor-dashboard)
   - [Screen 3 — Startup Registry (Marketplace)](#53-screen-3--startup-registry-marketplace)
   - [Screen 4 — Startup Details](#54-screen-4--startup-details-centered)
   - [Screen 5 — Audit Trail](#55-screen-5--audit-trail)
   - [Screen 6 — Onboarding & KYC](#56-screen-6--onboarding--kyc)
6. [Navigation Architecture](#6-navigation-architecture)
7. [User Flows](#7-user-flows)
8. [Design Principles Analysis](#8-design-principles-analysis)
9. [MERN Stack Architecture](#9-mern-stack-architecture)
10. [API Design](#10-api-design)
11. [MongoDB Schema Design](#11-mongodb-schema-design)
12. [React Component Tree](#12-react-component-tree)
13. [Technical Observations](#13-technical-observations)
14. [Recommendations & Next Steps](#14-recommendations--next-steps)

---

## 1. Project Overview

**CleanLedger Investment Platform** is a premium, desktop-first fintech application designed for high-stakes private market investment. It provides institutional-grade transparency tools for investors and startups, centered on the concept of an **immutable digital ledger** — a platform where every capital event is cryptographically recorded and publicly auditable.

### Core Value Proposition

| Pillar | Description |
|--------|-------------|
| **Transparency** | Blockchain-anchored audit trails for every transaction |
| **Trust** | KYB/ESG-verified startup registry with trust scoring |
| **Clarity** | Precision-grade data density with zero visual noise |
| **Control** | DAO-consensus milestone-based fund release mechanisms |

### Target Users

- **Investors** — Portfolio managers, angel investors, and institutional funds evaluating and tracking early-stage private market positions
- **Startups** — Verified entities raising capital through milestone-gated tranches
- **Compliance Officers** — Auditors requiring immutable ledger evidence for regulatory or LP reporting

---

## 2. Design Philosophy

### Creative North Star: **"Precision-Grade Minimalism"**

The design philosophy is codified in the **"Architectural Ledger"** concept. The platform is deliberately positioned against the "friendly SaaS" aesthetic — instead targeting the experience of a **premium Swiss-engineered financial instrument**: utilitarian in function, luxurious in its obsessive attention to alignment, tonal depth, and typographic rhythm.

### Key Philosophical Tenets

#### The "No-Line" Rule
> *1px solid borders are strictly forbidden for sectioning.*

All visual structure is achieved through **background color shifts** alone. A card is not outlined — it is a `surface_container_lowest` layer sitting atop a `surface_container_low` background. This eliminates visual "vibration" in high-density data environments.

#### Intentional Asymmetry
The layout deliberately breaks from rigid, symmetrical grid-templates. Primary navigation anchors left; utility actions extend to the extreme right — creating a spanning "editorial" layout that feels bespoke rather than templated.

#### Tonal Hierarchy
Color is not decorative — it is structural. The palette operates on five distinct surface tiers used to encode **nested importance** and visual depth without any shadows or borders.

#### Precision Typography
Data is treated with the same care as editorial design. Monospace/tabular lining (`tnum`) is required for all numerical values to guarantee perfect column alignment across financial tables.

---

## 3. Design System — Linear Ledger

**System Name:** Linear Ledger
**Asset ID:** `c886c51eada64cedbc052cffd523c670`
**Color Mode:** Light
**Color Variant:** FIDELITY
**Spacing Scale:** 1x
**Roundness:** ROUND_FOUR (4px)

---

### 3.1 Color Palette

#### Primary Brand Colors (Override)

| Token | Hex | Role |
|-------|-----|------|
| Primary Override | `#1E293B` | Deep Navy — core brand, sidebar, CTAs |
| Secondary Override | `#64748B` | Slate Gray — secondary text, borders |
| Tertiary Override | `#22C55E` | Success Green — active indicators, micro-success state |
| Neutral Override | `#64748B` | Neutral surfaces |

#### Surface Hierarchy (5 Tiers)

| Tier | Token | Hex | Usage |
|------|-------|-----|-------|
| 1 — Base | `surface` | `#F8F9FF` | Page background |
| 2 — Structural | `surface_container_low` | `#EFF4FF` | Section backgrounds |
| 3 — Cards | `surface_container` | `#E5EEFF` | Standard cards |
| 4 — Elevated | `surface_container_high` | `#DCE9FF` | Hover states, elevated cards |
| 5 — Highest | `surface_container_highest` | `#D3E4FE` | Header rows in data tables |
| 5 — Pure White | `surface_container_lowest` | `#FFFFFF` | Actionable modules, inputs |
| Sidebar | `primary_container` | `#1E293B` | Left navigation sidebar |

#### Semantic Colors

| Token | Hex | Role |
|-------|-----|------|
| `on_surface` | `#0B1C30` | Primary text |
| `on_surface_variant` | `#45474C` | Secondary text, metadata |
| `on_primary` | `#FFFFFF` | Text on dark CTAs |
| `on_primary_container` | `#8590A6` | Sidebar icon color |
| `on_tertiary_container` | `#00A64A` | Success state text |
| `tertiary_fixed` | `#6BFF8F` | Active indicator bar, micro-success glow |
| `error` | `#BA1A1A` | Error text (never bg tint) |
| `outline` | `#75777D` | Ghost borders (at 20% opacity max) |
| `outline_variant` | `#C5C6CD` | Divider fallback (at 10-15% opacity) |

#### Color Application Rules

```
DO  — Background tonal shifts to define sections
DO  — Use tertiary_fixed (#6BFF8F) as 2px active nav bar indicator
DO  — Use glassmorphism (semi-transparent surface + 12px backdrop-blur) for overlays
DO  — Gradient CTAs: primary to primary_container (metallic sheen)

DON'T — 1px solid border for layout sectioning
DON'T — Drop shadows (use ambient only: 32-64px blur, 4-6% opacity, navy-tinted)
DON'T — Red background tint for error states
DON'T — Corner rounding beyond 2px on inputs/buttons
```

---

### 3.2 Typography

**Font Family:** Inter (all three contexts — Headline, Body, Label)
**Google Fonts Import:** `https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap`
**Configuration:** `ROUND_FOUR` roundness across components

| Level | Scale | Size | Weight | Use Case |
|-------|-------|------|--------|----------|
| Display | `display-md` | 2.25rem | 700 | Hero headlines, editorial anchors |
| Headline | `headline-sm` | 1.5rem | 600 | Section titles, panel headers |
| Title | `title-md` | 1.125rem | 600 | Card headers, module titles |
| Body | `body-md` | 0.875rem | 400 | General body text |
| Body Dense | `body-sm` | 0.75rem | 400 | **Data table content — density-first** |
| Label | `label-md` | 0.75rem | 500 | Metadata, tags, nav labels |
| Label Small | `label-sm` | 0.625rem | 400 | Timestamps, micro-copy |

#### Numerical Data Rule
> All currency and numerical columns must use `Inter` with **tabular lining (`font-variant-numeric: tabular-nums`)** to ensure perfect column alignment in ledger and dashboard tables.

#### Tonal Text Hierarchy
- Primary data → `on_surface` (#0B1C30)
- Secondary labels → `on_surface_variant` (#45474C)
- Meta / timestamps → `outline` (#75777D)

---

### 3.3 Elevation & Depth

Depth is purely tonal — no traditional Material-style drop shadows.

| Scenario | Technique |
|----------|-----------|
| Card on page | `surface_container_lowest` on `surface_container_low` |
| Scrollable list header | `surface_container_highest` above `surface_container_low` |
| Hover state | Background: `surface_container_low` → `surface_container_high` |
| Floating modal / tooltip | Glassmorphism + ambient shadow (32-64px blur, 4-6%, `#091426` tinted) |
| Sidebar | `primary_container` (#1E293B) flat on `surface` |

#### Ambient Shadow Spec (Modals Only)
```css
box-shadow: 0 8px 48px 0 rgba(9, 20, 38, 0.05);
```

#### Glassmorphism Spec (Tooltips, Overlays)
```css
backdrop-filter: blur(12px);
background: rgba(248, 249, 255, 0.75);
border: 1px solid rgba(197, 198, 205, 0.15); /* Ghost border only */
```

---

### 3.4 Component Patterns

#### Buttons

| Type | Style | CSS Notes |
|------|-------|-----------|
| Primary | Background `#091426`, text `#FFFFFF`, 2px radius | Gradient variant: `#091426` → `#1E293B` |
| Secondary | Ghost — no background, `outline` at 20% opacity | `border: 1px solid rgba(117,119,125,0.2)` |
| Tertiary | Text-only in `primary`, `label-md` bold | No background, no border |

#### Input Fields
- **Default:** Background `surface_container_low` (#EFF4FF), 2px radius
- **Focus:** Background swaps to `surface_container_lowest` (#FFFFFF) + 1px `primary` (#091426) border
- **Error:** `error` (#BA1A1A) border + text only — **no background tint**
- **Placeholder:** `on_surface_variant` (#45474C) at 60% opacity

#### Sidebar (Ledger Nav)
- **Width:** Slim 64–80px
- **Background:** `primary_container` (#1E293B)
- **Icons:** 20px thin-stroke Material Symbols in `on_primary_container` (#8590A6)
- **Active State:** 2px `tertiary_fixed` (#6BFF8F) vertical bar on the icon's left edge
- **Navigation Items:** Dashboard · Marketplace · Portfolio · Ledger · Settings

#### Data Tables & Lists
- No divider lines between rows — **forbidden**
- Separation via `1.5rem` vertical whitespace OR alternating row `surface_container_low`/`surface_container_lowest` tints
- Primary metric in `headline-md`, secondary metadata in `label-sm` bottom-right
- All number cells: `font-variant-numeric: tabular-nums`

#### Status Chips
- **Active/Verified:** `primary_container` (#1E293B) background + `on_primary_container` (#8590A6) text + `full` radius
- **Success:** `tertiary_fixed` (#6BFF8F) background + `on_tertiary_fixed` (#002109) text
- **Filter Chips:** `secondary_container` (#D0E1FB) background + `on_secondary_container` (#54647A) text

#### Cards
- Background: `surface_container_lowest` (#FFFFFF)
- Parent background: `surface_container_low` (#EFF4FF)
- Border-radius: 4px (`ROUND_FOUR`)
- No border, no shadow — tonal contrast only

---

### 3.5 Interaction Signatures

| Interaction | Behavior | CSS Transition |
|-------------|----------|----------------|
| **Tonal Hover** | List item bg: `surface_container_low` → `surface_container_high` | `background 150ms ease` |
| **Micro-Success** | Text: `#00A64A`; 2px glow `#6BFF8F` around action button | `box-shadow: 0 0 0 2px #6BFF8F` |
| **Focus Swap** | Input bg: `surface_container_low` → `surface_container_lowest` + `primary` border | `background 100ms, border 100ms` |
| **Overlay Entry** | Glassmorphism panel fades in | `opacity 200ms ease, backdrop-filter 200ms` |
| **Active Nav Bar** | 2px `tertiary_fixed` bar slides in from left | `transform 150ms ease` |

---

## 4. Screen Inventory

| # | Screen ID | Title | Dimensions | Canvas X | Status |
|---|-----------|-------|------------|----------|--------|
| 1 | `ad3b293e69754e5db46255abaa07f5e6` | CleanLedger \| 3D Landing Page | 2560 × 3738px | 10432 | ✅ Visible |
| 2 | `c95a59acc7f4426c8060b92ed30bb8b9` | Investor Dashboard | 2560 × 2048px | 1024 | ✅ Visible |
| 3 | `03e2e4cf1a7948a1a49edba8d10c85e2` | Startup Registry | 2560 × 2048px | 2368 | ✅ Visible |
| 4 | `4e619e2ed97a45b0b04418582c7284c9` | Startup Details (Centered) | 2560 × 2048px | 7744 | ✅ Visible |
| 5 | `892468dd506747c1a6f99179704b8619` | Audit Trail | 2560 × 2048px | 5056 | ✅ Visible |
| 6 | `f02d70ab65054e5a8331a6fe12df4873` | Onboarding & KYC | 2560 × 2482px | 3712 | ✅ Visible |
| — | `652fba8648464f63a528dc6c96815256` | Hidden variant A | 1280 × 2161px | 1344 | 🔒 Hidden |
| — | `b918d28220dd433b982b24c51a785f26` | Hidden variant B | 1280 × 1401px | 0 | 🔒 Hidden |
| — | `0958166669bc43628b2031f45dcd9ea8` | Hidden variant C | 1280 × 1418px | 0 | 🔒 Hidden |

> Three hidden screens likely represent earlier drafts or mobile-adapted variants explored during iteration.

---

## 5. Screen-by-Screen Analysis

---

### 5.1 Screen 1 — Landing Page

**Screen ID:** `ad3b293e69754e5db46255abaa07f5e6`
**Page Title:** *"CleanLedger | Precision-Grade Infrastructure"*
**Dimensions:** 2560 × 3738px (tall, scrollable marketing page)
**Route:** `/` (public)

#### Purpose
The public-facing marketing page — first touchpoint for prospective investors and startups. Establishes brand authority and converts visitors to registered users.

#### Content Sections

| Section | Headline | Description |
|---------|----------|-------------|
| Hero | *"Precision-Grade Infrastructure for Private Markets."* | Brand statement + sub-headline about digital ledger precision |
| Architectural Overview | *"Intentional hierarchy guiding the eye through complex datasets."* | Platform capability overview |
| Real-Time Ledger Feed | — | Live feed visualization of ledger events |
| Total Managed Value | — | Platform-wide AUM / total capital statistic |
| Cryptographic Verification | *"Every transaction is anchored to an immutable ledger utilizing zero-knowledge proofs…"* | Trust & security pitch |
| Capital Allocation | — | Visual allocation breakdown |
| Footer | Terms of Service · Privacy Policy · Contact Support | Legal and support links |

#### Header Navigation
- Portfolio · Insights · **[Get Started →]** (CTA)

#### Key Design Observations
- **3D** descriptor suggests animated/3D hero (3D ledger data visualization, likely Three.js or CSS 3D)
- Extremely long vertical scroll (3738px) — editorial-style progressive disclosure
- Hero sub-headline: *"A digital ledger engineered like a premium timepiece"*
- Glassmorphism panels for overlay data widgets and floating stat cards

---

### 5.2 Screen 2 — Investor Dashboard

**Screen ID:** `c95a59acc7f4426c8060b92ed30bb8b9`
**Page Title:** *"CleanLedger - Investor Dashboard"*
**Dimensions:** 2560 × 2048px
**Route:** `/dashboard` (authenticated)

#### Purpose
Primary post-login destination for investors. At-a-glance summary of portfolio performance, active investments, tranche activity, and real-time notifications.

#### Key Metrics Panels

| Metric | Description |
|--------|-------------|
| **Portfolio Value** | Total current market value of the investor's holdings |
| **Total Tranches Released** | Count / sum of milestone-gated capital disbursements completed |
| **Avg Startup Trust Score** | Composite score across all invested startups |

#### Content Sections

| Section | Description |
|---------|-------------|
| Active Investments | Table of current positions: startup name, tranche status, trust score |
| Notification Log | Real-time event feed — KYB approvals, milestone completions, ledger entries |

#### Primary Sidebar Navigation

| Icon (Material Symbol) | Label | Route |
|------------------------|-------|-------|
| `dashboard` | Dashboard | `/dashboard` |
| `storefront` | Marketplace | `/marketplace` |
| `pie_chart` | Portfolio | `/portfolio` |
| `account_balance` | Ledger | `/ledger` |
| `settings` | Settings | `/settings` |

#### Bottom Navigation Strip

| Icon | Label | Route |
|------|-------|-------|
| `home` | Home | `/dashboard` |
| `search` | Market | `/marketplace` |
| `history_edu` | Ledger | `/ledger` |
| `person` | User | `/profile` |

#### Key Design Observations
- Dual navigation: **slim left sidebar** (primary) + **bottom nav strip** (contextual mobile-inspired)
- "Trust Score" is a proprietary risk-scoring metric unique to CleanLedger
- "Tranches Released" reflects the milestone-based fund disbursement core mechanic

---

### 5.3 Screen 3 — Startup Registry (Marketplace)

**Screen ID:** `03e2e4cf1a7948a1a49edba8d10c85e2`
**Page Title:** *"CleanLedger - Marketplace"*
**Dimensions:** 2560 × 2048px
**Route:** `/marketplace` (authenticated)

#### Purpose
Investment discovery layer — a curated catalog of verified startups available for investment.

**Page Headline:** *"Startup Registry"*
**Sub-headline:** *"Discover and evaluate high-potential startups verified through the CleanLedger framework. Filter by ESG criteria and risk profiles."*

#### Key Features
- **ESG Filtering** — Filter by Environmental, Social, and Governance criteria
- **Risk Profile Filtering** — Risk-tier segmentation for portfolio construction
- **Verification Badges** — Only CleanLedger-framework-verified startups listed
- **Card-Based Layout** — Startup cards: name, sector, funding progress, trust score

#### Key Design Observations
- "Registry" vs "Marketplace" signals institutional credibility over commerce
- ESG filtering targets impact/ESG-conscious LPs and fund managers
- Consistent sidebar navigation — core authenticated section

---

### 5.4 Screen 4 — Startup Details (Centered)

**Screen ID:** `4e619e2ed97a45b0b04418582c7284c9`
**Page Title:** *"CleanLedger - Portfolio"*
**Dimensions:** 2560 × 2048px
**Route:** `/marketplace/:startupId` (authenticated)

#### Purpose
Detailed investment profile for a single startup. Sample: **"Aura Wind Energy"**.

#### Sample Content: Aura Wind Energy

| Field | Value |
|-------|-------|
| **Name** | Aura Wind Energy |
| **Sector** | Clean Energy — Wind Infrastructure |
| **Geography** | Northern Europe |
| **Total Raised** | $4.2M |
| **Funding Target** | $5.0M |
| **Backers** | 124 investors |
| **Verification** | Verified Entity ✓ |

#### Verification Documents

| Document | Status |
|----------|--------|
| KYB Clear | ✅ Verified (external link) |
| ESG Audit '23 | ✅ Verified (external link) |

#### Milestone Roadmap

| Phase | Title | Status | Notes |
|-------|-------|--------|-------|
| Phase 1 | Site Acquisition | ✅ Complete | Land rights secured (50 acres, coastal). Environmental assessments done. |
| Phase 2 | Turbine Procurement | 🔄 In Progress | Contracts with Vesta for 5× V162-6.2 MW turbines. Pending board approval. |
| Phase 3 | Grid Connection | ⏳ Pending | Substation installation + national grid tie-in |

#### Action Required Alert
> *"Milestone 2 requires DAO consensus to release remaining funds."*

The **DAO consensus mechanic** — fund tranches are released only upon Decentralized Autonomous Organization member consensus. This is the core governance feature.

#### Key Design Observations
- Milestone roadmap tied directly to fund disbursement — visual progress system
- "Centered" layout = single-column modal-style (vs. sidebar-heavy dashboard)
- ESG Audit document artifact signals regulated/institutional capital targeting

---

### 5.5 Screen 5 — Audit Trail

**Screen ID:** `892468dd506747c1a6f99179704b8619`
**Page Title:** *"CleanLedger - Immutable Audit Trail"*
**Dimensions:** 2560 × 2048px
**Route:** `/ledger` (authenticated)

#### Purpose
The compliance and transparency centerpiece of the platform.

**Page Headline:** *"Immutable Audit Trail"*
**Sub-headline:** *"Bank-grade cryptographic ledger. All transactions are permanently recorded, hashed, and chained to ensure absolute data integrity."*

#### Transaction Types Recorded

| Transaction Type | Description |
|-----------------|-------------|
| **Capital Release** | Disbursement from escrow to startup upon milestone verification |
| **Funding Allocation** | Initial capital allocation from investor to a startup |
| **Inter-Account Transfer** | Fund movements between wallet/ledger accounts |

#### Technical Characteristics
- Every entry **cryptographically hashed and chained** (blockchain-style linked list)
- Transactions are **permanent** — no deletion or modification possible
- Utilizes **zero-knowledge proofs** for verification without revealing confidential terms
- "Bank-grade" security language targets regulated investors

#### Key Design Observations
- Most data-dense screen — `body-sm` tabular data with `tnum` alignment mandatory
- Hash display fields use monospace font for cryptographic strings
- Filtering & search: by date range, transaction type, startup, status
- Export functionality for regulatory reporting

---

### 5.6 Screen 6 — Onboarding & KYC

**Screen ID:** `f02d70ab65054e5a8331a6fe12df4873`
**Page Title:** *"CleanLedger - Onboarding"*
**Dimensions:** 2560 × 2482px (multi-step form)
**Route:** `/onboarding` (unauthenticated)

#### Purpose
The unauthenticated entry point for new users.

**Page Headline:** *"Precision-grade infrastructure for private markets."*
**Sub-headline:** *"Establish absolute clarity over your cap table, investment portfolio, and compliance documentation."*

#### Onboarding Flow

| Step | Name | Description |
|------|------|-------------|
| 1 | Initialize Account | Secure access requires identity verification |
| 2 | Entity Verification | Upload incorporation documents or government-issued ID |
| 3 | Terms Acceptance | Terms of Service + Data Processing Agreement |
| 4 | Authenticate | Link to authentication flow |

#### Verification Requirements
- **For Companies/Entities:** Official Incorporation Documents
- **For Individuals:** Government-issued ID
- **Purpose:** KYC/AML compliance review

#### Legal Documents Presented
1. Terms of Service
2. Data Processing Agreement (GDPR-level data handling)

#### Key Design Observations
- **DPA** signals the platform handles sensitive PII targeting EU-regulated investors
- Single-column centered layout — **no sidebar** (unauthenticated state)
- "Entity Verification" implies support for individuals AND corporate entities (SPVs, funds, family offices)
- Taller page (2482px) — multi-section onboarding wizard with document upload UI

---

## 6. Navigation Architecture

### Sidebar Navigation (Authenticated — Desktop)

```
┌─────────────────────┐
│     CleanLedger     │  ← Brand mark / logo
├─────────────────────┤
│  🏠  Dashboard      │  ← Investor Dashboard (default post-login)
│  🏪  Marketplace    │  ← Startup Registry
│  🥧  Portfolio      │  ← Startup Details / Portfolio View
│  🏦  Ledger         │  ← Audit Trail
│  ⚙️  Settings       │  ← User settings / preferences
└─────────────────────┘
```

### Bottom Navigation Strip (Contextual)

```
[  Home  ]  [  Market  ]  [  Ledger  ]  [  User  ]
```

### Header Navigation (Public / Landing)

```
[ Portfolio ]  [ Insights ]  [ ← CTA: Get Started ]
```

### Screen Flow Map

```
Landing Page ──────► Onboarding & KYC
                           │
                           ▼
                   Investor Dashboard ◄──── (Default post-login)
                     │         │
              ┌──────┘         └──────────┐
              ▼                           ▼
      Startup Registry              Audit Trail
      (Marketplace)                 (Ledger View)
              │
              ▼
      Startup Details
      (Centered / Portfolio)
```

---

## 7. User Flows

### Flow 1: New Investor Onboarding
```
Landing Page → [Get Started / Authenticate here]
→ Onboarding & KYC Screen
  → Step 1: Initialize Account
  → Step 2: Upload Entity Documents (KYC/KYB)
  → Step 3: Accept Terms of Service + DPA
  → Step 4: [Authenticate] → Investor Dashboard
```

### Flow 2: Investment Discovery
```
Investor Dashboard → [Marketplace tab]
→ Startup Registry
  → Filter by ESG / Risk Profile
  → Browse Verified Startup Cards
  → [Select Startup] → Startup Details (Centered)
    → Review Milestone Roadmap
    → Check KYB / ESG Documents
    → [Invest / Express Interest]
```

### Flow 3: Portfolio Monitoring
```
Investor Dashboard
  → Review: Portfolio Value / Trust Score / Tranches Released
  → [Active Investment] → Startup Details
    → Check Milestone Progress
    → [Participate in DAO Vote for Tranche Release]
```

### Flow 4: Compliance & Audit
```
Investor Dashboard → [Ledger tab]
→ Audit Trail
  → Filter by: Date / Transaction Type / Startup
  → Review: Capital Release / Funding Allocation / Transfers
  → Export for regulatory reporting
```

---

## 8. Design Principles Analysis

### Strengths

| Principle | Assessment |
|-----------|------------|
| **Brand Consistency** | Exceptional — "Architectural Ledger" philosophy is coherent across all 6 screens |
| **Color Discipline** | Strong — All surfaces operate within the defined 5-tier tonal hierarchy |
| **Typography** | Precise — Inter throughout, `body-sm` for data density, `tnum` for numbers |
| **Navigation** | Consistent — Sidebar icons + bottom strip on all authenticated screens |
| **Trust Signaling** | Excellent — KYB, ESG, DAO, ZK-proofs, immutable trail reinforce institutional credibility |
| **Compliance Awareness** | Strong — DPA, KYC, entity verification signal regulatory maturity |

### Areas for Improvement

| Observation | Detail |
|-------------|--------|
| **Mobile Coverage** | 3 hidden screens suggest mobile variants exist but are in draft |
| **Dark Mode** | Design system is locked to Light mode only |
| **Loading States** | No skeleton/loading screen designed |
| **Error States** | No error screen in the screen inventory |
| **Empty States** | No empty state designs for zero-investment scenarios |
| **Accessibility** | Ghost borders and low-opacity outlines may need WCAG AA contrast validation |

---

## 9. MERN Stack Architecture

### Project Structure

```
cleanledger-investment-platform/
│
├── client/                         # React Frontend (Vite)
│   ├── public/
│   │   └── favicon.ico
│   ├── src/
│   │   ├── assets/                 # Static assets, icons, images
│   │   ├── components/             # Reusable UI components
│   │   │   ├── layout/
│   │   │   │   ├── Sidebar.jsx
│   │   │   │   ├── BottomNav.jsx
│   │   │   │   ├── Header.jsx
│   │   │   │   └── AppLayout.jsx
│   │   │   ├── ui/
│   │   │   │   ├── Button.jsx
│   │   │   │   ├── Card.jsx
│   │   │   │   ├── Chip.jsx
│   │   │   │   ├── Input.jsx
│   │   │   │   ├── Modal.jsx
│   │   │   │   ├── StatCard.jsx
│   │   │   │   ├── DataTable.jsx
│   │   │   │   ├── MilestoneBar.jsx
│   │   │   │   ├── TrustScoreBadge.jsx
│   │   │   │   ├── AuditEntry.jsx
│   │   │   │   └── StartupCard.jsx
│   │   │   └── forms/
│   │   │       ├── KYCUpload.jsx
│   │   │       ├── InvestmentForm.jsx
│   │   │       └── DAOVoteDialog.jsx
│   │   ├── pages/
│   │   │   ├── LandingPage.jsx         # Screen 1 — /
│   │   │   ├── Dashboard.jsx           # Screen 2 — /dashboard
│   │   │   ├── Marketplace.jsx         # Screen 3 — /marketplace
│   │   │   ├── StartupDetails.jsx      # Screen 4 — /marketplace/:id
│   │   │   ├── AuditTrail.jsx          # Screen 5 — /ledger
│   │   │   ├── Onboarding.jsx          # Screen 6 — /onboarding
│   │   │   ├── Portfolio.jsx           # /portfolio
│   │   │   ├── Settings.jsx            # /settings
│   │   │   └── NotFound.jsx            # 404
│   │   ├── context/
│   │   │   ├── AuthContext.jsx         # Authentication state
│   │   │   └── InvestmentContext.jsx   # Investment/portfolio state
│   │   ├── hooks/
│   │   │   ├── useAuth.js
│   │   │   ├── usePortfolio.js
│   │   │   ├── useStartups.js
│   │   │   └── useAuditTrail.js
│   │   ├── utils/
│   │   │   ├── formatCurrency.js
│   │   │   ├── formatDate.js
│   │   │   ├── trustScoreCalc.js
│   │   │   └── apiClient.js
│   │   ├── styles/
│   │   │   ├── tokens.css              # CSS custom properties (design tokens)
│   │   │   ├── typography.css          # Type scale + tabular nums
│   │   │   ├── components.css          # Component base styles
│   │   │   └── index.css               # Global reset + base
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── vite.config.js
│   └── package.json
│
├── server/                         # Express.js Backend
│   ├── config/
│   │   ├── db.js                   # MongoDB connection (Mongoose)
│   │   ├── env.js                  # Environment variables
│   │   └── cors.js                 # CORS configuration
│   ├── models/
│   │   ├── User.js                 # Investor / Admin user
│   │   ├── Startup.js              # Startup entity
│   │   ├── Investment.js           # Investment record
│   │   ├── Milestone.js            # Startup milestone
│   │   ├── AuditEntry.js           # Immutable ledger entry
│   │   ├── Transaction.js          # Capital transaction
│   │   └── DAOVote.js              # DAO consensus vote
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── dashboardController.js
│   │   ├── startupController.js
│   │   ├── investmentController.js
│   │   ├── auditController.js
│   │   ├── milestoneController.js
│   │   └── daoController.js
│   ├── routes/
│   │   ├── authRoutes.js           # POST /api/auth/*
│   │   ├── dashboardRoutes.js      # GET /api/dashboard/*
│   │   ├── startupRoutes.js        # GET|POST /api/startups/*
│   │   ├── investmentRoutes.js     # GET|POST /api/investments/*
│   │   ├── auditRoutes.js          # GET /api/audit/*
│   │   ├── milestoneRoutes.js      # GET|PUT /api/milestones/*
│   │   └── daoRoutes.js            # POST /api/dao/*
│   ├── middleware/
│   │   ├── authMiddleware.js       # JWT verification
│   │   ├── kycMiddleware.js        # KYC status gate
│   │   ├── errorHandler.js         # Global error handler
│   │   ├── rateLimiter.js          # Express rate limiting
│   │   └── logger.js               # Morgan / custom logger
│   ├── services/
│   │   ├── hashService.js          # SHA-256 / audit chain hashing
│   │   ├── trustScoreService.js    # Trust score computation engine
│   │   ├── notificationService.js  # Real-time notifications (Socket.IO)
│   │   └── kycService.js           # KYC document validation
│   ├── utils/
│   │   ├── generateToken.js        # JWT generation
│   │   ├── pagination.js           # Cursor-based pagination
│   │   └── validators.js           # Input validation schemas (Joi/Zod)
│   ├── app.js                      # Express app setup
│   └── server.js                   # HTTP server entry point
│
├── .env.example
├── .gitignore
├── package.json                    # Root package (concurrently)
└── DESIGN.md                       # ← This file
```

### Technology Stack

| Layer | Technology | Version | Rationale |
|-------|-----------|---------|-----------|
| **Frontend** | React | 18.x | Component-based, hooks-first |
| **Build Tool** | Vite | 5.x | Fast HMR, modern ESM |
| **Routing** | React Router | 6.x | Nested routes, protected routes |
| **State** | React Context + useReducer | — | Lightweight, no Redux overhead |
| **HTTP Client** | Axios | 1.x | Interceptors for JWT headers |
| **Real-time** | Socket.IO Client | 4.x | Live notification log |
| **Icons** | Material Symbols (Google) | — | Used in Stitch design |
| **Font** | Google Fonts — Inter | — | Design system prescribed |
| **Backend** | Node.js + Express | 20.x / 4.x | RESTful API server |
| **Database** | MongoDB + Mongoose | 7.x / 8.x | Document model for nested data |
| **Auth** | JWT + bcryptjs | — | Stateless authentication |
| **Real-time** | Socket.IO | 4.x | Notification push |
| **Validation** | Joi | 17.x | Request body validation |
| **File Upload** | Multer | — | KYC document uploads |
| **Security** | Helmet, cors, express-rate-limit | — | Production hardening |
| **Env** | dotenv | — | Environment management |

---

## 10. API Design

### Base URL: `/api/v1`

#### Authentication Routes (`/api/v1/auth`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/register` | Register new investor/startup | ❌ |
| `POST` | `/login` | Login with email/password | ❌ |
| `POST` | `/logout` | Invalidate session | ✅ |
| `GET` | `/me` | Get current user profile | ✅ |
| `POST` | `/kyc/upload` | Upload KYC documents | ✅ |
| `GET` | `/kyc/status` | Check KYC verification status | ✅ |

#### Dashboard Routes (`/api/v1/dashboard`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/summary` | Portfolio value, tranches, avg trust score | ✅ |
| `GET` | `/active-investments` | Current investment positions | ✅ |
| `GET` | `/notifications` | Notification log (paginated) | ✅ |

#### Startup Routes (`/api/v1/startups`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/` | List all verified startups (paginated, filtered) | ✅ |
| `GET` | `/:id` | Get startup details | ✅ |
| `POST` | `/` | Register new startup | ✅ (admin) |
| `PUT` | `/:id` | Update startup info | ✅ (admin) |
| `GET` | `/:id/milestones` | Get startup milestones | ✅ |
| `GET` | `/:id/documents` | Get KYB/ESG documents | ✅ |

#### Investment Routes (`/api/v1/investments`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `POST` | `/` | Create new investment | ✅ |
| `GET` | `/` | List investor's investments | ✅ |
| `GET` | `/:id` | Get single investment detail | ✅ |

#### Audit Trail Routes (`/api/v1/audit`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/` | List all ledger entries (paginated, filtered) | ✅ |
| `GET` | `/:id` | Get single audit entry with hash chain | ✅ |
| `GET` | `/export` | Export CSV/JSON for reporting | ✅ |

#### DAO Routes (`/api/v1/dao`)

| Method | Endpoint | Description | Auth Required |
|--------|----------|-------------|---------------|
| `GET` | `/votes` | List active DAO votes | ✅ |
| `POST` | `/votes/:milestoneId` | Submit DAO vote | ✅ |
| `GET` | `/votes/:milestoneId/result` | Get vote result / quorum status | ✅ |

---

## 11. MongoDB Schema Design

### User Schema
```js
{
  _id: ObjectId,
  email: String,            // unique, indexed
  passwordHash: String,
  role: String,             // "investor" | "startup" | "admin"
  kycStatus: String,        // "pending" | "verified" | "rejected"
  kycDocuments: [{ url, type, uploadedAt }],
  entityType: String,       // "individual" | "company" | "fund"
  profile: {
    name: String,
    organization: String,
    country: String,
  },
  createdAt: Date,
  updatedAt: Date
}
```

### Startup Schema
```js
{
  _id: ObjectId,
  name: String,             // "Aura Wind Energy"
  sector: String,           // "Clean Energy"
  geography: String,        // "Northern Europe"
  description: String,
  verificationStatus: String, // "pending" | "verified" | "rejected"
  kybDocuments: [{ url, type, verifiedAt }],
  esgScore: Number,         // 0-100
  trustScore: Number,       // Computed by trustScoreService
  fundingTarget: Number,    // $5,000,000
  totalRaised: Number,      // $4,200,000
  backers: [ObjectId],      // ref: User
  milestones: [ObjectId],  // ref: Milestone
  tags: [String],           // ["ESG", "Wind", "CleanTech"]
  createdAt: Date,
  updatedAt: Date
}
```

### Milestone Schema
```js
{
  _id: ObjectId,
  startupId: ObjectId,      // ref: Startup
  phase: Number,            // 1, 2, 3...
  title: String,            // "Site Acquisition"
  description: String,
  status: String,           // "pending" | "in_progress" | "complete"
  trancheAmount: Number,    // Capital released on completion
  daoVoteRequired: Boolean,
  daoVoteId: ObjectId,      // ref: DAOVote
  completedAt: Date,
  createdAt: Date
}
```

### AuditEntry Schema (Immutable Ledger)
```js
{
  _id: ObjectId,
  transactionType: String,  // "capital_release" | "funding_allocation" | "transfer"
  amount: Number,
  currency: String,         // "USD"
  fromEntity: ObjectId,     // ref: User | Startup
  toEntity: ObjectId,       // ref: User | Startup
  startupId: ObjectId,      // ref: Startup
  milestoneId: ObjectId,    // ref: Milestone (if applicable)
  hash: String,             // SHA-256 of (prevHash + payload)
  prevHash: String,         // Hash of previous entry (chain)
  blockIndex: Number,       // Sequential block number
  timestamp: Date,
  metadata: Object          // Additional JSON context
  // NO updatedAt — immutable by design
}
```

### DAOVote Schema
```js
{
  _id: ObjectId,
  milestoneId: ObjectId,    // ref: Milestone
  startupId: ObjectId,      // ref: Startup
  proposedBy: ObjectId,     // ref: User
  status: String,           // "active" | "passed" | "rejected" | "expired"
  quorumRequired: Number,   // % of investors needed (e.g., 66)
  votes: [{
    voterId: ObjectId,       // ref: User
    vote: String,            // "yes" | "no" | "abstain"
    votedAt: Date
  }],
  result: String,           // "passed" | "rejected"
  expiresAt: Date,
  resolvedAt: Date,
  createdAt: Date
}
```

---

## 12. React Component Tree

```
App
├── AuthProvider (Context)
├── InvestmentProvider (Context)
└── Router
    ├── / → LandingPage
    │   ├── PublicHeader
    │   ├── HeroSection (3D animation)
    │   ├── ArchitectureSection
    │   ├── LedgerFeedWidget
    │   ├── StatsSection (Total Managed Value)
    │   ├── CryptoVerificationSection
    │   ├── CapitalAllocationSection
    │   └── PublicFooter
    │
    ├── /onboarding → Onboarding (no sidebar)
    │   ├── OnboardingHeader
    │   ├── StepIndicator
    │   ├── Step1_InitAccount (email, password)
    │   ├── Step2_EntityVerification (KYCUpload)
    │   ├── Step3_TermsAcceptance
    │   └── Step4_Authenticate
    │
    └── AppLayout (Sidebar + BottomNav)
        ├── Sidebar
        │   └── NavItem × 5
        ├── BottomNav
        │   └── NavItem × 4
        │
        ├── /dashboard → Dashboard
        │   ├── PageHeader
        │   ├── StatCard × 3 (Portfolio Value, Tranches, Trust Score)
        │   ├── ActiveInvestmentsTable
        │   │   └── InvestmentRow × n
        │   └── NotificationLog
        │       └── NotificationEntry × n
        │
        ├── /marketplace → Marketplace
        │   ├── PageHeader ("Startup Registry")
        │   ├── FilterBar (ESG, Risk Profile, Sector)
        │   └── StartupGrid
        │       └── StartupCard × n
        │           ├── TrustScoreBadge
        │           ├── FundingProgress
        │           └── VerificationBadge
        │
        ├── /marketplace/:id → StartupDetails
        │   ├── StartupHero (name, sector, geo)
        │   ├── VerificationPanel (KYB + ESG docs)
        │   ├── FundingStats (raised, target, backers)
        │   ├── MilestoneRoadmap
        │   │   └── MilestonePhaseCard × n
        │   ├── ActionAlert (DAO consensus required)
        │   └── DAOVoteDialog (Modal)
        │
        ├── /ledger → AuditTrail
        │   ├── PageHeader ("Immutable Audit Trail")
        │   ├── AuditFilterBar (date, type, startup)
        │   ├── ExportButton
        │   └── AuditTable
        │       └── AuditEntry × n (hash, type, amount, timestamp)
        │
        ├── /portfolio → Portfolio
        │   ├── PageHeader
        │   └── PortfolioTable
        │
        └── /settings → Settings
            ├── ProfileSection
            ├── NotificationPreferences
            └── LinkedWallets
```

---

## 13. Technical Observations

### Stitch HTML/CSS Output Characteristics

| Attribute | Value |
|-----------|-------|
| **Output Format** | Standalone HTML (`text/html`) |
| **Design Width** | 1280px (canvas); 2560px rendered (2× retina) |
| **Icon Library** | Material Symbols (Google Fonts) |
| **Font Loading** | Google Fonts — Inter |
| **Roundness System** | ROUND_FOUR = 4px border-radius |

### Canvas Layout Reference

| Screen | Canvas X | Canvas Y |
|--------|----------|----------|
| Investor Dashboard | 1024 | 0 |
| Startup Registry | 2368 | 0 |
| Onboarding & KYC | 3712 | 0 |
| Audit Trail | 5056 | 0 |
| Startup Details | 7744 | 0 |
| Landing Page (3D) | 10432 | 0 |
| Hidden Variant A | 1344 | 1674 |
| Hidden Variant B | 0 | 1674 |
| Hidden Variant C | 0 | 796 |

> Hidden screens (Y > 0) are below the main canvas row — alternative layouts from the iteration phase.

---

## 14. Recommendations & Next Steps

### Immediate Design Completions

1. **Error Screen** — Full-page error state (404, server error, payment failure)
2. **Empty States** — Zero-investment dashboard and empty marketplace states
3. **Loading/Skeleton States** — Skeleton screens for Dashboard KPIs and table rows
4. **Success Confirmation** — Post-investment and DAO vote confirmation modals

### Interaction Layer

5. **Micro-animation specs** — Formally document tonal hover transitions and micro-success glow animations
6. **Tooltip system** — Design the glassmorphism tooltip for on-hover table data explanations
7. **DAO Voting Modal** — Full DAO consensus dialog (milestone approval vote with quorum indicator)

### Platform Expansion Screens

8. **Settings Screen** — User profile, notification preferences, linked wallets
9. **Insights / Analytics** — Portfolio performance charts by sector, IRR, MOIC
10. **Notification Center** — Full notification history with ledger-event links

### Implementation Guidance

11. **Component Library** — Export design system tokens to `tokens.css` CSS custom properties for developer handoff
12. **Responsive Breakpoints** — Define tablet (1024px) and mobile (768px) breakpoints using hidden screen variants as base
13. **WCAG Audit** — Review ghost border and low-opacity outline patterns against WCAG AA contrast ratios (minimum 4.5:1)
14. **Real-time Feeds** — Implement Socket.IO for live notification log and audit trail updates
15. **Audit Chain Integrity** — Implement server-side SHA-256 hash chaining on every `AuditEntry` write to enforce immutability

---

## Appendix A — Screen Screenshot URLs

| Screen | Thumbnail URL |
|--------|---------------|
| Landing Page (3D) | https://lh3.googleusercontent.com/aida/ADBb0ugDMWPqCBQLLEH9rhELzJUAxVsLUAwLh142lwI0hPTxWs68Dk6zuY3o7g6IwvTSGPyaiM4uZHR6nI... |
| Investor Dashboard | https://lh3.googleusercontent.com/aida/ADBb0uh1jKw6FIm6gdxRd658D1xKVHhoONftuWGZcvXjBoXRv3UOXZXoPvko2237rAris331vDz-ChpOiI4S... |
| Startup Registry | https://lh3.googleusercontent.com/aida/ADBb0uj8LTTV-oHPa9644qjSwnR8ptwUNqoo7dS8Awhd5XLgI3U6O9qJSsIYK_rDxC5AEUwCzczB7pD2FY... |
| Startup Details | https://lh3.googleusercontent.com/aida/ADBb0ugf5Xni9CBRx4ufgYs-NbyRHIPlVijrWa2ofkGhUGUIOungs3soNKeqkku0yF2M17NFEwRXkHkOCyYl... |
| Audit Trail | https://lh3.googleusercontent.com/aida/ADBb0uhtUE_waUv6lUmL_jF5goqy10QRPBxgXUkbDk0C-8HZwUzTf_zDjolycjoth6UcZcBobUNPhLuN4eT... |
| Onboarding & KYC | https://lh3.googleusercontent.com/aida/ADBb0ugIlkRzqz02F2QywG_oPPTrUZKjZ0BmiFzuSX6JZE_tt8Sc5C-CjqMGs72jTHo415y3qjaZ_CuF2w9J... |

---

## Appendix B — CSS Design Token Reference

```css
/* ═══════════════════════════════════════════════════════
   LINEAR LEDGER — CSS Custom Properties (Design Tokens)
   CleanLedger Investment Platform
   ═══════════════════════════════════════════════════════ */

:root {
  /* ── Primary Brand ── */
  --color-primary:              #091426;
  --color-primary-container:    #1E293B;  /* Sidebar, secondary CTAs */
  --color-on-primary:           #FFFFFF;
  --color-on-primary-container: #8590A6;  /* Sidebar icons */
  --color-primary-fixed:        #D8E3FB;
  --color-primary-fixed-dim:    #BCC7DE;

  /* ── Secondary ── */
  --color-secondary:              #505F76;
  --color-secondary-container:    #D0E1FB;
  --color-on-secondary:           #FFFFFF;
  --color-on-secondary-container: #54647A;

  /* ── Tertiary (Success Green) ── */
  --color-tertiary:               #001906;
  --color-tertiary-container:     #003010;
  --color-tertiary-fixed:         #6BFF8F;  /* Active indicator, micro-success glow */
  --color-on-tertiary-container:  #00A64A;  /* Success state text */

  /* ── Surfaces (5-tier tonal hierarchy) ── */
  --color-surface:                    #F8F9FF;  /* Page background */
  --color-surface-container-low:      #EFF4FF;  /* Structural sections */
  --color-surface-container:          #E5EEFF;  /* Cards */
  --color-surface-container-high:     #DCE9FF;  /* Hover state */
  --color-surface-container-highest:  #D3E4FE;  /* Table headers */
  --color-surface-container-lowest:   #FFFFFF;  /* Inputs, action modules */

  /* ── Text ── */
  --color-on-surface:         #0B1C30;  /* Primary text */
  --color-on-surface-variant: #45474C;  /* Secondary text */
  --color-on-background:      #0B1C30;
  --color-background:         #F8F9FF;

  /* ── Semantic ── */
  --color-error:           #BA1A1A;
  --color-outline:         #75777D;
  --color-outline-variant: #C5C6CD;

  /* ── Brand Overrides ── */
  --override-primary:   #1E293B;
  --override-secondary: #64748B;
  --override-tertiary:  #22C55E;
  --override-neutral:   #64748B;

  /* ── Typography ── */
  --font-family: 'Inter', sans-serif;
  --font-size-display:  2.25rem;   /* 36px */
  --font-size-headline: 1.5rem;    /* 24px */
  --font-size-title:    1.125rem;  /* 18px */
  --font-size-body-md:  0.875rem;  /* 14px */
  --font-size-body-sm:  0.75rem;   /* 12px — data tables */
  --font-size-label-md: 0.75rem;   /* 12px */
  --font-size-label-sm: 0.625rem;  /* 10px */

  /* ── Numeric Data (REQUIRED for all financial figures) ── */
  --font-variant-numeric: tabular-nums;

  /* ── Shape ── */
  --border-radius-btn:       2px;   /* Buttons, inputs */
  --border-radius-container: 4px;   /* Cards, containers (ROUND_FOUR) */
  --border-radius-chip:      9999px;

  /* ── Spacing Scale ── */
  --space-1:  0.25rem;   /* 4px */
  --space-2:  0.5rem;    /* 8px */
  --space-3:  0.75rem;   /* 12px */
  --space-4:  1rem;      /* 16px */
  --space-6:  1.5rem;    /* 24px */
  --space-8:  2rem;      /* 32px */
  --space-12: 3rem;      /* 48px */
  --space-16: 4rem;      /* 64px */

  /* ── Sidebar ── */
  --sidebar-width: 72px;

  /* ── Shadows (Ambient only — NO traditional drop shadows) ── */
  --shadow-ambient:  0 8px 48px 0 rgba(9, 20, 38, 0.05);
  --shadow-modal:    0 16px 64px 0 rgba(9, 20, 38, 0.06);

  /* ── Glassmorphism (Overlays, Tooltips) ── */
  --glass-bg:     rgba(248, 249, 255, 0.75);
  --glass-blur:   blur(12px);
  --glass-border: 1px solid rgba(197, 198, 205, 0.15);

  /* ── Transitions ── */
  --transition-hover:   background 150ms ease;
  --transition-focus:   background 100ms ease, border-color 100ms ease;
  --transition-overlay: opacity 200ms ease;
}
```

---

## Appendix C — Startup Registry Sample Data

```json
[
  {
    "id": "startup_001",
    "name": "Aura Wind Energy",
    "sector": "Clean Energy",
    "geography": "Northern Europe",
    "trustScore": 87,
    "esgScore": 92,
    "totalRaised": 4200000,
    "fundingTarget": 5000000,
    "backers": 124,
    "verificationStatus": "verified",
    "kybDocument": "KYB Clear",
    "esgDocument": "ESG Audit '23",
    "milestones": [
      { "phase": 1, "title": "Site Acquisition", "status": "complete" },
      { "phase": 2, "title": "Turbine Procurement", "status": "in_progress", "daoVoteRequired": true },
      { "phase": 3, "title": "Grid Connection", "status": "pending" }
    ]
  }
]
```

---

*Document generated: April 18, 2026*
*CleanLedger Investment Platform — Stitch Project `16512632333525978420`*
*MERN Stack Implementation Guide — Design System: Linear Ledger*
