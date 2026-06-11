# Profile Page Redesign

## Overview

Redesign the profile screen (`ProfileScreen` in `UserScreens.tsx`) to improve UI/UX while keeping the existing layout structure. Use theme tokens from `constants/theme.ts`.

## Sections

### 1. Profile Header
- Avatar circle (80px) with gradient background (`primary` → `gradientEnd`), white initials text (first letter of fullname)
- Camera icon overlay for future avatar editing
- Fullname as large heading (20px, bold)
- Role badge: "Thành viên" (primaryLight bg, primary text) or "Quản trị viên" (secondaryLight bg, secondary text)
- Stats row: "📦 N đơn hàng" with separator dots

### 2. Personal Info Card
- Card: white bg, border-radius 16, shadow from theme
- Section header: icon + "Thông Tin Cá Nhân"
- Fields: fullname*, email*, phone, address
- Each field: label (14px, medium), input row with icon + TextInput
- Input: bg `backgroundElement`, border-radius 12, focus border primary
- Use theme tokens for all spacing/colors/border-radius

### 3. Security Card
- Match style of Personal Info card
- Section header: icon + "Bảo Mật"
- Fields: "Mật khẩu mới" (with show/hide toggle as end adornment), "Xác nhận mật khẩu"
- Hint text: "Để trống nếu không muốn thay đổi mật khẩu" (gray, caption)

### 4. Actions Section
- Order history: card row with icon + label + chevron, navigates to `/history`
- "Cập Nhật Thông Tin": primary full-width button, loading spinner when saving
- "Đăng Xuất": outline danger button (icon + text), confirmation alert on press

## Data Flow
- All state management stays in `ProfileScreen` (useState for fields)
- `useAuth()` hook for `currentUser`, `updateProfile`, `logout`
- Validation unchanged (fullname+email required, password min 6 chars, confirm match)

## Style Changes
- Replace all hardcoded hex colors with `Colors.light.*` from theme
- Use `Spacing.*`, `BorderRadius.*`, `Shadows.*` from theme
- Remove shared styles that are no longer needed; add profile-specific styles

## Files Changed
- `components/sqlite/UserScreens.tsx` — ProfileScreen component and styles
- No other files need changes (auth context, database, navigation unchanged)
