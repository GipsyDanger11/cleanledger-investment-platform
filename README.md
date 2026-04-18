# CleanLedger Investment Platform

CleanLedger is a bank-grade, blockchain-secured investment platform designed specifically for transparent startup funding. It bridges the trust gap between investors and founders by offering cryptographic proof of funds, immutable transaction history, and privacy-preserving analytics.

## Core Features
*   **Virtual Wallet Economy:** Frictionless, tokenized fund transfer system where investments are instantly and atomically synchronized with the founder's wallet.
*   **Tamper-Evident Ledger:** Every transaction and milestone release is permanently chained using SHA-256 canonical hashing. If a single byte of historical data is altered, the chain breaks and signals "Tampered."
*   **Milestone-Based Releases:** Funds are disbursed based on verified progress, ensuring founders are accountable directly to their backers.
*   **Trust & Credibility Scoring:** Automated scoring (0-100) based on verified KYC/KYB documents, ESG compliance, and track record.

## 🔐 Advanced Security & Privacy (The Secret Sauce)

### 1. SHA-256 Blockchain Audit Trail
Unlike standard databases where an admin can secretly edit a row, CleanLedger uses an immutable cryptographic block structure. Each transaction contains a `hash` that includes the signature of the `previousHash`. This mathematically prevents any mid-chain data tampering. *Run the Verify Chain tool in the UI to see the cryptographic proof in action!*

### 2. Fully Homomorphic Encryption (FHE)
Public ledgers usually suffer from a fatal flaw: everyone can see exactly who invested how much, destroying investor privacy. 

CleanLedger solves this using **"Additive Homomorphic Encryption using the Paillier cryptosystem"**.
When you invest, your actual amount is converted into mathematical noise (a ciphertext string) before hitting the database. When the public needs to see the startup's "Total Raised", the server natively computes the mathematical sum of the ciphertexts **without decrypting them**. 

You get the transparency of a public blockchain, with the absolute privacy of encrypted banking.
