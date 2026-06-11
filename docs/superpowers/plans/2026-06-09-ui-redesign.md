# UI Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign the entire app UI to match the KTM Store (ShopVibe) premium e-commerce design system — Indigo/Violet palette, modern card-based layouts, polished typography.

**Architecture:** Create a centralized theme system (theme.ts) with Colors, Spacing, FontSize, BorderRadius, Shadows. Then update each screen/component to use the new design tokens and visual patterns from the reference app.

**Tech Stack:** React Native, Expo, TypeScript, StyleSheet.create(), @expo/vector-icons (Ionicons)

---

## File Structure

| File | Purpose |
|------|---------|
| `constants/theme.ts` | **NEW** — Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows |
| `components/sqlite/SQLiteScreen.tsx` | **MODIFY** — New header, banner, product card grid, category horizontal scroll |
| `components/sqlite/Header.tsx` | **MODIFY** — Full redesign: menu icon + app name + search + cart with badge |
| `components/sqlite/AuthScreens.tsx` | **MODIFY** — Login/Signup redesign with brand header, form card, social login |
| `components/sqlite/AdminScreens.tsx` | **MODIFY** — Admin panel with new colors and card styles |
| `components/sqlite/UserScreens.tsx` | **MODIFY** — Cart, OrderHistory, Profile with new design |
| `App.tsx` | **MODIFY** — Bottom tab bar with new styling |
| `app/product/[id].tsx` | **MODIFY** — Product detail page redesign |

---

### Task 1: Create Theme Constants

**Files:**
- Create: `constants/theme.ts`

- [ ] **Step 1: Create theme.ts with design tokens**

```typescript
export const Colors = {
  light: {
    primary: '#004ac6',
    primaryDark: '#003ea8',
    primaryLight: '#dbe1ff',
    primaryGlow: 'rgba(0, 74, 198, 0.08)',
    secondary: '#fb923c',
    secondaryLight: '#ffdcc5',
    background: '#f7f9fb',
    card: '#ffffff',
    backgroundElement: '#f2f4f6',
    text: '#191c1e',
    textSecondary: '#434655',
    textTertiary: '#737686',
    danger: '#ba1a1a',
    dangerLight: '#ffdad6',
    success: '#2e7d32',
    successLight: '#e8f5e9',
    warning: '#ed6c02',
    warningLight: '#fff3e0',
    border: '#c3c6d7',
    icon: '#434655',
    tabIconDefault: '#737686',
    tabIconSelected: '#004ac6',
    gradientStart: '#004ac6',
    gradientEnd: '#2563eb',
    shadow: 'rgba(0, 0, 0, 0.05)',
  },
};

export const Spacing = {
  half: 2, one: 4, two: 8, three: 16, four: 24,
  five: 32, six: 48, xs: 4, sm: 8, md: 16, lg: 24, xl: 32,
  marginMobile: 20, gutterMobile: 16,
};

export const FontSize = {
  display: 32, hero: 32, heading: 24, subheading: 20,
  price: 18, bodyLg: 16, body: 14, caption: 12, small: 12, tiny: 10,
};

export const FontWeight = {
  regular: '400' as const, medium: '500' as const,
  semibold: '600' as const, bold: '700' as const, extrabold: '800' as const,
};

export const BorderRadius = {
  xs: 4, sm: 8, md: 12, lg: 16, xl: 24, xxl: 28, full: 9999,
};

export const Shadows = {
  sm: { shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.05, shadowRadius: 12, elevation: 2 },
  md: { shadowColor: '#000', shadowOffset: { width: 0, height: 8 }, shadowOpacity: 0.1, shadowRadius: 20, elevation: 4 },
  lg: { shadowColor: '#000', shadowOffset: { width: 0, height: 12 }, shadowOpacity: 0.12, shadowRadius: 24, elevation: 8 },
};

export const CategoryTints = [
  '#dbe1ff', '#ffdcc5', '#e8f5e9', '#fff3e0', '#f3e8ff', '#fce7f3', '#e0f2fe', '#ffe4e6',
];
```

- [ ] **Step 2: Verify no import errors**

Run: `npx tsc --noEmit`

---

### Task 2: Redesign Header Component

**Files:**
- Modify: `components/sqlite/Header.tsx`

- [ ] **Step 1: Rewrite Header.tsx with new design**

The new Header should have:
- Left: Menu icon (hamburger) + App name "ShopVibe" in primary color, bold, 24px
- Right: Search icon button + Cart icon button with badge (orange badge)
- When user logged in, show user avatar/name in a bottom sheet menu (simplified: just show name next to avatar)
- Background: white with bottom border
- Icons: 22px, rounded square buttons (40x40, borderRadius 12, backgroundColor backgroundElement)

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

