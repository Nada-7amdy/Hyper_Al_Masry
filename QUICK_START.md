# Quick Start Developer Guide — Hyper Al Masri (هايبر المصري)

Welcome to Hyper Al Masri! This guide will get you onboarded and running the project locally in under 3 minutes.

---

## 1. Prerequisites
- **Node.js:** v20.0+ (`node -v`)
- **Package Manager:** `npm` v10+ or `bun`

---

## 2. Fast Track Commands

```bash
# 1. Clone & Enter Directory
cd hyper-al-masri

# 2. Install Dependencies
npm install

# 3. Verify TypeScript Compilation (Strict Type Check)
npm run lint

# 4. Start Local Development Server (Runs on port 3000)
npm run dev

# 5. Build Production Bundle
npm run build
```

---

## 3. Project Architecture in 60 Seconds
Hyper Al Masri is a single-page React 19 luxury supermarket application.
- **Entry Points:**
  - `index.html`: Injects Tailwind CSS configuration, Google fonts (Cairo, Outfit, Playfair), and initial theme detection.
  - `index.tsx`: Mounts React into `#root` wrapped inside `GlobalErrorBoundary`.
  - `App.tsx`: Manages high-level state:
    - Active view (`Tab.EXTERIOR`, `Tab.MARKET`, `Tab.TRACKING`, `Tab.ADMIN`, `Tab.SERVICES`, `Tab.PACKAGING`, `Tab.UNIFORM`).
    - Shopping cart items and total calculation.
    - Theme switching (dark / light).
    - Floating AI Concierge drawer state.
- **Components (`/components`):**
  - `HomeRedesign.tsx`: Homepage with hero banners, deal carousels, and quick category shortcuts.
  - `Marketplace.tsx`: Searchable catalog with price filters and cart flyout.
  - `TrackingMap.tsx`: Live simulated delivery radar and courier milestone tracker.
  - `AdminDashboard.tsx`: Inventory management for standard and weight-based goods.
  - `Concierge.tsx`: AI culinary assistant powered by `@google/genai`.
  - `DesignSystem.tsx`: Reusable atomic UI kit (Cards, Badges, Buttons, Drawers).

---

## 4. Key Rules Before You Code
1. **Never break `npm run lint`:** Run `npm run lint` before committing. We enforce strict TypeScript 5.8 mode.
2. **`CategoryCard` Props:** In `DesignSystem.tsx`, `CategoryCard` accepts both `category` and `cat` for backward compatibility. Keep both intact.
3. **Weight vs Piece Pricing:** Check `product.isWeightBased`. Weight-based items use `selectedWeight` (kg), while unit-based items use `quantity`.
4. **Dev Server Port:** Must remain port 3000 as configured in `vite.config.ts`.
5. **No Direct Secret Leaks:** Never hardcode API keys in frontend files.

---

## 5. Immediate Next Step
Check `NEXT_STEPS.md` to pick up the top-priority task:  
👉 **Task 1: Post-Purchase Feedback Section on `TrackingMap.tsx`**
