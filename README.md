# PackSureAI: Legal Metrology Compliance & Inspection Intelligence Platform

[![Smart India Hackathon 2026](https://img.shields.io/badge/SIH-2026-blue.svg)](https://www.sih.gov.in)
[![Problem Statement ID](https://img.shields.io/badge/PS%20ID-SIH26034-orange.svg)](https://www.sih.gov.in)
[![Ministry](https://img.shields.io/badge/Ministry-Consumer%20Affairs%2C%20Food%20%26%20Public%20Distribution-green.svg)](https://consumeraffairs.gov.in)
[![Framework](https://img.shields.io/badge/Legal%20Framework-LMPC%20Rules%202011%20%26%20LMA%202009-yellow.svg)](https://consumeraffairs.gov.in)

> **Official Problem Statement (SIH26034):**  
> *"Software System to check compliance of Packaged Commodities under Legal Metrology (Packaged Commodities) Rules, 2011 by scanning products, images and labels."*  
> **Organization:** Ministry of Consumer Affairs, Food & Public Distribution (Department of Consumer Affairs - DoCA)

---

## 🌟 Executive Summary & Key Differentiators

**PackSureAI** is an enterprise AI-powered compliance, surveillance, and legal notice dispatch platform designed for **Legal Metrology Enforcement Officers**, **Legal Reviewers**, **Marketplace Regulators**, and **Indian Consumers**.

### 🚀 Core Enterprise Features:

1. **📦 Multi-Face Packaging Inspection (360° Scan):**
   - Ingests **Front Face (Principal Display Panel)**, **Back Face (Declarations)**, **Sides**, and **Bottom** to cross-verify all required statutory declarations.
2. **🔍 Image Quality Pre-Check:**
   - Real-time computer vision blur detection (Laplacian variance), glare detection, and lighting analysis to ensure court-admissible evidence.
3. **🤖 Hybrid Multimodal OCR & Vision Intelligence:**
   - High-accuracy structured field extraction (MRP, USP, Net Qty, Mfg Date, Expiry, Manufacturer Address, Consumer Care helpline/email, Country of Origin) with per-field confidence scoring $(0.00 - 1.00)$.
4. **✍️ Human-in-the-Loop (HITL) Verification Gate:**
   - Flags low-confidence extractions or OCR noise (e.g. `₹12O` vs `₹120`) with amber badges, allowing officers to verify and correct fields with instant rule re-evaluation.
5. **⚖️ Versioned Legal Metrology Rules Engine (`LMPC-2011.v2026`):**
   - Evaluates compliance against **Rule 6(1)** (Mandatory declarations), **Rule 5** (Strict metric SI symbols, rejecting illegal `gms` or `lit`), **Rule 7 & Schedule II** (Font height scaling by net weight), and **Rule 6(10)** (E-commerce digital listing requirements).
6. **💡 Defensible Explainability Chain:**
   - Every detected breach provides: *Rule Violated, Detected Evidence, Expected Statutory Requirement, AI Confidence, and Recommended Enforcement Action*.
7. **🚨 Dynamic Priority Risk Index (PRI) & Inspection Queue:**
   - Prioritizes field raids and surveillance based on brand recidivism history, commodity hazard weight, violation severity, and citizen complaints.
8. **📄 Automated Court-Admissible Legal Notice PDF Generation:**
   - 1-click issuance of formal Show-Cause Notices under Section 36 of the Legal Metrology Act, 2009 with statutory penalties.
9. **🛒 Rule 6(10) E-Commerce Marketplace Auditor:**
   - Audits product URLs on Amazon, Flipkart, Blinkit, Zepto, and Swiggy Instamart for digital declaration compliance.
10. **🛡️ Citizen Consumer Protection Portal:**
    - Clean consumer scanner for fair pricing verification and 1-click grievance filing to National Consumer Helpline (INGRAM format).
11. **🔐 Multi-Tier RBAC & Tamper-Proof Audit Logging:**
    - Role-Based Access Control (**Admin, Inspector, Legal Reviewer, Citizen**) with immutable cryptographic action logs.

---

## 🏗️ Architecture & Tech Stack

```
 ┌─────────────────────────────────────────────────────────────────────────────┐
 │                     Frontend: React 18 + Vite + Tailwind CSS                │
 │  (Inspector Dashboard, Multi-Face Scanner, E-Com Auditor, Citizen Portal)   │
 └──────────────────────────────────────┬──────────────────────────────────────┘
                                        │ REST API (JSON)
 ┌──────────────────────────────────────▼──────────────────────────────────────┐
 │                      Backend: Python 3.13 + FastAPI                         │
 ├─────────────────────────────────────────────────────────────────────────────┤
 │  • Image Quality Pre-Check (Laplacian Variance / Glare Analysis)           │
 │  • Hybrid OCR & Multimodal Vision Engine (Gemini Flash + Local Fallback)    │
 │  • Human-in-the-Loop (HITL) Verification & Inline Re-evaluation Engine     │
 │  • Versioned Legal Metrology Rule Validator (LMPC 2011 & Sec 36 LMA 2009)   │
 │  • Priority Risk Index (PRI) Enforcement Scheduler                          │
 │  • Official ReportLab Legal Notice PDF Builder                              │
 │  • Switchable Data Layer: SQLite (Local Demo) / PostgreSQL (Scale)          │
 └─────────────────────────────────────────────────────────────────────────────┘
```

---

## ⚡ Quick Start Guide (How to Run)

### 1. Start the Backend API Server:
```bash
cd backend
python -m pip install -r requirements.txt
python main.py
```
> Backend runs at: `http://127.0.0.1:8000` (Interactive API docs at `http://127.0.0.1:8000/docs`)

### 2. Start the Frontend React Web App:
```bash
cd frontend
npm install
npm run dev
```
> Frontend opens at: `http://localhost:5173`

---

## 🎯 Hackathon Presentation & Live Demo Script

1. **Inspector Priority Queue:**
   - Open `http://localhost:5173` $\to$ Show national compliance metrics and AI-prioritized risk inspection targets sorted by Priority Risk Index (PRI).
2. **Packaging Scanner & Multi-Face Verification:**
   - Navigate to **Packaging Scanner** $\to$ Click the **"✓ Compliant (Tata Salt)"** preset $\to$ Point out how all 8 declarations are verified in green.
   - Click the **"⚠️ Violation (QuickBite + HITL)"** preset $\to$ Point out the amber **"Review Required"** badge on the low-confidence MRP field (`₹4O.00`).
3. **Human-in-the-Loop (HITL) Inline Correction:**
   - Click **Edit** on the flagged MRP field $\to$ Change `₹4O.00` to `₹40.00` $\to$ Click **Confirm & Re-evaluate** $\to$ Watch the score update with full audit logging!
4. **Legal Notice PDF Generation:**
   - Click **"Issue Section 36 Show-Cause Notice"** $\to$ View the official Ministry letterhead preview $\to$ Download the generated court-ready PDF notice.
5. **E-Commerce Rule 6(10) Auditor:**
   - Navigate to **E-Commerce Audit** $\to$ Click **"Non-Compliant Listing"** $\to$ Demonstrate automatic detection of missing Unit Sale Price (USP) and Country of Origin on marketplace listings.
6. **Citizen Protection Portal:**
   - Switch to the **Citizen Scanner** $\to$ Demonstrate how consumers can verify products and file 1-click complaints to the National Consumer Helpline (INGRAM).
7. **Statutory Versioning & Audit Trail:**
   - Switch role to **Admin** $\to$ View **Legal Rules Registry** with temporal validity dates and the **Tamper-Proof Audit Ledger**.