---

### Task 3: Redesign Home Screen (SQLiteScreen)

**Files:**
- Modify: `components/sqlite/SQLiteScreen.tsx`

- [ ] **Step 1: Redesign the home screen layout**

New layout structure:
1. Header (from Task 2)
2. Banner/Hero slider area (using banner.jpg, full-width, 190px height, overlay with "Chào mừng" text)
3. Category horizontal scroll (round icon circles 60x60, category name below)
4. "Flash Sale" section header + horizontal scroll product cards
5. "Sản phẩm nổi bật" section header + horizontal scroll
6. "Tất cả sản phẩm" section header + 2-column grid

Product card design:
- White card, borderRadius 12, borderWidth 1
- Image: full width, aspectRatio 1
- Info: name (14px, semibold), star rating, price (16px, bold, primary color)
- Cart button: circle 36x36, primary background, white cart icon
- Shadow: sm

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

---

### Task 4: Redesign Login/Signup Screens

**Files:**
- Modify: `components/sqlite/AuthScreens.tsx`

- [ ] **Step 1: Redesign LoginScreen**

New design:
- Brand header: Logo icon (bag-handle) in primaryLight circle, "ShopVibe" title, subtitle
- Form card: white card with shadow, rounded corners
- Input fields: label above, input with left icon, border, borderRadius 12
- Submit button: primary color, full width, borderRadius 12, bold text
- Divider: "hoặc tiếp tục với"
- Social buttons: Google, Apple (outlined)
- Footer: "Chưa có tài khoản? Đăng ký ngay"

- [ ] **Step 2: Redesign RegisterScreen**

Similar to Login but with more fields (fullname, email, username, password, confirm)

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`

---

### Task 5: Redesign Bottom Tab Bar

**Files:**
- Modify: `App.tsx`

- [ ] **Step 1: Update tab bar styling**

New tab bar:
- Height: 70px
- Background: white
- Top border: 1px solid border color
- Tab label: 12px, weight 600
- Active: primary color icon + label, subtle glow background on icon
- Inactive: tabIconDefault color
- Icons: 22px Ionicons

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

---

### Task 6: Redesign Cart Screen

**Files:**
- Modify: `components/sqlite/UserScreens.tsx` (CartScreen section)

- [ ] **Step 1: Redesign CartScreen**

New design:
- Header with back button + "Giỏ hàng" title + cart count badge
- Cart items: horizontal card (image left, info right)
  - Image: 80x80, borderRadius 8
  - Name: 14px semibold, max 1 line
  - Category: 11px tertiary
  - Price: 14px bold, primary color
  - Quantity controls: minus/plus circle buttons
  - Delete: trash icon
- Footer: total price + "Tiến hành thanh toán" button (primary, full width, borderRadius 12)

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

---

### Task 7: Redesign Product Detail Page

**Files:**
- Modify: `app/product/[id].tsx`

- [ ] **Step 1: Redesign product detail**

New design:
- Full-width product image (aspectRatio 1)
- Info section: category badge, product name (22px bold), price (22px bold, primary), description
- "Thêm vào giỏ hàng" button (primary, full width)
- Related products section

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

---

### Task 8: Redesign Admin Panel

**Files:**
- Modify: `components/sqlite/AdminScreens.tsx`

- [ ] **Step 1: Update admin panel styling**

Apply new color tokens:
- Header: primary background with white text
- Tab bar: primary color active indicator
- Cards: white with new shadow system
- Buttons: primary/secondary with new borderRadius
- Status badges: use new color palette (warning for pending, info for shipping, success for delivered)

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`

---

### Task 9: Redesign Order History & Profile

**Files:**
- Modify: `components/sqlite/UserScreens.tsx` (OrderHistoryScreen, ProfileScreen sections)

- [ ] **Step 1: Redesign OrderHistoryScreen**

- Order cards: white, borderRadius 16, shadow
- Status badges with colors (warning=Chờ xử lý, info=Đang giao, success=Đã giao, danger=Đã hủy)
- Product preview in order card

- [ ] **Step 2: Redesign ProfileScreen**

- Avatar circle at top
- Form card with inputs
- "Cập nhật" button (primary)
- "Đăng xuất" button (danger/outlined)

- [ ] **Step 3: Verify TypeScript**

Run: `npx tsc --noEmit`

---

### Task 10: Final Verification

- [ ] **Step 1: Run full TypeScript check**

Run: `npx tsc --noEmit`
Expected: No errors

- [ ] **Step 2: Test all screens manually**

Verify: Home, Login, Signup, Product Detail, Cart, Checkout, Order History, Profile, Admin Panel all render correctly with new design.
