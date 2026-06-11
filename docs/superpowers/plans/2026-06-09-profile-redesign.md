# Profile Page Redesign Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign ProfileScreen with better UI/UX: avatar header, themed cards, polished styling

**Architecture:** Single component refactor in `UserScreens.tsx`. Add new profile-specific styles alongside existing shared styles. No new files needed.

**Tech Stack:** React Native, StyleSheet, Ionicons, existing theme tokens

---

### Task 1: Add Profile-Specific Styles

**Files:**
- Modify: `components/sqlite/UserScreens.tsx` — add new styles after existing `historySubtitle` (after line 1028)

- [ ] **Add new style definitions after line 1028**

Insert the following new styles right before the `// Lịch sử mua hàng` comment (currently at line 1030):

```typescript
  // ==========================================
  // PROFILE REDESIGN STYLES
  // ==========================================
  profileSafeArea: {
    flex: 1,
    backgroundColor: Colors.light.background,
  },
  profileScrollContent: {
    paddingBottom: 40,
  },
  // Profile Header
  profileHeaderContainer: {
    alignItems: 'center',
    paddingTop: Spacing.five,
    paddingBottom: Spacing.four,
    paddingHorizontal: Spacing.four,
    backgroundColor: Colors.light.card,
    borderBottomLeftRadius: BorderRadius.xl,
    borderBottomRightRadius: BorderRadius.xl,
    ...Shadows.md,
  },
  profileAvatarContainer: {
    position: 'relative',
    marginBottom: Spacing.three,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.light.primary,
  },
  profileAvatarText: {
    fontSize: 32,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  profileCameraOverlay: {
    position: 'absolute',
    bottom: 0,
    right: -4,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: Colors.light.card,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: Colors.light.background,
    ...Shadows.sm,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: Colors.light.text,
    marginBottom: Spacing.two,
  },
  profileRoleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.three,
  },
  profileRoleBadgeMember: {
    backgroundColor: Colors.light.primaryLight,
  },
  profileRoleBadgeAdmin: {
    backgroundColor: Colors.light.secondaryLight,
  },
  profileRoleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  profileRoleTextMember: {
    color: Colors.light.primary,
  },
  profileRoleTextAdmin: {
    color: Colors.light.secondary,
  },
  profileStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileStatText: {
    fontSize: 14,
    color: Colors.light.textTertiary,
    fontWeight: '500',
  },
  profileStatDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.light.border,
  },
  // Profile Cards
  profileCard: {
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    marginHorizontal: Spacing.marginMobile,
    ...Shadows.sm,
  },
  profileSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.three,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
    borderBottomColor: Colors.light.backgroundElement,
  },
  profileSectionIcon: {
    marginRight: Spacing.two,
  },
  profileSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: Colors.light.text,
  },
  profileFieldLabel: {
    fontSize: FontSize.labelLg,
    fontWeight: '600',
    color: Colors.light.textSecondary,
    marginBottom: Spacing.one + 2,
    marginTop: Spacing.three,
  },
  profileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.light.backgroundElement,
    borderWidth: 1,
    borderColor: Colors.light.backgroundSelected,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.three,
  },
  profileInputIcon: {
    marginRight: Spacing.two,
  },
  profileInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: FontSize.bodyMd,
    color: Colors.light.text,
  },
  profilePasswordHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.three,
    gap: 6,
  },
  profilePasswordHintText: {
    fontSize: FontSize.caption,
    color: Colors.light.textTertiary,
    fontWeight: '500',
  },
  profileEyeIcon: {
    padding: 8,
  },
  // Profile Actions
  profileActionsContainer: {
    paddingHorizontal: Spacing.marginMobile,
    marginTop: Spacing.four,
    gap: Spacing.three,
    paddingBottom: Spacing.six,
  },
  profileHistoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.light.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    ...Shadows.sm,
  },
  profileHistoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileHistoryIconBox: {
    width: 44,
    height: 44,
    borderRadius: BorderRadius.md,
    backgroundColor: Colors.light.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHistoryInfo: {
    marginLeft: Spacing.three,
  },
  profileHistoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: Colors.light.text,
  },
  profileHistorySubtitle: {
    fontSize: 12,
    color: Colors.light.textTertiary,
    fontWeight: '500',
    marginTop: 2,
  },
  profilePrimaryButton: {
    backgroundColor: Colors.light.primary,
    borderRadius: BorderRadius.md,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.glow,
  },
  profilePrimaryButtonDisabled: {
    opacity: 0.7,
  },
  profilePrimaryButtonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  profileLogoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: Colors.light.errorLight,
    backgroundColor: Colors.light.errorLight,
  },
  profileLogoutText: {
    color: Colors.light.error,
    fontSize: 15,
    fontWeight: '600',
  },
```

