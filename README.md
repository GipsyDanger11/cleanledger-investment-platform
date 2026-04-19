<div align="center">
  <h1>🟢 CleanLedger Investment Platform</h1>
  <p><i>A bank-grade, blockchain-secured, high-trust ecosystem for modern startup funding.</i></p>
</div>

CleanLedger bridges the critical trust gap between startup founders and angel investors. By leveraging cryptographic tamper-proof ledgers, Mistral-powered AI due diligence, secure GridFS document streaming, and dynamic milestone-based fund releases, CleanLedger provides unparalleled transparency and security for the investment economy. 

---

## 🌟 Key Platform Capabilities

### 1. 🔐 Bank-Grade KYC & Document Verification
We scrapped standard local storage to build a fully secure, database-native Document Pipeline:
*   **MongoDB GridFS Streaming:** All sensitive documents are piped directly into MongoDB file chunks (`GridFSBucket`). They are never exposed to the raw file system hierarchy.
*   **Granular Collection:** Hard requirement collection of Business Registration, GST Numbers, Masked Founder ID, Pitch Decks, and Bank Statements natively integrated via `multer` memory storage.
*   **Dynamic Trust Badges:** Investor-viewable registries dynamically react to document status logic (`Documents Pending` 🔴, `Under Review` 🟡, `KYC Verified` 🟢) rather than statically assuming trust.
*   **Admin Approval Workflow:** A dedicated Admin Control Panel allows super-users to securely view these uploaded GridFS documents and officially strike platforms as Verified, directly updating their global "Credibility Score".

### 2. 🤖 Mistral AI Auto-Diligence & Red Flags
We integrated advanced LLM capabilities (Mistral) directly into the backbone of the platform to serve as an unfatigued, lightning-fast junior analyst:
*   **Pitch Extraction:** Founders simply paste their raw pitch decks or business plans. The AI extracts a pristine executive summary, highlights core strengths, and plots a viability score (1-100).
*   **Automatic Red Flags:** An internal AI analyst automatically scans founder inputs, team sizes, fund targets, and plans to generate "Red Flags" (e.g., *Excessive fund asks with zero previous traction*). **These red flags are entirely masked from the founders and only displayed as a security bumper to registered Investors.**

### 3. ⛓️ SHA-256 Tamper-Evident Blockchain Ledger
Unlike standard SaaS databases where a bad actor can edit a SQL row to feign investor metrics, CleanLedger mathematically prevents altering history:
*   **Canonical Hashing:** Every investment transaction and milestone action is cryptographically hashed. 
*   **Block-Chaining:** Each new transaction stores the digital signature (`previousHash`) of the action that occurred before it. If a single byte of historical data is changed, the entire chain instantly fractures, and the `Verify Chain` UI will visibly scream "Tampered".
*   **Additive Homomorphic Encryption (FHE):** Ensures perfect visibility of "Total Raise" aggregation without sacrificing the exact, private investment integers committed by individual whales.

### 4. 🎯 Smart Milestone Governance & Community Voting
Founders don't just ask for $100K and disappear. We built a structured capital release system:
*   **Tranche-Based Dispersal:** Capital is divided via dynamically declared Milestones.
*   **Proof of Execution:** Founders upload proof of success (GitHub repos, tax files, MRR screenshots). 
*   **Investor Voting Algorithm:** Investors cast votes (`Yes/No`) on whether the evidence suffices. Total investor sentiment mathematically aggregates to dynamically pump (or sink) the startup's live Trust Score.

### 5. 👥 Tri-Fold Access Economy
Dedicated, strictly separated sandboxes for platform actors:
*   **Founders:** Powerful Onboarding Wizard, AI assist for pitch writing, Cap Table monitoring, and Direct Investor Communication Hub.
*   **Investors:** Custom Due-Diligence settings, active Portfolio tracking, encrypted transparency, and the ability to view shielded Red Flags.
*   **Admins:** Overseers ensuring all startups pass rigorous KYC audits before being officially presented on the global startup registry.

---

## 🛠️ The Tech Stack
*   **Frontend Ecosystem:** React 18 / Vite / React Router / Vanilla Context API
*   **Premium Styling:** Tailwind-free Custom Vanilla CSS, adopting high modern Glassmorphism, tailored gradients, and buttery-smooth layout animations.
*   **Backend Server:** Node.js / Express / Mongoose
*   **Database:** MongoDB targeting `GridFS` streaming clusters.
*   **Generative AI:** Mistral LLM via external API keys.
*   **Crypto & Blockchain:** Node `crypto` Module / SHA-256 hashing algorithms / Paillier FHE architecture.

---

## 🚀 Getting Started

### Prerequisites
1.  **Node.js** (v18+)
2.  **MongoDB URI** (Local or Atlas)
3.  **Mistral API Key** (Required for the AI Diligence worker)

### Installation
```bash
# 1. Clone the repository
git clone <repository_url>

# 2. Setup the backend
cd server
npm install
# Create a .env matching .env.example (Make sure to add your MISTRAL_API_KEY)
npm start

# 3. Setup the frontend
cd client
npm install
npm run dev
```

### Flow Walkthrough
1. **Create an Investor**. Define your deal-size criteria and thesis. 
2. **Create a Founder**. Open an incognito window, build your profile, upload your strict KYC details, and click "Analyze with AI". 
3. **Admin Verification**. Find the GridFS files in the Admin panel and mark the founder as Secure.
4. **Marketplace Discovery**. Jump back to your Investor tab, spot the verified startup, view their flagged risks, and initiate an encrypted transaction!
