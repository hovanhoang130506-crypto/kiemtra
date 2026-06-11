import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  Image,
  TouchableOpacity,
  ScrollView,
  Alert,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useAuth } from '../components/sqlite/AuthContext';
import { router } from 'expo-router';
import {
  getUserOrders,
  getOrderItems,
  type Order,
  type OrderItem,
} from '../components/sqlite/database';

export default function HistoryScreen() {
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
      const items = orderItemsPreview[order.id] || (await getOrderItems(db, order.id));
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
      case 'Chờ xử lý':
        return { bg: '#FEF3C7', text: '#D97706', icon: 'time-outline' as const };
      case 'Đang giao':
        return { bg: '#DBEAFE', text: '#2563EB', icon: 'car-outline' as const };
      case 'Đã giao':
        return { bg: '#D1FAE5', text: '#059669', icon: 'checkmark-circle-outline' as const };
      case 'Đã hủy':
        return { bg: '#FEE2E2', text: '#DC2626', icon: 'close-circle-outline' as const };
      default:
        return { bg: '#F3F4F6', text: '#4B5563', icon: 'help-circle-outline' as const };
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

  if (!currentUser) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Lịch Sử Mua Hàng</Text>
          <View style={{ width: 32 }} />
        </View>
        <View style={styles.loginPromptContainer}>
          <View style={styles.loginIconContainer}>
            <Ionicons name="log-in-outline" size={48} color="#4F46E5" />
          </View>
          <Text style={styles.loginTitle}>Đăng nhập để xem lịch sử</Text>
          <Text style={styles.loginSubtitle}>
            Bạn cần đăng nhập để có thể xem lịch sử đơn hàng của mình
          </Text>
          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/')}
          >
            <Text style={styles.loginButtonText}>Đăng nhập ngay</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const renderOrderItem = ({ item, index }: { item: Order; index: number }) => {
    const statusInfo = getStatusInfo(item.status);
    const items = orderItemsPreview[item.id] || [];
    const firstItem = items[0];
    const itemCount = items.length;

    return (
      <TouchableOpacity
        style={[styles.orderCard, { marginTop: index === 0 ? 0 : 12 }]}
        onPress={() => handleViewDetails(item)}
        activeOpacity={0.7}
      >
        {/* Order Top Section */}
        <View style={styles.orderTop}>
          <View style={styles.orderLeft}>
            <Text style={styles.orderId}>#{item.id.toString().padStart(4, '0')}</Text>
            <Text style={styles.orderDate}>{formatDate(item.created_at)}</Text>
            <Text style={styles.orderTime}>{formatTime(item.created_at)}</Text>
          </View>
          <View style={[styles.statusBadge, { backgroundColor: statusInfo.bg }]}>
            <Ionicons name={statusInfo.icon} size={14} color={statusInfo.text} style={styles.statusIcon} />
            <Text style={[styles.statusText, { color: statusInfo.text }]}>{item.status}</Text>
          </View>
        </View>

        {/* Product Preview Section */}
        {firstItem && (
          <View style={styles.productPreviewContainer}>
            <View style={styles.productPreviewRow}>
              <Image
                source={{
                  uri: firstItem.product_img || 'https://placehold.co/100x100/e2e8f0/475569.png?text=No+Image',
                }}
                style={styles.productPreviewImage}
                resizeMode="cover"
              />
              <View style={styles.productPreviewInfo}>
                <Text style={styles.productPreviewName} numberOfLines={1}>
                  {firstItem.product_name}
                </Text>
                <Text style={styles.productPreviewQty}>x{firstItem.quantity}</Text>
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
        <View style={styles.orderBottom}>
          <View style={styles.orderTotalSection}>
            <Text style={styles.orderTotalLabel}>Tổng cộng</Text>
            <Text style={styles.orderTotalValue}>{item.total_price.toLocaleString('vi-VN')} đ</Text>
          </View>
          <View style={styles.viewDetailsButton}>
            <Text style={styles.viewDetailsText}>Chi tiết</Text>
            <Ionicons name="chevron-forward" size={16} color="#4F46E5" />
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
            <Ionicons name="arrow-back" size={24} color="#111827" />
          </TouchableOpacity>
          <View style={styles.headerCenter}>
            <Text style={styles.headerTitle}>Lịch Sử Mua Hàng</Text>
            <Text style={styles.headerSubtitle}>{orders.length} đơn hàng</Text>
          </View>
          <View style={{ width: 32 }} />
        </View>

        {isLoading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#4F46E5" />
            <Text style={styles.loadingText}>Đang tải...</Text>
          </View>
        ) : (
          <FlatList
            data={orders}
            renderItem={renderOrderItem}
            keyExtractor={(item) => item.id.toString()}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            onRefresh={loadOrders}
            refreshing={isLoading}
            ListEmptyComponent={
              <View style={styles.emptyContainer}>
                <View style={styles.emptyIconContainer}>
                  <Ionicons name="receipt-outline" size={64} color="#C7D2FE" />
                </View>
                <Text style={styles.emptyTitle}>Chưa có đơn hàng</Text>
                <Text style={styles.emptySubtitle}>Lịch sử mua hàng của bạn sẽ hiển thị ở đây</Text>
                <TouchableOpacity style={styles.shopButton} onPress={() => router.push('/')}>
                  <Text style={styles.shopButtonText}>Mua sắm ngay</Text>
                </TouchableOpacity>
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
            <View style={styles.modalContent}>
              {/* Modal Header */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHandle} />
                <View style={styles.modalHeaderRow}>
                  <Text style={styles.modalTitle}>Đơn hàng #{selectedOrder?.id.toString().padStart(4, '0')}</Text>
                  <TouchableOpacity onPress={() => setIsModalVisible(false)} style={styles.closeButton}>
                    <Ionicons name="close" size={22} color="#6B7280" />
                  </TouchableOpacity>
                </View>
              </View>

              {selectedOrder && (
                <ScrollView showsVerticalScrollIndicator={false} style={styles.modalScrollContent}>
                  {/* Status Section */}
                  <View style={styles.modalStatusSection}>
                    <View style={[styles.modalStatusBadge, { backgroundColor: getStatusInfo(selectedOrder.status).bg }]}>
                      <Ionicons name={getStatusInfo(selectedOrder.status).icon} size={20} color={getStatusInfo(selectedOrder.status).text} />
                      <Text style={[styles.modalStatusText, { color: getStatusInfo(selectedOrder.status).text }]}>
                        {selectedOrder.status}
                      </Text>
                    </View>
                  </View>

                  {/* Order Info Card */}
                  <View style={styles.modalInfoCard}>
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="calendar-outline" size={18} color="#6B7280" />
                      <Text style={styles.modalInfoLabel}>Ngày đặt:</Text>
                      <Text style={styles.modalInfoValue}>
                        {formatDate(selectedOrder.created_at)} {formatTime(selectedOrder.created_at)}
                      </Text>
                    </View>
                    <View style={styles.modalInfoDivider} />
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="person-outline" size={18} color="#6B7280" />
                      <Text style={styles.modalInfoLabel}>Người nhận:</Text>
                      <Text style={styles.modalInfoValue}>{selectedOrder.fullname}</Text>
                    </View>
                    <View style={styles.modalInfoDivider} />
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="call-outline" size={18} color="#6B7280" />
                      <Text style={styles.modalInfoLabel}>Điện thoại:</Text>
                      <Text style={styles.modalInfoValue}>{selectedOrder.phone}</Text>
                    </View>
                    <View style={styles.modalInfoDivider} />
                    <View style={styles.modalInfoRow}>
                      <Ionicons name="location-outline" size={18} color="#6B7280" />
                      <Text style={styles.modalInfoLabel}>Địa chỉ:</Text>
                      <Text style={styles.modalInfoValue}>{selectedOrder.address}</Text>
                    </View>
                  </View>

                  {/* Products Section */}
                  <Text style={styles.modalSectionTitle}>Sản phẩm ({selectedOrderItems.length})</Text>

                  {selectedOrderItems.map((item, idx) => (
                    <View key={item.id} style={[styles.modalProductCard, idx === 0 && { marginTop: 0 }]}>
                      <Image
                        source={{
                          uri: item.product_img || 'https://placehold.co/80x80/e2e8f0/475569.png?text=No+Image',
                        }}
                        style={styles.modalProductImage}
                        resizeMode="cover"
                      />
                      <View style={styles.modalProductInfo}>
                        <Text style={styles.modalProductName} numberOfLines={2}>
                          {item.product_name}
                        </Text>
                        <View style={styles.modalProductDetails}>
                          <Text style={styles.modalProductQty}>x{item.quantity}</Text>
                          <Text style={styles.modalProductPrice}>{item.price.toLocaleString('vi-VN')} đ</Text>
                        </View>
                      </View>
                      <Text style={styles.modalProductSubtotal}>{(item.price * item.quantity).toLocaleString('vi-VN')} đ</Text>
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

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  container: {
    flex: 1,
    backgroundColor: '#F9FAFB',
  },
  header: {
    backgroundColor: '#FFFFFF',
    paddingTop: Platform.OS === 'ios' ? 12 : 16,
    paddingBottom: 16,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E5E7EB',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backBtn: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerCenter: {
    flex: 1,
    alignItems: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  listContent: {
    padding: 16,
    paddingBottom: 100,
  },
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    shadowColor: '#4F46E5',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  orderTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  orderLeft: {
    flex: 1,
  },
  orderId: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  orderDate: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 4,
    fontWeight: '500',
  },
  orderTime: {
    fontSize: 12,
    color: '#9CA3AF',
    marginTop: 2,
  },
  statusBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  statusIcon: {
    marginRight: 4,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '700',
  },
  productPreviewContainer: {
    backgroundColor: '#F9FAFB',
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
    backgroundColor: '#E5E7EB',
  },
  productPreviewInfo: {
    flex: 1,
    marginLeft: 12,
  },
  productPreviewName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
  },
  productPreviewQty: {
    fontSize: 12,
    color: '#6B7280',
    marginTop: 2,
  },
  itemCountBadge: {
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
  },
  itemCountText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#4F46E5',
  },
  orderBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F3F4F6',
  },
  orderTotalSection: {
    flex: 1,
  },
  orderTotalLabel: {
    fontSize: 12,
    color: '#9CA3AF',
    fontWeight: '500',
  },
  orderTotalValue: {
    fontSize: 17,
    fontWeight: '800',
    color: '#EF4444',
    marginTop: 2,
  },
  viewDetailsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EEF2FF',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 12,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#4F46E5',
    marginRight: 4,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingTop: 100,
  },
  loadingText: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 12,
    fontWeight: '500',
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingTop: 80,
    paddingHorizontal: 40,
  },
  emptyIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  emptyTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  emptySubtitle: {
    fontSize: 14,
    color: '#9CA3AF',
    textAlign: 'center',
    lineHeight: 20,
  },
  shopButton: {
    marginTop: 24,
    backgroundColor: '#4F46E5',
    paddingHorizontal: 28,
    paddingVertical: 14,
    borderRadius: 14,
  },
  shopButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  loginPromptContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
  },
  loginIconContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: '#EEF2FF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 24,
  },
  loginTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 8,
  },
  loginSubtitle: {
    fontSize: 14,
    color: '#6B7280',
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#4F46E5',
    paddingHorizontal: 32,
    paddingVertical: 14,
    borderRadius: 14,
  },
  loginButtonText: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },

  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
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
  modalHeader: {
    paddingTop: 12,
    paddingHorizontal: 20,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F3F4F6',
  },
  modalHandle: {
    width: 40,
    height: 4,
    backgroundColor: '#D1D5DB',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  modalHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: '#111827',
    letterSpacing: -0.3,
  },
  closeButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalScrollContent: {
    maxHeight: '80%',
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
    backgroundColor: '#F9FAFB',
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
    color: '#6B7280',
    fontWeight: '500',
    marginLeft: 10,
    width: 90,
  },
  modalInfoValue: {
    fontSize: 14,
    color: '#111827',
    fontWeight: '600',
    flex: 1,
  },
  modalInfoDivider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 4,
  },
  modalSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#111827',
    marginBottom: 12,
  },
  modalProductCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginTop: 8,
  },
  modalProductImage: {
    width: 56,
    height: 56,
    borderRadius: 10,
    backgroundColor: '#F3F4F6',
  },
  modalProductInfo: {
    flex: 1,
    marginLeft: 12,
  },
  modalProductName: {
    fontSize: 14,
    fontWeight: '600',
    color: '#111827',
    marginBottom: 4,
  },
  modalProductDetails: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  modalProductQty: {
    fontSize: 13,
    color: '#6B7280',
    fontWeight: '500',
  },
  modalProductPrice: {
    fontSize: 13,
    color: '#6B7280',
  },
  modalProductSubtotal: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  modalTotalSection: {
    backgroundColor: '#F9FAFB',
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
    color: '#6B7280',
  },
  modalTotalValue: {
    fontSize: 20,
    fontWeight: '800',
    color: '#EF4444',
  },
});
