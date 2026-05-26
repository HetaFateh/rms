# 🚀 RMS E2E Test Suite (Playwright + TypeScript)

Welcome to the **RMS (Reward Management System)** End-to-End Test Suite! 

This repository houses a high-fidelity automated E2E test suite built on top of **Playwright** and **TypeScript** to validate the reward and loyalty dashboard at `dashboard.rms.dev.atklik.xyz` (Telkomsel platform).

---

## ✨ Features & Flows Automated

Our test suite mirrors real-world business scenarios, covering multi-role operations across three key personas: **Admin** (creator), **Approver** (validator), and **Agent** (end-user).

- 📦 **Program Management:** Admin-initiated creation (across 4 step-by-step tabs), editing, deleting, and status verification.
- 👥 **Role-Switching Workflows:** Multi-persona handoffs (e.g., Admin creates $\rightarrow$ logout $\rightarrow$ Approver reviews $\rightarrow$ approves/rejects $\rightarrow$ verify success state).
- ⚙️ **Setting Modules:** Creation, editing, and deletion for **Brand**, **Bank**, **Channel**, and **Redeem** settings in unified E2E single-pass flows.
- 🔔 **Subscription Approvals:** Full happy-path and rejection-path automated handling.
- 📊 **Dashboard Navigation:** Expandable sidebar items and layout validation.

---

## 🛠️ Tech Stack & Tooling

- **Core Engine:** [Playwright Test](https://playwright.dev/) (v1.59+)
- **Language:** TypeScript
- **Runtime:** Node.js
- **Browsers:** Chromium (default for fast execution), Firefox & WebKit (supported via simple toggles)
- **Execution Mode:** Headed by default (serial worker mode to preserve state in sequential steps)

---

## 🏗️ Clean Code Architecture Rules

We strictly adhere to a bulletproof design pattern that keeps specs clean, robust, and lightning-fast:

### 1. Separation of Concerns (Element Factory Pattern)
Each component in `helpers/elements/` is split into two strict zones:
* **Section 1 (Pure Locators):** Uses semantic locators (e.g., `getByRole`, `getByLabel`) returned as plain lazy factory functions.
* **Section 2 (Action Helpers):** Contains asynchronous user interactions (e.g., `fillForm`, `deleteItem`) using those factories.

### 2. Custom Test Fixture (`helpers/base.test.ts`)
* Auto-captures JPEG screenshots on test failures.
* Automatically records and attaches non-static API request/response logs in `./evidence/`.
* Rich evidence generation for beautiful HTML report outputs.

### 3. Centralized State & Config
* 🎛️ **Central Toggle:** Enforce selective test runs cleanly in [test.config.ts](test.config.ts) instead of polluting spec files with `.skip()` statements.
* 📦 **Worker State Sharing:** `state.manager.ts` handles shared variables safely across tests running in the same browser context.

---

## 🚀 Quick Start Guide

### 1. Install Dependencies
```powershell
npm install
```

### 2. Set Up Environment Variables
Create a `.env` file in the root directory (never commit secrets!):
```env
BASE_URL=https://dashboard.rms.dev.atklik.xyz/
ADMIN_USERNAME="your-admin-email"
ADMIN_PASSWORD="your-admin-password"
APPROVER_USERNAME="your-approver-email"
APPROVER_PASSWORD="your-approver-password"
AGENT_USERNAME="your-agent-email"
AGENT_PASSWORD="your-agent-password"
```

### 3. Run Tests

* **Run all enabled tests:**
  ```powershell
  npx playwright test
  ```

* **Run a specific test case:**
  ```powershell
  npx playwright test test-cases/redeem-management/redeem-management.spec.ts
  ```

* **Run in All Browsers (Chrome + Firefox + Safari):**
  ```powershell
  $env:ALL_BROWSERS="true"; npx playwright test
  ```

* **Show beautiful HTML Report:**
  ```powershell
  npx playwright show-report
  ```

---

## 📁 Repository Structure

```text
rms/
├── helpers/
│   ├── base.test.ts          # Custom Playwright base fixture (Evidence generation)
│   ├── data.helper.ts        # Reusable central test data constants
│   ├── state.manager.ts      # Shared context state manager
│   └── elements/             # Reusable UI element factories & interaction actions
├── test-cases/
│   ├── program-management/   # Program CRUD
│   ├── program-approval/     # Approve/Reject program workflows
│   ├── redeem-management/    # Redeem settings
│   ├── channel-management/   # Channel CRUD
│   ├── brand-management/     # Brand CRUD
│   └── bank-management/      # Bank CRUD
├── test.config.ts            # Centralized test toggles config
└── playwright.config.ts      # Global Playwright configurations
```

---
Made with ❤️ for high-performance test automation.
