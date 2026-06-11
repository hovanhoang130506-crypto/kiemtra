import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Modal, Pressable, ScrollView, Alert, Platform, StatusBar } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import ConfirmModal from './ConfirmModal';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows } from '../../constants/theme';

interface HeaderProps {
  showSearch?: boolean;
  showBack?: boolean;
  onBack?: () => void;
  title?: string;
  onSearchSubmit?: (query: string) => void;
}

export default function Header({ showSearch = false, showBack = false, onBack, title, onSearchSubmit }: HeaderProps) {
  const router = useRouter();
  const { currentUser, logout } = useAuth();
  const { cartCount } = useCart();
  const colors = Colors.light;

  const [isSearching, setIsSearching] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [showMenu, setShowMenu] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const badgeText = cartCount > 99 ? '99+' : String(cartCount);

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
  };

  const handleSearchSubmit = () => {
    if (onSearchSubmit) {
      onSearchSubmit(searchVal.trim());
    }
    setIsSearching(false);
  };

  const renderMenuItem = (icon: string, label: string, onPress: () => void, isPrimary = false, isDanger = false) => (
    <TouchableOpacity style={styles.menuItem} onPress={onPress} activeOpacity={0.6}>
      <Ionicons name={icon as any} size={20} color={isPrimary ? colors.primary : isDanger ? colors.danger : colors.textSecondary} />
      <Text style={[
        styles.menuItemLabel,
        isPrimary && { color: colors.primary, fontWeight: '700' },
        isDanger && { color: colors.danger, fontWeight: '700' },
      ]}>{label}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.wrapper}>
      <View style={[styles.container, { backgroundColor: colors.background, borderBottomColor: colors.border }]}>
        <View style={styles.topRow}>
          {isSearching ? (
            <View style={styles.searchModeContainer}>
              <TouchableOpacity onPress={() => setIsSearching(false)} style={[styles.iconBtn, { backgroundColor: colors.backgroundElement }]}>
                <Ionicons name="arrow-back-outline" size={20} color={colors.text} />
              </TouchableOpacity>
              <View style={[styles.searchBar, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                <Ionicons name="search-outline" size={16} color={colors.textTertiary} />
                <TextInput
                  style={[styles.searchInput, { color: colors.text }]}
                  placeholder="Tìm kiếm sản phẩm..."
                  placeholderTextColor={colors.textTertiary}
                  value={searchVal}
                  onChangeText={setSearchVal}
                  onSubmitEditing={handleSearchSubmit}
                  returnKeyType="search"
                  autoFocus
                />
                {searchVal.length > 0 && (
                  <TouchableOpacity onPress={() => setSearchVal('')} style={styles.clearBtn}>
                    <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
                  </TouchableOpacity>
                )}
              </View>
            </View>
          ) : (
            <>
              <View style={styles.leftSection}>
                {showBack ? (
                  <TouchableOpacity onPress={onBack} style={[styles.iconBtn, { backgroundColor: colors.backgroundElement }]}>
                    <Ionicons name="arrow-back-outline" size={20} color={colors.text} />
                  </TouchableOpacity>
                ) : (
                  <TouchableOpacity onPress={() => setShowMenu(true)} style={[styles.iconBtn, { backgroundColor: colors.backgroundElement }]}>
                    <Ionicons name="menu-outline" size={20} color={colors.text} />
                  </TouchableOpacity>
                )}
                <Text style={[styles.appName, { color: colors.primary }]} numberOfLines={1}>{title || 'S1DN'}</Text>
              </View>

              <View style={styles.rightSection}>
                {showSearch && (
                  <TouchableOpacity onPress={() => router.push('/search')} style={[styles.iconBtn, { backgroundColor: colors.backgroundElement }]}>
                    <Ionicons name="search-outline" size={20} color={colors.text} />
                  </TouchableOpacity>
                )}
                <TouchableOpacity style={[styles.iconBtn, { backgroundColor: colors.backgroundElement }]} onPress={() => router.push('/cart')}>
                  <Ionicons name="cart-outline" size={20} color={colors.text} />
                  {cartCount > 0 && (
                    <View style={[styles.cartBadge, { backgroundColor: colors.secondary }]}>
                      <Text style={styles.cartBadgeText}>{badgeText}</Text>
                    </View>
                  )}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>

      {/* Menu Bottom Sheet */}
      <Modal visible={showMenu} transparent animationType="slide" onRequestClose={() => setShowMenu(false)}>
        <Pressable style={styles.modalOverlay} onPress={() => setShowMenu(false)}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.dragHandle, { backgroundColor: colors.border }]} />
            <View style={styles.menuSheetContent}>
              {/* User Info */}
              <View style={styles.menuHeader}>
                {currentUser ? (
                  <View style={styles.userInfoRow}>
                    <View style={[styles.avatarCircle, { backgroundColor: colors.backgroundElement, borderColor: colors.border }]}>
                      <Ionicons name="person" size={24} color={colors.textTertiary} />
                    </View>
                    <View>
                      <Text style={styles.userFullName}>{currentUser.fullname}</Text>
                      <Text style={[styles.userEmail, { color: colors.textSecondary }]}>{currentUser.email}</Text>
                    </View>
                  </View>
                ) : (
                  <View>
                    <Text style={styles.menuSheetTitle}>S1DN Menu</Text>
                    <Text style={[styles.menuSheetSubtitle, { color: colors.textSecondary }]}>Vui lòng đăng nhập để trải nghiệm đầy đủ</Text>
                  </View>
                )}
              </View>

              <View style={[styles.sheetDivider, { backgroundColor: colors.backgroundElement }]} />

              {/* Menu Items */}
              {renderMenuItem('home-outline', 'Trang chủ', () => { setShowMenu(false); })}
              {renderMenuItem('receipt-outline', 'Đơn hàng của my', () => { setShowMenu(false); })}
              {renderMenuItem('heart-outline', 'Sản phẩm yêu thích', () => { setShowMenu(false); })}
              {renderMenuItem('location-outline', 'Sổ địa chỉ', () => { setShowMenu(false); })}

              {currentUser?.role === 'admin' && renderMenuItem('shield-checkmark-outline', 'Bảng điều khiển Admin', () => { setShowMenu(false); }, true)}

              <View style={[styles.sheetDivider, { backgroundColor: colors.backgroundElement }]} />

              {currentUser
                ? renderMenuItem('log-out-outline', 'Đăng xuất', () => { setShowMenu(false); handleLogout(); }, false, true)
                : renderMenuItem('log-in-outline', 'Đăng nhập', () => { setShowMenu(false); }, true)
              }
            </View>
          </View>
        </Pressable>
      </Modal>

      <ConfirmModal
        visible={showLogoutConfirm}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: {
    width: '100%',
  },
  container: {
    paddingHorizontal: Spacing.three,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) + Spacing.two : Spacing.five,
    paddingBottom: Spacing.three,
    borderBottomWidth: 1,
  },
  topRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.two,
  },
  leftSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.two,
    flex: 1,
    minWidth: 0,
  },
  rightSection: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.one,
  },
  appName: {
    fontSize: FontSize.subheading,
    fontWeight: FontWeight.extrabold,
    letterSpacing: -0.5,
  },
  iconBtn: {
    width: 36,
    height: 36,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -4,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: FontWeight.extrabold,
  },
  searchModeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    gap: Spacing.three,
  },
  searchBar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    height: 38,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    paddingHorizontal: Spacing.two,
    gap: Spacing.one,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.body,
    padding: 0,
    height: '100%',
  },
  clearBtn: {
    padding: 4,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    borderTopLeftRadius: 28,
    borderTopRightRadius: 28,
    paddingTop: Spacing.two,
    paddingBottom: 40,
  },
  dragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: Spacing.three,
  },
  menuSheetContent: {
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.two,
  },
  menuHeader: {
    paddingVertical: Spacing.two,
  },
  userInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
  },
  avatarCircle: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  userFullName: {
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.bold,
    color: '#191c1e',
  },
  userEmail: {
    fontSize: FontSize.caption,
    marginTop: 2,
  },
  menuSheetTitle: {
    fontSize: FontSize.subheading,
    fontWeight: FontWeight.bold,
    color: '#191c1e',
  },
  menuSheetSubtitle: {
    fontSize: FontSize.caption,
    marginTop: 2,
  },
  sheetDivider: {
    height: 1,
    marginVertical: Spacing.two,
  },
  menuItem: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.three,
    paddingVertical: Spacing.three,
  },
  menuItemLabel: {
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.medium,
    color: '#191c1e',
  },
});