- [ ] **Verify no typos** — check that `Colors`, `Spacing`, `FontSize`, `BorderRadius`, `Shadows` are all imported (they're used elsewhere in this file but check top imports)

---

### Task 2: Rewrite ProfileScreen Component

**Files:**
- Modify: `components/sqlite/UserScreens.tsx` — replace ProfileScreen function (lines 537-715)

- [ ] **Replace ProfileScreen with new implementation**

Replace the entire ProfileScreen function (from `export function ProfileScreen()` at line 537 through the closing `}` before `// ==========================================` at line 715) with the new implementation:

```typescript
export function ProfileScreen() {
  const { currentUser, logout, updateProfile } = useAuth();

  const [fullname, setFullname] = useState(currentUser?.fullname || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [orderCount, setOrderCount] = useState(0);

  useEffect(() => {
    if (currentUser) {
      setFullname(currentUser.fullname);
      setEmail(currentUser.email);
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
    }
  }, [currentUser]);

  const db = useSQLiteContext();

  useEffect(() => {
    if (currentUser?.id) {
      getUserOrders(db, currentUser.id).then(orders => {
        setOrderCount(orders.length);
      }).catch(() => {});
    }
  }, [currentUser]);

  const handleUpdate = async () => {
    if (!fullname.trim() || !email.trim()) {
      Alert.alert('Lỗi', 'Họ tên và email là thông tin bắt buộc.');
      return;
    }
    if (password.length > 0 && password.length < 6) {
      Alert.alert('Lỗi', 'Mật khẩu mới phải tối thiểu 6 ký tự.');
      return;
    }
    if (password !== confirmPassword) {
      Alert.alert('Lỗi', 'Mật khẩu xác nhận không khớp.');
      return;
    }

    setIsSaving(true);
    try {
      await updateProfile(fullname, email, phone, address, password || undefined);
      Alert.alert('Thành công', 'Thông tin cá nhân đã được cập nhật!');
      setPassword('');
      setConfirmPassword('');
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin cá nhân.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Đăng xuất',
      'Bạn có chắc chắn muốn đăng xuất?',
      [
        { text: 'Hủy', style: 'cancel' },
        { text: 'Đăng xuất', style: 'destructive', onPress: logout },
      ]
    );
  };

  const initials = currentUser?.fullname
    ? currentUser.fullname.charAt(0).toUpperCase()
    : '?';

  const isAdmin = currentUser?.role === 'admin';

  return (
    <SafeAreaView style={styles.profileSafeArea}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
      >
        <ScrollView
          contentContainerStyle={styles.profileScrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Profile Header */}
          <View style={styles.profileHeaderContainer}>
            <View style={styles.profileAvatarContainer}>
              <View style={styles.profileAvatar}>
                <Text style={styles.profileAvatarText}>{initials}</Text>
              </View>
              <View style={styles.profileCameraOverlay}>
                <Ionicons name="camera" size={14} color={Colors.light.primary} />
              </View>
            </View>
            <Text style={styles.profileName}>{currentUser?.fullname}</Text>
            <View style={[
              styles.profileRoleBadge,
              isAdmin ? styles.profileRoleBadgeAdmin : styles.profileRoleBadgeMember,
            ]}>
              <Text style={[
                styles.profileRoleText,
                isAdmin ? styles.profileRoleTextAdmin : styles.profileRoleTextMember,
              ]}>
                {isAdmin ? 'Quản trị viên' : 'Thành viên'}
              </Text>
            </View>
            <View style={styles.profileStatsRow}>
              <Ionicons name="receipt-outline" size={16} color={Colors.light.textTertiary} />
              <Text style={styles.profileStatText}>{orderCount} đơn hàng</Text>
              <View style={styles.profileStatDot} />
              <Ionicons name="time-outline" size={16} color={Colors.light.textTertiary} />
              <Text style={styles.profileStatText}>{currentUser?.username}</Text>
            </View>
          </View>

          {/* Personal Info Card */}
          <View style={[styles.profileCard, { marginTop: 20 }]}>
            <View style={styles.profileSectionHeader}>
              <Ionicons name="person-outline" size={20} color={Colors.light.primary} style={styles.profileSectionIcon} />
              <Text style={styles.profileSectionTitle}>Thông Tin Cá Nhân</Text>
            </View>

            <Text style={styles.profileFieldLabel}>Họ và tên *</Text>
            <View style={styles.profileInputContainer}>
              <Ionicons name="card-outline" size={20} color={Colors.light.textTertiary} style={styles.profileInputIcon} />
              <TextInput
                style={styles.profileInput}
                value={fullname}
                onChangeText={setFullname}
                placeholder="Nhập họ và tên"
                placeholderTextColor={Colors.light.textTertiary}
              />
            </View>

            <Text style={styles.profileFieldLabel}>Địa chỉ Email *</Text>
            <View style={styles.profileInputContainer}>
              <Ionicons name="mail-outline" size={20} color={Colors.light.textTertiary} style={styles.profileInputIcon} />
              <TextInput
                style={styles.profileInput}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="Nhập email"
                autoCapitalize="none"
                placeholderTextColor={Colors.light.textTertiary}
              />
            </View>

            <Text style={styles.profileFieldLabel}>Số điện thoại</Text>
            <View style={styles.profileInputContainer}>
              <Ionicons name="call-outline" size={20} color={Colors.light.textTertiary} style={styles.profileInputIcon} />
              <TextInput
                style={styles.profileInput}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Nhập số điện thoại"
                placeholderTextColor={Colors.light.textTertiary}
              />
            </View>

            <Text style={styles.profileFieldLabel}>Địa chỉ</Text>
            <View style={styles.profileInputContainer}>
              <Ionicons name="location-outline" size={20} color={Colors.light.textTertiary} style={styles.profileInputIcon} />
              <TextInput
                style={styles.profileInput}
                value={address}
                onChangeText={setAddress}
                placeholder="Nhập địa chỉ"
                placeholderTextColor={Colors.light.textTertiary}
              />
            </View>
          </View>

          {/* Security Card */}
          <View style={[styles.profileCard, { marginTop: 16 }]}>
            <View style={styles.profileSectionHeader}>
              <Ionicons name="lock-closed-outline" size={20} color={Colors.light.primary} style={styles.profileSectionIcon} />
              <Text style={styles.profileSectionTitle}>Bảo Mật</Text>
            </View>

            <Text style={styles.profileFieldLabel}>Mật khẩu mới</Text>
            <View style={styles.profileInputContainer}>
              <Ionicons name="key-outline" size={20} color={Colors.light.textTertiary} style={styles.profileInputIcon} />
              <TextInput
                style={styles.profileInput}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu mới"
                autoCapitalize="none"
                placeholderTextColor={Colors.light.textTertiary}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.profileEyeIcon}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color={Colors.light.textTertiary} />
              </TouchableOpacity>
            </View>

            <Text style={styles.profileFieldLabel}>Xác nhận mật khẩu mới</Text>
            <View style={styles.profileInputContainer}>
              <Ionicons name="checkmark-circle-outline" size={20} color={Colors.light.textTertiary} style={styles.profileInputIcon} />
              <TextInput
                style={styles.profileInput}
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                autoCapitalize="none"
                placeholderTextColor={Colors.light.textTertiary}
              />
            </View>

            <View style={styles.profilePasswordHint}>
              <Ionicons name="information-circle-outline" size={14} color={Colors.light.textTertiary} />
              <Text style={styles.profilePasswordHintText}>Để trống nếu không muốn thay đổi mật khẩu</Text>
            </View>
          </View>

          {/* Actions */}
          <View style={styles.profileActionsContainer}>
            <TouchableOpacity
              style={styles.profileHistoryCard}
              onPress={() => router.push('/history')}
              activeOpacity={0.7}
            >
              <View style={styles.profileHistoryLeft}>
                <View style={styles.profileHistoryIconBox}>
                  <Ionicons name="receipt-outline" size={22} color={Colors.light.primary} />
                </View>
                <View style={styles.profileHistoryInfo}>
                  <Text style={styles.profileHistoryTitle}>Lịch Sử Mua Hàng</Text>
                  <Text style={styles.profileHistorySubtitle}>Xem các đơn hàng đã đặt</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color={Colors.light.textTertiary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.profilePrimaryButton, isSaving && styles.profilePrimaryButtonDisabled]}
              onPress={handleUpdate}
              disabled={isSaving}
              activeOpacity={0.85}
            >
              {isSaving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <Text style={styles.profilePrimaryButtonText}>Cập Nhật Thông Tin</Text>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.profileLogoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <Ionicons name="log-out-outline" size={20} color={Colors.light.error} />
              <Text style={styles.profileLogoutText}>Đăng Xuất</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
```

- [ ] **Verify imports** — check that `getOrderHistory` is imported from `./database` (or wherever it's exported). Check the existing imports at the top of the file to see if it's already imported.

- [ ] **Check router import** — verify that `router` (from expo-router) is available. If `ProfileScreen` is rendered via tab navigation in `App.tsx`, the `router` push to `/history` might need `useRouter()` from expo-router. Check if `router` is used elsewhere in the file.

---

### Task 3: Verify and Fix Imports

**Files:**
- Modify: `components/sqlite/UserScreens.tsx` — add missing imports

- [ ] **Check top imports** — read lines 1-25 of the file to confirm:
  - `getOrderHistory` is imported from `'./database'`
  - If `router` is needed, add `import { router } from 'expo-router';`
  - `Colors`, `Spacing`, `FontSize`, `BorderRadius`, `Shadows` are imported from `'../../constants/theme'`

- [ ] **Add missing imports** at the top of the file if not present:

```typescript
import { router } from 'expo-router';
import { getOrderHistory } from './database';
import { Colors, Spacing, FontSize, BorderRadius, Shadows } from '../../constants/theme';
```

---

### Task 4: Test the Build

- [ ] **Build check**

Run: `npx expo export --platform web` or `npx tsc --noEmit` to verify TypeScript compilation.

Expected: Clean compilation with no errors.

- [ ] **Visual review** — check that:
  - Avatar header shows initials correctly
  - Role badge matches user role
  - All fields are editable and show current values
  - Password toggle works
  - Order history navigates correctly
  - Update button shows loading state
  - Logout shows confirmation alert
