import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  SafeAreaView,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import Header from './Header';
import ConfirmModal from './ConfirmModal';
import SuccessModal from './SuccessModal';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows } from '../../constants/theme';
import { useSQLiteContext } from 'expo-sqlite';
import { router } from 'expo-router';
import { getUserOrders, getOrderItems, type Order, type OrderItem } from './database';

// ==========================================
// 1. MÀN HÌNH GIỎ HÀNG & THANH TOÁN (CART)
// ==========================================
export function CartScreen() {
  const { cartItems, cartTotal, updateQty, removeItemFromCart, checkout } = useCart();
  const { currentUser } = useAuth();
  
  // Trạng thái hiển thị form checkout
  const [isCheckoutMode, setIsCheckoutMode] = useState(false);
  
  // Form checkout
  const [fullname, setFullname] = useState(currentUser?.fullname || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');

  // Reset form checkout khi user thay đổi
  useEffect(() => {
    if (currentUser) {
      setFullname(currentUser.fullname);
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
    }
  }, [currentUser]);

  const handlePlaceOrder = async () => {
    if (!fullname.trim() || !phone.trim() || !address.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin nhận hàng.');
      return;
    }
    
    const success = await checkout(fullname, phone, address);
    if (success) {
      Alert.alert('Thành công', 'Đơn hàng của bạn đã được đặt thành công!');
      setIsCheckoutMode(false);
    }
  };

  const renderCartItem = ({ item }: { item: any }) => (
    <View style={styles.cartCard}>
      <Image
        source={{ uri: item.img || 'https://placehold.co/200x200/e2e8f0/475569.png?text=No+Image' }}
        style={styles.cartImage}
        resizeMode="contain"
      />
      <View style={styles.cartInfo}>
        <Text style={styles.cartName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.cartCategory}>{item.category_name}</Text>
        <Text style={styles.cartPrice}>{item.price.toLocaleString('vi-VN')} đ</Text>
        
        {/* Điều khiển số lượng */}
        <View style={styles.quantityContainer}>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => updateQty(item.id, item.quantity - 1)}
          >
            <Ionicons name="remove" size={16} color="#667085" />
          </TouchableOpacity>
          <Text style={styles.qtyText}>{item.quantity}</Text>
          <TouchableOpacity
            style={styles.qtyButton}
            onPress={() => updateQty(item.id, item.quantity + 1)}
          >
            <Ionicons name="add" size={16} color="#667085" />
          </TouchableOpacity>
        </View>
      </View>
      
      {/* Nút xóa */}
      <TouchableOpacity
        style={styles.deleteButton}
        onPress={() => removeItemFromCart(item.id)}
      >
        <Ionicons name="trash-outline" size={20} color="#EF4444" />
      </TouchableOpacity>
    </View>
  );

  if (isCheckoutMode) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.container}
        >
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setIsCheckoutMode(false)} style={styles.backBtn}>
              <Ionicons name="arrow-back" size={24} color="#101828" />
            </TouchableOpacity>
            <Text style={styles.title}>Thông Tin Nhận Hàng</Text>
            <View style={{ width: 40 }} />
          </View>

          <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
            <View style={styles.card}>
              <Text style={styles.label}>Họ và tên người nhận *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="person-outline" size={20} color="#98a2b3" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập họ và tên"
                  value={fullname}
                  onChangeText={setFullname}
                />
              </View>

              <Text style={styles.label}>Số điện thoại *</Text>
              <View style={styles.inputContainer}>
                <Ionicons name="call-outline" size={20} color="#98a2b3" style={styles.inputIcon} />
                <TextInput
                  style={styles.input}
                  placeholder="Nhập số điện thoại liên hệ"
                  keyboardType="phone-pad"
                  value={phone}
                  onChangeText={setPhone}
                />
              </View>

              <Text style={styles.label}>Địa chỉ giao hàng *</Text>
              <View style={[styles.inputContainer, styles.textAreaContainer]}>
                <Ionicons name="location-outline" size={20} color="#98a2b3" style={[styles.inputIcon, { marginTop: 10 }]} />
                <TextInput
                  style={[styles.input, styles.textArea]}
                  placeholder="Số nhà, tên đường, phường/xã, quận/huyện..."
                  multiline
                  numberOfLines={3}
                  value={address}
                  onChangeText={setAddress}
                />
              </View>
            </View>

            {/* Tóm tắt đơn hàng */}
            <View style={[styles.card, { marginTop: 16 }]}>
              <Text style={styles.sectionTitle}>Tóm tắt đơn hàng</Text>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Tổng tiền hàng</Text>
                <Text style={styles.summaryValue}>{cartTotal.toLocaleString('vi-VN')} đ</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryText}>Phí vận chuyển</Text>
                <Text style={[styles.summaryValue, { color: '#10B981' }]}>Miễn phí</Text>
              </View>
              <View style={styles.divider} />
              <View style={styles.summaryRow}>
                <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                <Text style={styles.totalValue}>{cartTotal.toLocaleString('vi-VN')} đ</Text>
              </View>
            </View>
            
            <TouchableOpacity style={styles.button} onPress={handlePlaceOrder}>
              <Text style={styles.buttonText}>Xác Nhận Đặt Hàng</Text>
            </TouchableOpacity>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#101828" />
          </TouchableOpacity>
          <View style={{ flex: 1, alignItems: 'center' }}>
            <Text style={styles.title}>Giỏ Hàng</Text>
            <Text style={styles.subtitle}>{cartItems.length} sản phẩm</Text>
          </View>
          <View style={{ width: 40 }} />
        </View>

        <FlatList
          data={cartItems}
          renderItem={renderCartItem}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={styles.listContent}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="cart-outline" size={80} color="#d0d5dd" />
              <Text style={styles.emptyText}>Giỏ hàng của bạn đang trống</Text>
            </View>
          }
        />

        {cartItems.length > 0 && (
          <View style={styles.cartFooter}>
            <View style={styles.footerRow}>
              <Text style={styles.totalLabel}>Tổng tiền:</Text>
              <Text style={styles.totalValue}>{cartTotal.toLocaleString('vi-VN')} đ</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              onPress={() => setIsCheckoutMode(true)}
            >
              <Text style={styles.checkoutText}>Tiến hành đặt hàng</Text>
              <Ionicons name="arrow-forward" size={18} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// 2. MÀN HÌNH LỊCH SỬ MUA HÀNG (HISTORY)
// ==========================================
export function OrderHistoryScreen() {
  const db = useSQLiteContext();
  const { currentUser } = useAuth();
  const [orders, setOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [orderItemsPreview, setOrderItemsPreview] = useState<Record<number, OrderItem[]>>({});

  const loadOrders = useCallback(async () => {
    if (!currentUser) return;
    setIsLoading(true);
    try {
      const list = await getUserOrders(db, currentUser.id);
      setOrders(list);
      // Load preview items for each order
      const previewData: Record<number, OrderItem[]> = {};
      for (const order of list) {
        const items = await getOrderItems(db, order.id);
        previewData[order.id] = items;
      }
      setOrderItemsPreview(previewData);
    } catch (error) {
      console.error('Lỗi khi tải lịch sử đơn hàng:', error);
    } finally {
      setIsLoading(false);
    }
  }, [db, currentUser]);

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const handleViewDetails = async (order: Order) => {
    try {
      const items = orderItemsPreview[order.id] || await getOrderItems(db, order.id);
      setSelectedOrder(order);
      setSelectedOrderItems(items);
      setIsModalVisible(true);
    } catch (error) {
      console.error('Lỗi khi tải chi tiết đơn hàng:', error);
      Alert.alert('Lỗi', 'Không thể lấy thông tin chi tiết đơn hàng.');
    }
  };

  const getStatusInfo = (status: string) => {
    switch (status) {
      case 'Chờ xử lý': return { bg: '#FEF3C7', text: '#D97706', icon: 'time-outline' as const };
      case 'Đang giao': return { bg: '#DBEAFE', text: '#2563EB', icon: 'car-outline' as const };
      case 'Đã giao': return { bg: '#D1FAE5', text: '#059669', icon: 'checkmark-circle-outline' as const };
      case 'Đã hủy': return { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle-outline' as const };
      default: return { bg: '#eef0f3', text: '#667085', icon: 'help-circle-outline' as const };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();
      return `${day}/${month}/${year}`;
    } catch (e) {
      return isoString;
    }
  };

  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')}`;
    } catch (e) {
      return '';
    }
  };

  const renderOrderItem = ({ item, index }: { item: Order; index: number }) => {
    const statusInfo = getStatusInfo(item.status);
    const items = orderItemsPreview[item.id] || [];
    const firstItem = items[0];
    const itemCount = items.length;
    
    return (
      <TouchableOpacity
        style={[styles.modernOrderCard, { marginTop: index === 0 ? 0 : 12 }]}
        onPress={() => handleViewDetails(item)}
        activeOpacity={0.7}
      >
        {/* Order Top Section */}
        <View style={styles.modernOrderTop}>
          <View style={styles.modernOrderLeft}>
            <Text style={styles.modernOrderId}>#{item.id.toString().padStart(4, '0')}</Text>
            <Text style={styles.modernOrderDate}>{formatDate(item.created_at)}</Text>
            <Text style={styles.modernOrderTime}>{formatTime(item.created_at)}</Text>
          </View>
          <View style={[styles.modernStatusBadge, { backgroundColor: statusInfo.bg }]}>
            <Ionicons name={statusInfo.icon} size={14} color={statusInfo.text} style={styles.modernStatusIcon} />
            <Text style={[styles.modernStatusText, { color: statusInfo.text }]}>{item.status}</Text>
          </View>
        </View>

        {/* Product Preview Section */}
        {firstItem && (
          <View style={styles.productPreviewContainer}>
            <View style={styles.productPreviewRow}>
              <Image
                source={{ uri: firstItem.product_img || 'https://placehold.co/100x100/e2e8f0/475569.png?text=No+Image' }}
                style={styles.productPreviewImage}
                resizeMode="cover"
              />
              <View style={styles.productPreviewInfo}>
                <Text style={styles.productPreviewName} numberOfLines={1}>
                  {firstItem.product_name}
                </Text>
                <Text style={styles.productPreviewQty}>
                  x{firstItem.quantity}
                </Text>
              </View>
              {itemCount > 1 && (
                <View style={styles.itemCountBadge}>
                  <Text style={styles.itemCountText}>+{itemCount - 1}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Order Bottom Section */}
        <View style={styles.modernOrderBottom}>
          <View style={styles.modernOrderTotalSection}>
            <Text style={styles.modernOrderTotalLabel}>Tổng cộng</Text>
            <Text style={styles.modernOrderTotalValue}>{item.total_price.toLocaleString('vi-VN')} đ</Text>
          </View>
          <View style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>Chi tiết</Text>
            <Ionicons name="chevron-forward" size={16} color="#004ac6" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header hiển thị thông tin user */}
        <Header />

        {/* Header */}
        <View style={styles.modernHeader}>
          <View style={styles.headerContent}>
            <Text style={styles.modernTitle}>Lịch Sử Mua Hàng</Text>
            <Text style={styles.modernSubtitle}>{orders.length} đơn hàng đã đặt</Text>
          </View>
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#004ac6" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.modernListContent}
            showsVerticalScrollIndicator={false}
            onRefresh={loadOrders}
            refreshing={isLoading}
            ListEmptyComponent={
              <View style={styles.modernEmptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="receipt-outline" size={64} color="#C7D2FE" />
                </View>
                <Text style={styles.modernEmptyTitle}>Chưa có đơn hàng</Text>
                <Text style={styles.modernEmptySubtitle}>
                  Lịch sử mua hàng của bạn sẽ hiển thị ở đây
                </Text>
              </View>
            }
          />
        )}

        {/* Modal chi tiết đơn hàng */}
        <Modal
          visible={isModalVisible}
          animationType="slide"
          transparent={true}
          onRequestClose={() => setIsModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modernModalContent}>
              {/* Modal Header */}
              <View style={styles.modernModalHeader}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modernModalTitle}>
                    Đơn hàng #{selectedOrder?.id.toString().padStart(4, '0')}
                  </Text>
                  <TouchableOpacity 
                    onPress={() => setIsModalVisible(false)}
                    style={styles.closeButton}
                  >
                    <Ionicons name="close" size={22} color="#667085" />
                  </TouchableOpacity>
                </View>
              </View>

              {selectedOrder && (
                <ScrollView 
                  showsVerticalScrollIndicator={false} 
                  style={styles.modalScrollContent}
                  contentContainerStyle={styles.modalScrollContainer}
                >
                  {/* Status Section */}
                  <View style={styles.modalStatusSection}>
                    <View style={[styles.modalStatusBadge, { backgroundColor: getStatusInfo(selectedOrder.status).bg }]}>
                      <Ionicons 
                        name={getStatusInfo(selectedOrder.status).icon} 
                        size={20} 
                        color={getStatusInfo(selectedOrder.status).text} 
                      />
                      <Text style={[styles.modalStatusText, { color: getStatusInfo(selectedOrder.status).text }]}>
                        {selectedOrder.status}
                      </Text>
                    </View>
                  </View>

                  {/* Order Info Card */}
                  <View style={styles.modalInfoCard}>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="calendar-outline" size={18} color="#667085" />
                      <Text style={styles.modalInfoLabel}>Ngày đặt:</Text>
                      <Text style={styles.modalInfoValue}>
                        {formatDate(selectedOrder.created_at)} {formatTime(selectedOrder.created_at)}
                      </Text>
                    </View>
                    <View style={styles.modalInfoDivider} />
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="person-outline" size={18} color="#667085" />
                      <Text style={styles.modalInfoLabel}>Người nhận:</Text>
                      <Text style={styles.modalInfoValue}>{selectedOrder.fullname}</Text>
                    </View>
                    <View style={styles.modalInfoDivider} />
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="call-outline" size={18} color="#667085" />
                      <Text style={styles.modalInfoLabel}>Điện thoại:</Text>
                      <Text style={styles.modalInfoValue}>{selectedOrder.phone}</Text>
                    </View>
                    <View style={styles.modalInfoDivider} />
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="location-outline" size={18} color="#667085" />
                      <Text style={styles.modalInfoLabel}>Địa chỉ:</Text>
                      <Text style={styles.modalInfoValue}>{selectedOrder.address}</Text>
                    </View>
                  </View>

                  {/* Products Section */}
                  <View style={styles.modalSectionTitle}>
                    <Text style={styles.modalSectionTitleText}>Sản phẩm ({selectedOrderItems.length})</Text>
                  </View>
                  
                  {selectedOrderItems.map((item, idx) => (
                    <View key={item.id} style={[styles.modalProductCard, idx === 0 && styles.modalProductCardFirst]}>
                      <Image
                        source={{ uri: item.product_img || 'https://placehold.co/80x80/e2e8f0/475569.png?text=No+Image' }}
                        style={styles.modalProductImage}
                        resizeMode="cover"
                      />
                      <View style={styles.modalProductInfo}>
                        <Text style={styles.modalProductName} numberOfLines={2}>{item.product_name}</Text>
                        <View style={styles.modalProductDetails}>
                          <Text style={styles.modalProductQty}>x{item.quantity}</Text>
                          <Text style={styles.modalProductPrice}>{item.price.toLocaleString('vi-VN')} đ</Text>
                        </View>
                      </View>
                      <Text style={styles.modalProductSubtotal}>
                        {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                      </Text>
                    </View>
                  ))}

                  {/* Total Section */}
                  <View style={styles.modalTotalSection}>
                    <View style={styles.modalTotalRow}>
                      <Text style={styles.modalTotalLabel}>Tổng thanh toán</Text>
                      <Text style={styles.modalTotalValue}>{selectedOrder.total_price.toLocaleString('vi-VN')} đ</Text>
                    </View>
                  </View>
                </ScrollView>
              )}
            </View>
          </View>
        </Modal>
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// 3. MÀN HÌNH TÀI KHOẢN (PROFILE)
// ==========================================
export function ProfileScreen() {
  const { currentUser, logout, updateProfile } = useAuth();
  const db = useSQLiteContext();

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [fullname, setFullname] = useState(currentUser?.fullname || '');
  const [email, setEmail] = useState(currentUser?.email || '');
  const [phone, setPhone] = useState(currentUser?.phone || '');
  const [address, setAddress] = useState(currentUser?.address || '');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [orderCount, setOrderCount] = useState(0);
  const [successVisible, setSuccessVisible] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setFullname(currentUser.fullname);
      setEmail(currentUser.email);
      setPhone(currentUser.phone || '');
      setAddress(currentUser.address || '');
    }
  }, [currentUser]);

  useEffect(() => {
    if (currentUser?.id) {
      getUserOrders(db, currentUser.id).then(orders => {
        setOrderCount(orders.length);
      }).catch(() => console.warn('Không thể tải số lượng đơn hàng'));
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
      setSuccessVisible(true);
      setPassword('');
      setConfirmPassword('');
    } catch {
      Alert.alert('Lỗi', 'Không thể cập nhật thông tin cá nhân.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLogout = () => {
    setShowLogoutConfirm(true);
  };

  const confirmLogout = () => {
    setShowLogoutConfirm(false);
    logout();
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
                <Ionicons name="camera" size={14} color="#004ac6" />
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
              <Ionicons name="receipt-outline" size={16} color="#737686" />
              <Text style={styles.profileStatText}>{orderCount} đơn hàng</Text>
              <View style={styles.profileStatDot} />
              <Ionicons name="time-outline" size={16} color="#737686" />
              <Text style={styles.profileStatText}>{currentUser?.username}</Text>
            </View>
          </View>

          {/* Personal Info Card */}
          <View style={[styles.profileCard, { marginTop: 20 }]}>
            <View style={styles.profileSectionHeader}>
              <Ionicons name="person-outline" size={20} color="#004ac6" style={styles.profileSectionIcon} />
              <Text style={styles.profileSectionTitle}>Thông Tin Cá Nhân</Text>
            </View>

            <Text style={styles.profileFieldLabel}>Họ và tên *</Text>
            <View style={styles.profileInputContainer}>
              <Ionicons name="card-outline" size={20} color="#737686" style={styles.profileInputIcon} />
              <TextInput
                style={styles.profileInput}
                value={fullname}
                onChangeText={setFullname}
                placeholder="Nhập họ và tên"
                placeholderTextColor="#737686"
              />
            </View>

            <Text style={styles.profileFieldLabel}>Địa chỉ Email *</Text>
            <View style={styles.profileInputContainer}>
              <Ionicons name="mail-outline" size={20} color="#737686" style={styles.profileInputIcon} />
              <TextInput
                style={styles.profileInput}
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                placeholder="Nhập email"
                autoCapitalize="none"
                placeholderTextColor="#737686"
              />
            </View>

            <Text style={styles.profileFieldLabel}>Số điện thoại</Text>
            <View style={styles.profileInputContainer}>
              <Ionicons name="call-outline" size={20} color="#737686" style={styles.profileInputIcon} />
              <TextInput
                style={styles.profileInput}
                value={phone}
                onChangeText={setPhone}
                keyboardType="phone-pad"
                placeholder="Nhập số điện thoại"
                placeholderTextColor="#737686"
              />
            </View>

            <Text style={styles.profileFieldLabel}>Địa chỉ</Text>
            <View style={styles.profileInputContainer}>
              <Ionicons name="location-outline" size={20} color="#737686" style={styles.profileInputIcon} />
              <TextInput
                style={styles.profileInput}
                value={address}
                onChangeText={setAddress}
                placeholder="Nhập địa chỉ"
                placeholderTextColor="#737686"
              />
            </View>
          </View>

          {/* Security Card */}
          <View style={[styles.profileCard, { marginTop: 16 }]}>
            <View style={styles.profileSectionHeader}>
              <Ionicons name="lock-closed-outline" size={20} color="#004ac6" style={styles.profileSectionIcon} />
              <Text style={styles.profileSectionTitle}>Bảo Mật</Text>
            </View>

            <Text style={styles.profileFieldLabel}>Mật khẩu mới</Text>
            <View style={styles.profileInputContainer}>
              <Ionicons name="key-outline" size={20} color="#737686" style={styles.profileInputIcon} />
              <TextInput
                style={styles.profileInput}
                secureTextEntry={!showPassword}
                value={password}
                onChangeText={setPassword}
                placeholder="Nhập mật khẩu mới"
                autoCapitalize="none"
                placeholderTextColor="#737686"
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.profileEyeIcon}>
                <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={20} color="#737686" />
              </TouchableOpacity>
            </View>

            <Text style={styles.profileFieldLabel}>Xác nhận mật khẩu mới</Text>
            <View style={styles.profileInputContainer}>
              <Ionicons name="checkmark-circle-outline" size={20} color="#737686" style={styles.profileInputIcon} />
              <TextInput
                style={styles.profileInput}
                secureTextEntry={!showPassword}
                value={confirmPassword}
                onChangeText={setConfirmPassword}
                placeholder="Nhập lại mật khẩu mới"
                autoCapitalize="none"
                placeholderTextColor="#737686"
              />
            </View>

            <View style={styles.profilePasswordHint}>
              <Ionicons name="information-circle-outline" size={14} color="#737686" />
              <Text style={styles.profilePasswordHintText}>Để trống nếu không muốn thay đổi mật khẩu</Text>
            </View>
          </View>

          <View style={styles.profileActionsContainer}>
            <TouchableOpacity
              style={styles.profileHistoryCard}
              onPress={() => router.push('/history')}
              activeOpacity={0.7}
            >
              <View style={styles.profileHistoryLeft}>
                <View style={styles.profileHistoryIconBox}>
                  <Ionicons name="receipt-outline" size={22} color="#004ac6" />
                </View>
                <View style={styles.profileHistoryInfo}>
                  <Text style={styles.profileHistoryTitle}>Lịch Sử Mua Hàng</Text>
                  <Text style={styles.profileHistorySubtitle}>Xem các đơn hàng đã đặt</Text>
                </View>
              </View>
              <Ionicons name="chevron-forward" size={20} color="#737686" />
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
              <Ionicons name="log-out-outline" size={20} color="#dc2626" />
              <Text style={styles.profileLogoutText}>Đăng Xuất</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <ConfirmModal
        visible={showLogoutConfirm}
        title="Đăng xuất"
        message="Bạn có chắc chắn muốn đăng xuất khỏi ứng dụng không?"
        confirmText="Đăng xuất"
        cancelText="Hủy"
        onConfirm={confirmLogout}
        onCancel={() => setShowLogoutConfirm(false)}
      />

      <SuccessModal
        visible={successVisible}
        title="Cập nhật thành công"
        message="Thông tin cá nhân của bạn đã được lưu lại."
        onClose={() => setSuccessVisible(false)}
      />
    </SafeAreaView>
  );
}

// ==========================================
// STYLES SYSTEM (Vanilla StyleSheet)
// ==========================================
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 16,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#eef0f3',
  },
  backBtn: {
    padding: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: '800',
    color: '#101828',
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: '#667085',
    fontWeight: '600',
  },
  listContent: {
    padding: 16,
    paddingBottom: 40,
  },
  scrollContent: {
    padding: 20,
    paddingBottom: 40,
  },
  
  // Thẻ sản phẩm trong giỏ hàng
  cartCard: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eef0f3',
    alignItems: 'center',
  },
  cartImage: {
    width: 80,
    height: 80,
    borderRadius: 8,
    backgroundColor: '#f7f9fb',
  },
  cartInfo: {
    flex: 1,
    marginLeft: 12,
  },
  cartName: {
    fontSize: 15,
    fontWeight: '700',
    color: '#101828',
  },
  cartCategory: {
    fontSize: 11,
    color: '#98a2b3',
    marginTop: 2,
    fontWeight: '600',
  },
  cartPrice: {
    fontSize: 14,
    fontWeight: '700',
    color: '#EF4444',
    marginTop: 4,
  },
  quantityContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  qtyButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#eef0f3',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#eef0f3',
  },
  qtyText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#101828',
    marginHorizontal: 12,
  },
  deleteButton: {
    padding: 8,
  },
  
  // Footer giỏ hàng
  cartFooter: {
    backgroundColor: '#FFFFFF',
    padding: 20,
    borderTopWidth: 1,
    borderTopColor: '#eef0f3',
    paddingBottom: Platform.OS === 'ios' ? 24 : 20,
  },
  footerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  checkoutButton: {
    flexDirection: 'row',
    backgroundColor: '#004ac6',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    shadowColor: '#004ac6',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  checkoutText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  
  // Trạng thái trống
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 100,
    gap: 12,
  },
  emptyText: {
    fontSize: 15,
    color: '#98a2b3',
    fontWeight: '600',
  },

  // Thẻ Input & Card
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#eef0f3',
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 14,
  },
  label: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667085',
    marginBottom: 6,
    marginTop: 12,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f9fb',
    borderWidth: 1,
    borderColor: '#eef0f3',
    borderRadius: 10,
    paddingHorizontal: 12,
  },
  textAreaContainer: {
    alignItems: 'flex-start',
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    paddingVertical: 10,
    fontSize: 15,
    color: '#101828',
  },
  textArea: {
    height: 70,
    textAlignVertical: 'top',
  },
  eyeIcon: {
    padding: 4,
  },
  divider: {
    height: 1,
    backgroundColor: '#eef0f3',
    marginVertical: 12,
  },

  // Tóm tắt tiền
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  summaryText: {
    fontSize: 14,
    color: '#667085',
  },
  summaryValue: {
    fontSize: 14,
    color: '#101828',
    fontWeight: '600',
  },
  totalLabel: {
    fontSize: 16,
    fontWeight: '700',
    color: '#101828',
  },
  totalValue: {
    fontSize: 18,
    fontWeight: '800',
    color: '#EF4444',
  },

  // Các nút Button
  buttonGroup: {
    marginTop: 24,
    gap: 12,
  },
  button: {
    backgroundColor: '#004ac6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  btnDanger: {
    flexDirection: 'row',
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
  },
  btnDangerText: {
    color: '#DC2626',
    fontSize: 15,
    fontWeight: '700',
  },

  // History Shortcut Styles
  historyShortcut: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eef0f3',
    shadowColor: '#004ac6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 2,
  },
  historyShortcutLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  historyIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
  },
  historyInfo: {
    marginLeft: 12,
  },
  historyTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#101828',
  },
  historySubtitle: {
    fontSize: 12,
    color: '#667085',
    marginTop: 2,
  },

  // ==========================================
  // PROFILE REDESIGN STYLES
  // ==========================================
  profileSafeArea: {
    flex: 1,
    backgroundColor: '#f7f9fb',
  },
  profileScrollContent: {
    paddingBottom: 40,
  },
  // Profile Header
  profileHeaderContainer: {
    alignItems: 'center',
    paddingTop: 32,
    paddingBottom: 24,
    paddingHorizontal: 24,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#004ac6',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 4,
  },
  profileAvatarContainer: {
    marginBottom: 16,
  },
  profileAvatar: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#004ac6',
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
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#f7f9fb',
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  profileName: {
    fontSize: 22,
    fontWeight: '700',
    color: '#191c1e',
    marginBottom: 8,
  },
  profileRoleBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 9999,
    marginBottom: 16,
  },
  profileRoleBadgeMember: {
    backgroundColor: '#dbe1ff',
  },
  profileRoleBadgeAdmin: {
    backgroundColor: '#ffdcc5',
  },
  profileRoleText: {
    fontSize: 13,
    fontWeight: '600',
  },
  profileRoleTextMember: {
    color: '#004ac6',
  },
  profileRoleTextAdmin: {
    color: '#fb923c',
  },
  profileStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  profileStatText: {
    fontSize: 14,
    color: '#737686',
    fontWeight: '500',
  },
  profileStatDot: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#c3c6d7',
  },
  // Profile Cards
  profileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginHorizontal: 20,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  profileSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#f2f4f6',
  },
  profileSectionIcon: {
    marginRight: 8,
  },
  profileSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#191c1e',
  },
  profileFieldLabel: {
    fontSize: 14,
    fontWeight: '600',
    color: '#434655',
    marginBottom: 6,
    marginTop: 16,
  },
  profileInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f2f4f6',
    borderWidth: 1,
    borderColor: '#eceef0',
    borderRadius: 12,
    paddingHorizontal: 16,
  },
  profileInputIcon: {
    marginRight: 8,
  },
  profileInput: {
    flex: 1,
    paddingVertical: 12,
    fontSize: 14,
    color: '#191c1e',
  },
  profilePasswordHint: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 16,
    gap: 6,
  },
  profilePasswordHintText: {
    fontSize: 12,
    color: '#737686',
    fontWeight: '500',
  },
  profileEyeIcon: {
    padding: 8,
  },
  // Profile Actions
  profileActionsContainer: {
    paddingHorizontal: 20,
    marginTop: 24,
    gap: 12,
    paddingBottom: 48,
  },
  profileHistoryCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
  },
  profileHistoryLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  profileHistoryIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: 'rgba(0, 74, 198, 0.08)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileHistoryInfo: {
    marginLeft: 16,
  },
  profileHistoryTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#191c1e',
  },
  profileHistorySubtitle: {
    fontSize: 12,
    color: '#737686',
    fontWeight: '500',
    marginTop: 2,
  },
  profilePrimaryButton: {
    backgroundColor: '#004ac6',
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#004ac6',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.2,
    shadowRadius: 15,
    elevation: 6,
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
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#fecaca',
    backgroundColor: '#fef2f2',
  },
  profileLogoutText: {
    color: '#dc2626',
    fontSize: 15,
    fontWeight: '600',
  },

  // Lịch sử mua hàng
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#eef0f3',
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  orderId: {
    fontSize: 15,
    fontWeight: '700',
    color: '#101828',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '700',
  },
  orderDate: {
    fontSize: 13,
    color: '#98a2b3',
    marginTop: 4,
    fontWeight: '500',
  },
  orderFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eef0f3',
  },
  orderTotalLabel: {
    fontSize: 13,
    color: '#667085',
    fontWeight: '500',
  },
  orderTotalValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#EF4444',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxHeight: '90%',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eef0f3',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#101828',
  },
  infoSection: {
    gap: 6,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 8,
  },
  infoText: {
    fontSize: 13,
    color: '#667085',
  },
  semibold: {
    fontWeight: '600',
    color: '#101828',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  // Dòng sản phẩm trong đơn hàng
  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 8,
  },
  orderItemImage: {
    width: 44,
    height: 44,
    borderRadius: 6,
    backgroundColor: '#f7f9fb',
    borderWidth: 1,
    borderColor: '#eef0f3',
  },
  orderItemInfo: {
    flex: 1,
    marginLeft: 10,
  },
  orderItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#101828',
  },
  orderItemQty: {
    fontSize: 11,
    color: '#98a2b3',
  },
  orderItemPrice: {
    fontSize: 11,
    color: '#98a2b3',
  },
  orderItemSubtotal: {
    fontSize: 13,
    fontWeight: '700',
    color: '#101828',
  },

  // ==========================================
  // MODERN ORDER HISTORY STYLES
  // ==========================================
  modernHeader: {
    backgroundColor: '#FFFFFF',
    paddingTop: 20,
    paddingBottom: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eef0f3',
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernTitle: {
    fontSize: 26,
    fontWeight: '800',
    color: '#101828',
    letterSpacing: -0.5,
  },
  modernSubtitle: {
    fontSize: 14,
    color: '#667085',
    fontWeight: '500',
    marginTop: 2,
  },
  modernListContent: {
    padding: 16,
    paddingBottom: 100,
  },
  modernOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#eef0f3',
    shadowColor: '#004ac6',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  modernOrderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  modernOrderLeft: {
    flex: 1,
  },
  modernOrderId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#101828',
    letterSpacing: -0.3,
  },
  modernOrderDate: {
    fontSize: 13,
    color: '#667085',
    marginTop: 4,
    fontWeight: '500',
  },
  modernOrderTime: {
    fontSize: 12,
    color: '#98a2b3',
    marginTop: 2,
  },
  modernStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  modernStatusIcon: {
    marginRight: 4,
  },
  modernStatusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  productPreviewContainer: {
    backgroundColor: '#f7f9fb',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  productPreviewRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  productPreviewImage: {
    width: 48,
    height: 48,
    borderRadius: 10,
    backgroundColor: '#eef0f3',
  },
  productPreviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productPreviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#101828',
  },
  productPreviewQty: {
    fontSize: 12,
    color: '#667085',
    marginTop: 2,
  },
  itemCountBadge: {
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#004ac6',
  },
  modernOrderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eef0f3',
  },
  modernOrderTotalSection: {
    flex: 1,
  },
  modernOrderTotalLabel: {
    fontSize: 12,
    color: '#98a2b3',
    fontWeight: '500',
  },
  modernOrderTotalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#EF4444',
    marginTop: 2,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e8f0fe',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#004ac6',
    marginRight: 4,
  },
  modernEmptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#e8f0fe',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  modernEmptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 8,
  },
  modernEmptySubtitle: {
    fontSize: 14,
    color: '#98a2b3',
    textAlign: 'center',
    lineHeight: 20,
  },
  loadingText: {
    fontSize: 14,
    color: '#667085',
    marginTop: 12,
    fontWeight: '500',
  },

  // Modern Modal Styles
  modernModalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 28,
    width: '100%',
    maxHeight: '92%',
    marginTop: 'auto',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 8,
  },
  modernModalHeader: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#eef0f3',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#d0d5dd',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modernModalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#101828',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#eef0f3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollContent: {
    maxHeight: '80%',
  },
  modalScrollContainer: {
    padding: 20,
    paddingBottom: 32,
  },
  modalStatusSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  modalStatusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 24,
  },
  modalStatusText: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 8,
  },
  modalInfoCard: {
    backgroundColor: '#f7f9fb',
    borderRadius: 16,
    padding: 16,
    marginBottom: 20,
  },
  modalInfoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  modalInfoLabel: {
    fontSize: 13,
    color: '#667085',
    fontWeight: '500',
    marginLeft: 10,
    width: 90,
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#101828',
    fontWeight: '600',
    flex: 1,
  },
  modalInfoDivider: {
    height: 1,
    backgroundColor: '#eef0f3',
    marginVertical: 4,
  },
  modalSectionTitle: {
    marginBottom: 12,
  },
  modalSectionTitleText: {
    fontSize: 16,
    fontWeight: '700',
    color: '#101828',
  },
  modalProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#eef0f3',
  },
  modalProductCardFirst: {
    marginTop: 0,
  },
  modalProductImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#eef0f3',
  },
  modalProductInfo: {
    flex: 1,
    marginLeft: 12,
  },
  modalProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#101828',
    marginBottom: 4,
  },
  modalProductDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalProductQty: {
    fontSize: 13,
    color: '#667085',
    fontWeight: '500',
  },
  modalProductPrice: {
    fontSize: 13,
    color: '#667085',
  },
  modalProductSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#101828',
  },
  modalTotalSection: {
    backgroundColor: '#f7f9fb',
    borderRadius: 16,
    padding: 16,
    marginTop: 12,
  },
  modalTotalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTotalLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#667085',
  },
  modalTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#EF4444',
  },
});
