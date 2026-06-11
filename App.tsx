import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Platform, SafeAreaView } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';

import SQLiteScreen from './components/sqlite/SQLiteScreen';
import { LoginScreen, RegisterScreen } from './components/sqlite/AuthScreens';
import { AuthProvider, useAuth } from './components/sqlite/AuthContext';
import { CartProvider, useCart } from './components/sqlite/CartContext';
import { CartScreen, OrderHistoryScreen, ProfileScreen } from './components/sqlite/UserScreens';
import { AdminPanel } from './components/sqlite/AdminScreens';
import { useLocalSearchParams, router } from 'expo-router';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows } from './constants/theme';

const colors = Colors.light;

function AppContent() {
  const { currentUser } = useAuth();
  const { cartCount } = useCart();
  const [activeTab, setActiveTab] = useState<string>('home');
  const params = useLocalSearchParams();

  useEffect(() => {
    if (params.tab && typeof params.tab === 'string') {
      setActiveTab(params.tab);
    }
  }, [params.tab]);

  useEffect(() => {
    setActiveTab('home');
  }, [currentUser]);

  const renderContent = () => {
    if (!currentUser) {
      switch (activeTab) {
        case 'home':
          return <SQLiteScreen onSwitchTab={setActiveTab} />;
        case 'login':
          return <LoginScreen onSwitchTab={setActiveTab} />;
        case 'register':
          return <RegisterScreen onSwitchTab={setActiveTab} />;
        default:
          return <SQLiteScreen onSwitchTab={setActiveTab} />;
      }
    } else if (currentUser.role === 'admin') {
      switch (activeTab) {
        case 'home':
          return <SQLiteScreen onSwitchTab={setActiveTab} />;
        case 'admin':
          return <AdminPanel />;
        case 'profile':
          return <ProfileScreen />;
        default:
          return <SQLiteScreen onSwitchTab={setActiveTab} />;
      }
    } else {
      switch (activeTab) {
        case 'home':
          return <SQLiteScreen onSwitchTab={setActiveTab} />;
        case 'cart':
          return <CartScreen />;
        case 'history':
          return <OrderHistoryScreen />;
        case 'profile':
          return <ProfileScreen />;
        default:
          return <SQLiteScreen onSwitchTab={setActiveTab} />;
      }
    }
  };

  const getTabs = () => {
    if (!currentUser) {
      return [
        { key: 'home', label: 'Trang chủ', icon: 'home', iconOutline: 'home-outline' },
        { key: 'login', label: 'Đăng nhập', icon: 'log-in', iconOutline: 'log-in-outline' },
        { key: 'register', label: 'Đăng ký', icon: 'person-add', iconOutline: 'person-add-outline' },
      ];
    } else if (currentUser.role === 'admin') {
      return [
        { key: 'home', label: 'Trang chủ', icon: 'home', iconOutline: 'home-outline' },
        { key: 'admin', label: 'Quản trị', icon: 'shield-checkmark', iconOutline: 'shield-checkmark-outline' },
        { key: 'profile', label: 'Tài khoản', icon: 'person', iconOutline: 'person-outline' },
      ];
    } else {
      return [
        { key: 'home', label: 'Trang chủ', icon: 'home', iconOutline: 'home-outline' },
        { key: 'cart', label: 'Giỏ hàng', icon: 'cart', iconOutline: 'cart-outline', showBadge: true },
        { key: 'history', label: 'Đơn hàng', icon: 'receipt', iconOutline: 'receipt-outline' },
        { key: 'profile', label: 'Tài khoản', icon: 'person', iconOutline: 'person-outline' },
      ];
    }
  };

  const tabs = getTabs();

  return (
    <View style={styles.root}>
      <StatusBar style="dark" />
      <View style={styles.content}>
        {renderContent()}
      </View>

      {/* Bottom Tab Bar */}
      <View style={[styles.tabBar, { backgroundColor: colors.card, borderTopColor: colors.border }]}>
        {tabs.map((tab) => {
          const isActive = activeTab === tab.key;
          return (
            <TouchableOpacity
              key={tab.key}
              style={styles.tabItem}
              onPress={() => {
                if (tab.key === 'history') {
                  router.push('/history');
                } else {
                  setActiveTab(tab.key);
                }
              }}
              activeOpacity={0.7}
            >
              <View style={isActive ? [styles.activeIconBg, { backgroundColor: colors.primaryGlow }] : undefined}>
                <Ionicons
                  name={(isActive ? tab.icon : tab.iconOutline) as any}
                  size={22}
                  color={isActive ? colors.tabIconSelected : colors.tabIconDefault}
                />
                {tab.showBadge && cartCount > 0 && (
                  <View style={[styles.badge, { backgroundColor: colors.secondary }]}>
                    <Text style={styles.badgeText}>{cartCount > 99 ? '99+' : cartCount}</Text>
                  </View>
                )}
              </View>
              <Text style={[styles.tabLabel, { color: isActive ? colors.tabIconSelected : colors.tabIconDefault, fontWeight: isActive ? '700' : '600' }]}>
                {tab.label}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
}

export default function App() {
  return <AppContent />;
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  tabBar: {
    flexDirection: 'row',
    height: 70,
    borderTopWidth: 1,
    paddingBottom: Spacing.two,
    paddingTop: Spacing.two,
  },
  tabItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  activeIconBg: {
    width: 40,
    height: 32,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  badge: {
    position: 'absolute',
    top: -2,
    right: -6,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  badgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: FontWeight.extrabold,
  },
  tabLabel: {
    fontSize: FontSize.small,
    marginTop: 2,
  },
});
