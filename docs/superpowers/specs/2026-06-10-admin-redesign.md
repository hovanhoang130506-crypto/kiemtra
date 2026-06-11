# Admin Page Redesign

## Overview

Redesign the admin panel (`AdminScreens.tsx`) with modern CRUD UI inspired by ktm-reactnative. Keep 4 existing tabs (Categories, Products, Users, Orders), improve visual consistency, responsive layout, and UX patterns.

## Sections

### 1. Layout Structure

- **Header**: Use existing `Header` component (`<Header />`), title "S1DN Admin"
- **Stats bar**: Lightweight row below header showing counts (sản phẩm, users, orders) — purely decorative, fetched via existing `getAllProducts`/`getAllUsers`/`getAllOrders`
- **Tab bar**: 4 tabs with labels + icons, active state = `colors.primary` + border bottom, inactive = `colors.textSecondary`
- **FAB**: 56×56 circle, `colors.primary` bg, white "+" icon, `position: absolute`, bottom-right (offset for safe area), `Shadows.md`
- **Content area**: flex 1, `colors.background` bg

### 2. Categories Tab

- **Add/Edit form**: Inline card (not modal) — similar to current but styled with theme tokens
  - Card: `colors.card`, `BorderRadius.lg`, border, shadow
  - Title: "Thêm Danh Mục Mới" / "Sửa Tên Danh Mục"
  - Input: `colors.backgroundElement`, `BorderRadius.sm`, icon prefix
  - Save button: `colors.primary` bg
  - Cancel button (edit mode): outline
- **Category list**: FlatList with card items
  - Each item: name + ID subtitle
  - Action buttons: "+ SP" (add product), Edit icon, Delete icon
  - "+ SP" opens modal for adding product to that category (keep existing modal pattern)

### 3. Products Tab

- **FAB**: Opens add product modal
- **Search bar**: Card-style input with search icon + clear button
- **Product list**: FlatList with card items
  - Image thumbnail (50×50, `BorderRadius.sm`)
  - Name, category, price
  - Action buttons: Edit (`colors.primaryGlow` bg, `colors.primary` icon), Delete (`colors.dangerLight` bg, `colors.danger` icon)
- **Add/Edit modal**: Bottom sheet (`animationType="slide"`, transparent overlay)
  - Outer `View` with `justifyContent: 'flex-end'`, inner `View` with `borderTopLeftRadius: 24, borderTopRightRadius: 24`, `maxHeight: '85%'`
  - Drag handle at top (small gray bar)
  - Form fields: name, price (numeric), image picker (ImagePicker), category dropdown (`react-native-element-dropdown`), description (multiline)
  - Footer buttons: "Hủy" (outline) + "Lưu" (primary)

### 4. Users Tab

- **User list**: FlatList with card items
  - Avatar circle (first letter, `BorderRadius.full`), fullname, username, email, role badge
  - Role badge: "Admin" (`colors.warningLight` bg, `colors.warning` text) or "User" (`colors.infoLight` bg, `colors.info` text)
  - Action buttons: Change role (`shield-outline` icon), Delete (`colors.dangerLight` bg)
- **Role change**: Confirmation Alert (keep existing pattern)
- **Delete**: Confirmation Alert (keep existing pattern)

### 5. Orders Tab

- **Filter pills**: Horizontal ScrollView, pill-shaped chips (`BorderRadius.full`)
  - Statuses: "Tất cả", "Chờ xử lý", "Đang giao", "Đã giao", "Đã hủy"
  - Active: `colors.primary` bg, white text
  - Inactive: `colors.backgroundElement` bg, `colors.textSecondary` text
- **Order list**: FlatList with card items
  - Order header: ID + status badge (colored pill: yellow/blue/green/red)
  - Customer info: name, phone
  - Date + total price
  - Quick action buttons (conditional on status):
    - "Chờ xử lý" → "Giao hàng" (blue) + "Hủy" (red)
    - "Đang giao" → "Đã giao" (green) + "Hủy" (red)
    - "Đã giao" / "Đã hủy" → no quick actions
- **Order detail modal**: Bottom sheet
  - Customer info section (name, phone, address, date)
  - Status with inline Dropdown for update
  - Product list with images, quantities, prices, line totals
  - Total summary row at bottom

## Style Patterns (Theme Tokens)

| Element | Token |
|---------|-------|
| Card background | `colors.card` |
| Card border | `colors.border`, width 1 |
| Card radius | `BorderRadius.lg` (16) or `BorderRadius.xl` (24) |
| Card shadow | `Shadows.sm` |
| Input background | `colors.backgroundElement` |
| Input radius | `BorderRadius.sm` (8) or `BorderRadius.md` (12) |
| Input border | `colors.border` |
| Primary button | `colors.primary` bg, white text |
| Danger button | `colors.dangerLight` bg, `colors.danger` text/icon |
| Edit button | `colors.primaryGlow` bg, `colors.primary` text/icon |
| Status badge | `colors.warningLight`/`infoLight`/`successLight`/`dangerLight` bg |
| Tab active | `colors.primary` text + borderBottom |
| Tab inactive | `colors.textSecondary` text |
| Modal bottom sheet | `borderTopLeftRadius: 24, borderTopRightRadius: 24` |

## Data Flow

- All state management stays in `AdminScreens.tsx` (useState for each tab)
- No changes to `database.ts` — keep existing CRUD functions
- No changes to navigation — `AdminPanel` component remains exported for `App.tsx`
- Search/filter is client-side (filter existing array), no new SQL queries

## Files Changed

- `components/sqlite/AdminScreens.tsx` — Full rewrite of JSX and StyleSheet
- No other files need changes

## Non-Goals

- No new database queries or schema changes
- No auth/permission changes
- No new tabs or features
- No dark mode support (keep `colors = Colors.light`)
