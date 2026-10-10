# FridgeWise AI 🥬

> **Your fridge. Less waste. Smarter meals.**  
> *“Know what you have. Save what matters. Cook what you already own.”*

FridgeWise AI is a complete, hackathon-ready smart fridge and food-rescue manager designed for modern households, students, and busy families. Featuring **Rescue Mode**—a deterministic, explainable decision engine that transforms fridge urgency into zero-waste meals using ingredients you already own.

---

## 🦋 Visual Identity & Design System

- **Warm Ivory Background:** `#F7F8F3`
- **Pure White Surfaces:** `#FFFFFF` with subtle shadows
- **Deep Forest Green:** `#183D2B` (primary headings & primary buttons)
- **Primary Green:** `#367653` (food-saving indicators & success states)
- **Soft Sage:** `#CDE2D0` (accents & borders)
- **Pale Mint Surface:** `#EAF3E9` (subtle cards & badges)
- **Warm Apricot Accent:** `#F0B779` (attention & sparkle accents)
- **Main Text:** `#202923`
- **Secondary Text:** `#69736C`
- **Subtle Borders:** `#E2E8E0`
- **Error Red:** `#B84238`

### 3D Floating Butterfly Background (Three.js)
- Features delicate, stylized 3D butterfly geometry floating peacefully in the background.
- Respects `prefers-reduced-motion` and automatically throttles for mobile performance.
- Uses `pointer-events: none` ensuring zero interaction blocking.

---

## 🌟 Primary Innovation: Rescue Mode Decision Engine

Standard apps tell you that your spinach is expiring; FridgeWise answers: **“What should I use next, and what can I make with it?”**

- **Explainable Priority Scoring (`src/lib/rescuePriority.js`):** Evaluates recorded shelf dates, date types (`use-by`, `best-before`, `opened-date`), perishability (fresh produce vs. dry pantry lentils), and storage locations (fridge vs. pantry vs. freezer).
- **Inventory-Driven Recipe Pairing:** Deterministically matches your inventory against recipes, prioritizing urgent items and maximizing pantry readiness.
- **Available vs. Missing Ingredient Transparency:** Highlights what you have in green (with owned quantities) and flags missing ingredients clearly.
- **Validated Inventory Deduction:** When you cook, FridgeWise lets you confirm exact quantities consumed, deducting only what was used rather than blindly deleting ingredients.

---

## 🤖 Local AI & Multi-Provider Architecture

FridgeWise AI supports a resilient, multi-tier AI backend in `server/index.js`:

1. **Local AI (Ollama / LM Studio):** Connects to `http://localhost:11434` (Ollama) or `http://localhost:1234` running local models (e.g. `llama3`, `mistral`, `qwen2.5`, `gemma2`).
2. **Cloud AI (Google Gemini 2.5 Flash):** Server-side endpoint with zero frontend API key exposure.
3. **Verified Fallback Engine:** If no AI daemon is running, seamlessly matches high-grade built-in rescue recipe templates (*Palak Dal*, *Tomato Onion Uttapam*, *Desi Egg Bhurji*, *Vegetable Khichdi*, *Garlic Toss Pasta*, *Paneer Bhurji*).

---

## 📱 Application Structure (5 Core Destinations)

1. **Today (Dashboard):**
   - Time-aware friendly greeting and daily summary.
   - Compact urgency breakdown: *Needs attention today*, *Coming up soon*, and *Past date (inspect condition)*.
   - **Rescue Spotlight:** Prominently recommends your highest-priority item (e.g. Fresh Spinach) and pairs it with an actionable recipe (e.g. *Palak Dal*).
   - Real food-saving progress summary (items rescued this week, verified value saved).
   - Prominent **Add Food** action.

2. **Rescue Mode (Innovation View):**
   - Direct decision engine view answering what to cook next.
   - Categorized urgency review cards with explainable status tags.
   - Centered recipe match with available vs. missing breakdown and 1-click cooking.

3. **Inventory (Food Manager):**
   - Track food name, quantity & unit, category (Produce, Dairy, Pantry, Protein, Bakery, Other), storage location (Refrigerator, Freezer, Pantry), date type, and optional purchase price & notes.
   - Fast manual entry + **Smart Packaging Label OCR** (extracts text stamps with user confirmation).
   - Search by keyword, filter by category or storage location, and sort by rescue urgency.
   - Quick quantity stepper (`+` / `-`), partial usage logging, discard tracking with disposal reasons, edit, and deletion with confirmation.

4. **Recipes (AI + Resilient Built-in Templates):**
   - Tailored dishes featuring Indian household staples and versatile global staples.
   - **AI Recipe Generator (`/api/recipes/ai`):** Multi-provider server endpoint.
   - **Smart Butterfly Loading Animation:** Contextual feedback during generation.
   - Interactive cooking flow: confirm amounts cooked, update inventory, and record activity.

5. **Impact (Verified Food-Saving Outcomes):**
   - Strictly derived from confirmed user actions: items rescued before deadline, total meals/portions consumed, reported discards with reasons, and grocery purchase value rescued.
   - Zero fabricated carbon savings or artificial claims.
   - Chronological activity timeline.

---

## 🛠️ Technology Stack & Architecture

- **Frontend:** React 19, Vite 8, Tailwind CSS v3 (PostCSS), Lucide React icons, Three.js.
- **Backend API:** Node.js, Express, CORS, dotenv.
- **AI Integration:** Local AI (Ollama) / Google Gemini 2.5 Flash / Built-in templates.
- **OCR Engine:** Client-side Tesseract.js for label extraction with verification.
- **Authentication & Persistence:**
  - **Demo Mode:** Zero-config LocalStorage with pre-seeded illustrative groceries and single-click reset.
  - **Cloud Mode:** Firebase Authentication (Google Sign-In) and Cloud Firestore with owner-scoped security rules.
- **Testing:** Vitest test suite for date safety, priority engine, recipe matching, deductions, and impact calculations.

---

## 🚀 Quick Start & Local Development

### 1. Install Dependencies
```bash
npm install
```

### 2. Configure Environment (Optional)
```bash
cp .env.example .env
```
*(Default settings run 100% in local demo mode out-of-the-box)*

### 3. Run Development Servers
Open two terminal windows (or run concurrently):

**Terminal 1 — API Backend:**
```bash
npm run server
```
*API runs on `http://localhost:3001`*

**Terminal 2 — Frontend Application:**
```bash
npm run dev
```
*Vite frontend runs on `http://localhost:5173` with automatic API proxying.*

### 4. Run Automated Tests
```bash
npm test
```
*Executes all 13 unit tests verifying date logic, priority ranking, recipe matching, deductions, and OCR heuristics.*

### 5. Build for Production
```bash
npm run build
```

To run the production server serving the built frontend bundle:
```bash
npm start
```

---

## 📄 License
MIT License. Built for the Hackathon.
