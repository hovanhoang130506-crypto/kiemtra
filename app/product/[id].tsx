import React, { useEffect, useState, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Platform,
  ActivityIndicator,
} from 'react-native';
import { useLocalSearchParams, router } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import {
  getProductById,
  type ProductWithCategory,
} from '../../components/sqlite/database';
import { useCart } from '../../components/sqlite/CartContext';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows } from '../../constants/theme';

const colors = Colors.light;

export default function ProductDetailScreen() {
  const { id } = useLocalSearchParams();
  const db = useSQLiteContext();
  const { addItem, cartCount } = useCart();

  const [product, setProduct] = useState<ProductWithCategory | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const loadProductDetail = useCallback(async () => {
    if (!id) return;
    try {
      setIsLoading(true);
      const result = await getProductById(db, Number(id));
      if (result) {
        setProduct(result);
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy sản phẩm này.');
        router.back();
      }
    } catch (error) {
      console.error('Lỗi khi tải chi tiết sản phẩm:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra khi lấy thông tin sản phẩm.');
    } finally {
      setIsLoading(false);
    }
  }, [db, id]);

  useEffect(() => {
    loadProductDetail();
  }, [loadProductDetail]);

  if (isLoading) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Đang tải chi tiết...</Text>
      </SafeAreaView>
    );
  }

  if (!product) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.errorText}>Không tìm thấy dữ liệu sản phẩm.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => router.back()}
        >
          <Ionicons name="arrow-back" size={20} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Chi Tiết Sản Phẩm</Text>
        <TouchableOpacity
          style={styles.headerCartButton}
          onPress={() => router.push('/cart')}
          activeOpacity={0.7}
        >
          <Ionicons name="cart-outline" size={22} color={colors.primary} />
          {cartCount > 0 && (
            <View style={styles.headerCartBadge}>
              <Text style={styles.headerCartBadgeText}>{cartCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        <View style={styles.imageContainer}>
          <Image
            source={{ uri: product.img || 'https://placehold.co/600x600/e2e8f0/475569.png?text=No+Image' }}
            style={product.img ? styles.productImage : styles.placeholderImage}
            resizeMode={product.img ? 'cover' : 'cover'}
          />
        </View>

        <View style={styles.mainInfo}>
          <View style={styles.categoryRow}>
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryBadgeText}>{product.category_name}</Text>
            </View>
            <View style={styles.ratingRow}>
              <Ionicons name="star" size={14} color={colors.star} />
              <Text style={styles.ratingText}>4.8</Text>
            </View>
          </View>

          <Text style={styles.productName}>{product.name}</Text>

          <View style={styles.priceRow}>
            <Text style={styles.productPrice}>
              {product.price ? `${product.price.toLocaleString('vi-VN')}` : '0'}
            </Text>
            <Text style={styles.priceCurrency}>đ</Text>
          </View>
        </View>

        <View style={styles.divider} />

        <View style={styles.descSection}>
          <Text style={styles.sectionTitle}>Mô tả sản phẩm</Text>
          <Text style={styles.description}>
            {product.description?.trim()
              ? product.description
              : 'Không có mô tả chi tiết cho sản phẩm này. Sản phẩm được đảm bảo chất lượng tốt nhất từ nhà cung cấp.'}
          </Text>
        </View>

        <View style={styles.descSection}>
          <Text style={styles.sectionTitle}>Thông tin thêm</Text>
          <View style={styles.infoGrid}>
            <View style={styles.infoItem}>
              <Ionicons name="shield-checkmark-outline" size={20} color={colors.primary} />
              <Text style={styles.infoText}>Bảo hành 12 tháng</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="car-outline" size={20} color={colors.primary} />
              <Text style={styles.infoText}>Miễn phí vận chuyển</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="refresh-outline" size={20} color={colors.primary} />
              <Text style={styles.infoText}>Đổi trả trong 7 ngày</Text>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.buttonGroup}>
        <TouchableOpacity
          style={styles.btnAddToCart}
          onPress={() => addItem(product.id, 1)}
          activeOpacity={0.8}
        >
          <Ionicons name="cart-outline" size={20} color="#FFFFFF" />
          <Text style={styles.btnAddToCartText}>Thêm vào giỏ hàng</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: colors.background,
  },
  loadingText: {
    marginTop: Spacing.md,
    fontSize: FontSize.body,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  errorText: {
    fontSize: FontSize.body,
    color: colors.error,
    fontWeight: FontWeight.semibold,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md + 2,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    backgroundColor: colors.card,
  },
  backButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundElement,
  },
  headerCartButton: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  headerCartBadge: {
    position: 'absolute',
    right: -3,
    top: -3,
    backgroundColor: colors.secondary,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  headerCartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: FontWeight.extrabold,
  },
  headerTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.extrabold,
    color: colors.text,
  },
  scrollContent: {
    padding: Spacing.lg,
  },
  imageContainer: {
    width: '100%',
    height: 280,
    backgroundColor: colors.backgroundElement,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  placeholderImage: {
    width: '100%',
    height: '100%',
  },
  mainInfo: {
    marginTop: Spacing.lg,
  },
  categoryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryBadge: {
    backgroundColor: colors.primaryGlow,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
  },
  categoryBadgeText: {
    fontSize: FontSize.tiny,
    color: colors.primary,
    fontWeight: FontWeight.bold,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  ratingText: {
    fontSize: FontSize.small,
    fontWeight: FontWeight.bold,
    color: colors.text,
  },
  productName: {
    fontSize: FontSize.heading,
    fontWeight: FontWeight.extrabold,
    color: colors.text,
    marginTop: Spacing.md,
    lineHeight: 30,
    letterSpacing: -0.3,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    marginTop: Spacing.sm + 2,
  },
  productPrice: {
    fontSize: 26,
    fontWeight: FontWeight.extrabold,
    color: colors.primary,
    letterSpacing: -0.5,
  },
  priceCurrency: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: colors.primary,
    marginLeft: 2,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: Spacing.xl,
  },
  descSection: {
    marginBottom: Spacing.xl,
  },
  sectionTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: colors.text,
    marginBottom: Spacing.md,
  },
  description: {
    fontSize: FontSize.body,
    color: colors.textSecondary,
    lineHeight: 24,
    fontWeight: FontWeight.medium,
  },
  infoGrid: {
    gap: Spacing.md,
  },
  infoItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.md,
  },
  infoText: {
    fontSize: FontSize.body,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
  },
  buttonGroup: {
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
    backgroundColor: colors.card,
    paddingBottom: Platform.OS === 'ios' ? Spacing.xl : Spacing.md,
  },
  btnAddToCart: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.md + 2,
    borderRadius: BorderRadius.lg,
    backgroundColor: colors.primary,
    gap: Spacing.sm,
    ...Shadows.md,
  },
  btnAddToCartText: {
    color: '#FFFFFF',
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },
});
