# Hyper Al Masri — Prioritized Engineering Roadmap & Next Steps

This document outlines the active development roadmap, acceptance criteria, dependencies, and risk assessments for upcoming engineering sprints.

---

## Sprint 1: Core User Experience & Feedback (Immediate)

### Task 1: Post-Purchase Feedback Section in Order Tracking (P1)
- **Status:** READY FOR IMPLEMENTATION
- **Target File:** `components/TrackingMap.tsx`
- **Objective:** Allow customers to submit reviews and satisfaction ratings immediately after their delivery completes or while tracking progress.
- **Specification:**
  1. Add a "تقييم الطلب والتوصيل" (Order & Delivery Feedback) card below the Courier information section.
  2. Implement dual interactive star rating widgets (1 to 5 stars):
     - **Delivery Experience (تقييم التوصيل وسرعة المندوب):** Rating for courier speed, friendliness, and handling.
     - **Product Freshness & Quality (جودة المنتجات والطلب):** Rating for freshness of fruit/vegetables, butchery cut accuracy, and packaging.
  3. Interactive text area for optional customer comments ("شاركنا برأيك لتحسين تجربتك القادمة").
  4. Quick selection tags (e.g., "تغليف ممتاز", "سريع جداً", "منتجات طازجة", "مندوب محترم").
  5. Submission button ("إرسال التقييم") with loading state and post-submit thank you message.
- **Acceptance Criteria:**
  - [ ] Star ratings highlight on hover and lock on click.
  - [ ] Submission triggers visual confirmation without full-page reload.
  - [ ] Fully responsive on mobile viewport and supports dark/light mode themes.
  - [ ] Zero TypeScript or linter errors.

---

### Task 2: Cart & Wishlist Local Storage Persistence (P1)
- **Status:** PLANNED
- **Target File:** `App.tsx`
- **Objective:** Prevent cart loss on browser refresh.
- **Specification:**
  - Hydrate initial cart state from `localStorage.getItem('almasri_cart')`.
  - Use a `useEffect` hook to persist `cart` updates to `localStorage`.
  - Handle JSON parse errors safely with fallback to `[]`.
- **Acceptance Criteria:**
  - [ ] Refreshing the browser preserves cart items, weights, and quantities.
  - [ ] Emptying the cart clears `localStorage`.

---

## Sprint 2: Real Data & Cloud Integrations (Short-Term)

### Task 3: Live Firestore Persistence for Orders & Feedback (P2)
- **Status:** PLANNED
- **Target Files:** `services/firebase.ts`, `components/TrackingMap.tsx`
- **Objective:** Connect the post-purchase feedback submissions and live order status tracking to a real Firestore collection.
- **Dependencies:** Firebase project provisioning via `set_up_firebase` tool.
- **Schema:**
  ```json
  {
    "orderFeedback": {
      "orderId": "ORD-7829-EG",
      "deliveryRating": 5,
      "productRating": 4,
      "comments": "Delicious mangoes, fast delivery",
      "tags": ["fresh", "fast"],
      "createdAt": "2026-10-26T12:00:00Z"
    }
  }
  ```

---

### Task 4: Address Selector & Geocoding Integration (P2)
- **Status:** PLANNED
- **Target File:** `components/HomeRedesign.tsx`
- **Objective:** Upgrade the static Cairo address selector modal with dynamic geolocation or Google Maps Geocoding API integration.
- **Acceptance Criteria:**
  - [ ] Allows users to detect current location via HTML5 Geolocation API.
  - [ ] Saves preferred delivery zone (e.g. New Cairo, Sheikh Zayed, Maadi, Zamalek).

---

## Sprint 3: Performance & Polish (Medium-Term)

### Task 5: Native Tailwind CSS Build Migration (P3)
- **Status:** PLANNED
- **Target Files:** `index.html`, `vite.config.ts`, `src/index.css`
- **Objective:** Move from CDN-injected Tailwind script in `index.html` to a local Vite PostCSS plugin pipeline for optimal bundle size and zero runtime style compilation.

---

## Task Execution Order
1. **Task 1: Post-Purchase Feedback Section in `TrackingMap.tsx`** *(Pick up first)*
2. **Task 2: Cart Persistence in `App.tsx`**
3. **Task 3: Firestore Database Sync**
4. **Task 4: Address Geolocation**
5. **Task 5: Tailwind Build Migration**
