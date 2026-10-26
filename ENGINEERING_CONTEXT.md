# Engineering Context — Hyper Al Masri (هايبر المصري)

This document provides dense, high-signal technical context for AI assistants, senior engineers, or code reviewers working on this codebase.

---

## 1. Stack & System Specifications
- **Framework:** React 19.2.4 (functional components, hooks, React Server Component compatibility ready).
- **TypeScript:** v5.8.2. Strictly typed. Module resolution: `bundler`. Target: `ESNext`.
- **Bundler:** Vite 6.2.0. Dev server forced to `host: '0.0.0.0', port: 3000`.
- **Animation:** `motion` 12.42.2 (`import { motion, AnimatePresence } from 'motion/react'`).
- **Icons:** `lucide-react` 0.564.0.
- **AI SDK:** `@google/genai` 1.41.0.
- **Database / Auth:** Firebase SDK 12.9.0.

---

## 2. Core Domain Contracts

### Product Model (`types.ts`)
```typescript
export interface Product {
  id: string;
  name: string;
  nameAr?: string;
  category: string;
  price: number;
  originalPrice?: number;
  discountPrice?: number;
  rating: number;
  reviewsCount?: number;
  image: string;
  description: string;
  unit: string;
  inStock: boolean;
  stockQuantity?: number;
  isWeightBased?: boolean;  // Essential for butchery & produce
  minWeight?: number;        // e.g., 0.25 kg
  weightStep?: number;       // e.g., 0.25 kg
  badge?: string;
}
```

### Cart Calculation Rules
- **Non-weight item:** `itemTotal = (product.discountPrice ?? product.price) * item.quantity`
- **Weight-based item:** `itemTotal = (product.discountPrice ?? product.price) * (item.selectedWeight ?? 1)`

---

## 3. High-Priority Architecture Nuances & Quirks
1. **`CategoryCard` Props Support:**
   `components/DesignSystem.tsx` contains `CategoryCard`. It accepts both `category` and `cat` as optional props:
   ```typescript
   export interface CategoryCardProps {
     category?: Category;
     cat?: Category; // legacy alias
     onClick?: () => void;
     isSelected?: boolean;
   }
   ```
   Do not remove this fallback without refactoring all historical callers across all tabs.
2. **Motion React 12 Drag Conflicts:**
   `CardProps` in `DesignSystem.tsx` omits `onDrag` and `onDragStart` to avoid signature collisions with Motion's internal gesture handlers:
   ```typescript
   export interface CardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'onDrag' | 'onDragStart'> { ... }
   ```
3. **Theme Synchronization:**
   The theme toggler must update both `document.documentElement` and `document.body` classes:
   ```typescript
   document.documentElement.classList.toggle('dark', isDark);
   document.body.classList.toggle('dark', isDark);
   localStorage.setItem('almasri_theme', isDark ? 'dark' : 'light');
   ```

---

## 4. Verification Checkpoint
Always execute before finishing any task:
```bash
npm run lint    # runs tsc --noEmit
npm run build   # tests Vite production bundling
```
Both must pass with exit code 0.
