import React, { useEffect, useState, useCallback, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  Image,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Platform,
  Dimensions,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useFocusEffect, router } from 'expo-router';
import {
  getAllCategories,
  getAllProducts,
  getProductsByCategory,
  type Category,
  type ProductWithCategory,
} from './database';
import { useAuth } from './AuthContext';
import { useCart } from './CartContext';
import Header from './Header';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows, CategoryTints, CategoryIcons } from '../../constants/theme';

const colors = Colors.light;
const SCREEN_WIDTH = Dimensions.get('window').width;

const BANNERS = [
  { id: '1', badge: 'MEGA SALE', title: 'Chào mừng đến\nS1DN', btn: 'Mua Ngay', image: require('../../assets/images/banner1.png') },
  { id: '2', badge: 'GIẢM 50%', title: 'Ưu đãi mùa hè\nSố lượng có hạn', btn: 'Khám phá', image: require('../../assets/images/banner2.png') },
  { id: '3', badge: 'FREESHIP', title: 'Miễn phí vận chuyển\nCho đơn từ 500k', btn: 'Đặt ngay', image: require('../../assets/images/banner3.png') },
];

interface SQLiteScreenProps {
  onSwitchTab?: (tab: string) => void;
}

export default function SQLiteScreen({ onSwitchTab }: SQLiteScreenProps) {
  return (
    <View style={styles.safeArea}>
      <ProductList onSwitchTab={onSwitchTab} />
    </View>
  );
}

function ProductList({ onSwitchTab }: SQLiteScreenProps) {
  const db = useSQLiteContext();
  const { currentUser } = useAuth();
  const { addItem, cartCount } = useCart();

  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showPriceFilter, setShowPriceFilter] = useState(false);
  const [activeBanner, setActiveBanner] = useState(0);
  const bannerRef = useRef<FlatList>(null);

  const selectPricePreset = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const isPresetActive = (min: string, max: string) => {
    return minPrice === min && maxPrice === max;
  };

  const onBannerScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const index = Math.round(x / SCREEN_WIDTH);
    setActiveBanner(index);
  }, []);

  useEffect(() => {
    const timer = setInterval(() => {
      const next = (activeBanner + 1) % BANNERS.length;
      bannerRef.current?.scrollToOffset({ offset: next * SCREEN_WIDTH, animated: true });
      setActiveBanner(next);
    }, 4000);
    return () => clearInterval(timer);
  }, [activeBanner]);

  const loadCategories = useCallback(async () => {
    try {
      const result = await getAllCategories(db);
      setCategories(result);
    } catch (error) {
      console.error('Lỗi khi tải danh mục:', error);
    }
  }, [db]);

  const loadProducts = useCallback(async () => {
    try {
      const result = selectedCategoryId
        ? await getProductsByCategory(db, selectedCategoryId)
        : await getAllProducts(db);
      setProducts(result);
    } catch (error) {
      console.error('Lỗi khi tải sản phẩm:', error);
    }
  }, [db, selectedCategoryId]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  useFocusEffect(useCallback(() => { loadProducts(); }, [loadProducts]));

  const filteredProducts = products.filter((product) => {
    const nameMatch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const categoryMatch = product.category_name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesSearch = nameMatch || categoryMatch;

    const price = product.price || 0;
    const min = minPrice.trim() ? parseInt(minPrice.trim(), 10) : 0;
    const max = maxPrice.trim() ? parseInt(maxPrice.trim(), 10) : Infinity;
    const matchesPrice = price >= min && price <= max;

    return matchesSearch && matchesPrice;
  });

  const activeCategoryName = selectedCategoryId
    ? categories.find((c) => c.id === selectedCategoryId)?.name
    : 'Tất cả';

  const renderProduct = ({ item }: { item: ProductWithCategory }) => (
    <TouchableOpacity
      activeOpacity={0.8}
      style={styles.productCard}
      onPress={() => router.push({ pathname: '/product/[id]', params: { id: item.id.toString() } })}
    >
      <View style={styles.productImageContainer}>
        <Image
          source={{ uri: item.img || 'https://placehold.co/400x400/f2f4f6/737686.png?text=No+Image' }}
          style={styles.productImage}
          resizeMode="cover"
        />
      </View>
      <View style={styles.productInfo}>
        <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
        <View style={styles.ratingRow}>
          <Ionicons name="star" size={12} color="#fb923c" />
          <Text style={styles.ratingText}>4.5</Text>
          <Text style={styles.ratingDivider}>·</Text>
          <Text style={styles.ratingCount}>(24)</Text>
        </View>
        <View style={styles.priceAndActionRow}>
          <View style={styles.priceCol}>
            <Text style={styles.productPrice}>
              {item.price ? item.price.toLocaleString('vi-VN') : '0'} đ
            </Text>
          </View>
          <TouchableOpacity
            style={[styles.cartCircleBtn, { backgroundColor: colors.primary }]}
            onPress={() => addItem(item.id, 1)}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={16} color="#ffffff" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <Header showSearch onSearchSubmit={(q) => setSearchQuery(q)} />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
        {/* Banner Carousel */}
        <View style={styles.bannerContainer}>
          <FlatList
            ref={bannerRef}
            data={BANNERS}
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            onMomentumScrollEnd={onBannerScroll}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => (
              <View style={{ width: SCREEN_WIDTH, height: 190 }}>
                <Image
                  source={item.image}
                  style={styles.bannerImage}
                  resizeMode="cover"
                />
                <View style={styles.bannerOverlay}>
                  <View style={[styles.bannerBadge, { backgroundColor: colors.secondaryLight }]}>
                    <Text style={[styles.bannerBadgeText, { color: colors.secondary }]}>{item.badge}</Text>
                  </View>
                  <Text style={styles.bannerTitle}>{item.title}</Text>
                  <TouchableOpacity style={[styles.bannerBtn, { backgroundColor: '#ffffff' }]} activeOpacity={0.8}>
                    <Text style={[styles.bannerBtnText, { color: colors.primary }]}>{item.btn}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}
          />
          <View style={styles.bannerDots}>
            {BANNERS.map((_, i) => (
              <View
                key={i}
                style={[styles.bannerDot, activeBanner === i && styles.bannerDotActive]}
              />
            ))}
          </View>
        </View>

        {/* Category Grid */}
        <View style={styles.categorySection}>
          <Text style={styles.sectionTitle}>Danh mục sản phẩm</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
            {categories.map((cat, index) => (
              <TouchableOpacity
                key={cat.id}
                style={styles.categoryItem}
                activeOpacity={0.7}
                onPress={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
              >
                <View style={[
                  styles.categoryIconCircle,
                  { backgroundColor: colors.card, borderColor: selectedCategoryId === cat.id ? colors.primary : colors.border },
                  selectedCategoryId === cat.id && { backgroundColor: colors.primaryLight },
                ]}>
                  <Ionicons
                    name={(CategoryIcons[cat.name] || 'grid-outline') as any}
                    size={24}
                    color={selectedCategoryId === cat.id ? colors.primary : colors.textSecondary}
                  />
                </View>
                <Text style={[styles.categoryName, selectedCategoryId === cat.id && { color: colors.primary, fontWeight: '700' }]} numberOfLines={1}>
                  {cat.name}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Price Filter Panel */}
        {showPriceFilter && (
          <View style={styles.priceFilterContainer}>
            <Text style={styles.priceFilterLabel}>Chọn nhanh khoảng giá:</Text>
            <View style={styles.presetContainer}>
              <TouchableOpacity
                style={[styles.presetChip, isPresetActive('', '') && styles.presetChipActive]}
                onPress={() => selectPricePreset('', '')}
              >
                <Text style={[styles.presetChipText, isPresetActive('', '') && styles.presetChipTextActive]}>
                  Tất cả
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.presetChip, isPresetActive('', '10000000') && styles.presetChipActive]}
                onPress={() => selectPricePreset('', '10000000')}
              >
                <Text style={[styles.presetChipText, isPresetActive('', '10000000') && styles.presetChipTextActive]}>
                  Dưới 10tr
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.presetChip, isPresetActive('10000000', '20000000') && styles.presetChipActive]}
                onPress={() => selectPricePreset('10000000', '20000000')}
              >
                <Text style={[styles.presetChipText, isPresetActive('10000000', '20000000') && styles.presetChipTextActive]}>
                  10tr - 20tr
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.presetChip, isPresetActive('20000000', '30000000') && styles.presetChipActive]}
                onPress={() => selectPricePreset('20000000', '30000000')}
              >
                <Text style={[styles.presetChipText, isPresetActive('20000000', '30000000') && styles.presetChipTextActive]}>
                  20tr - 30tr
                </Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.presetChip, isPresetActive('30000000', '') && styles.presetChipActive]}
                onPress={() => selectPricePreset('30000000', '')}
              >
                <Text style={[styles.presetChipText, isPresetActive('30000000', '') && styles.presetChipTextActive]}>
                  Trên 30tr
                </Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.priceFilterLabel}>Tự nhập khoảng giá (VNĐ):</Text>
            <View style={styles.priceInputsRow}>
              <TextInput
                style={styles.priceInput}
                placeholder="Từ: 0"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                value={minPrice}
                onChangeText={setMinPrice}
              />
              <Text style={styles.priceSeparator}>—</Text>
              <TextInput
                style={styles.priceInput}
                placeholder="Đến: tối đa"
                placeholderTextColor={colors.textTertiary}
                keyboardType="numeric"
                value={maxPrice}
                onChangeText={setMaxPrice}
              />
              {(minPrice.length > 0 || maxPrice.length > 0) && (
                <TouchableOpacity onPress={() => { setMinPrice(''); setMaxPrice(''); }} style={styles.clearPriceBtn}>
                  <Ionicons name="close-circle" size={16} color={colors.textTertiary} />
                </TouchableOpacity>
              )}
            </View>
          </View>
        )}

        {/* Small active filter indicator when panel is collapsed */}
        {!showPriceFilter && (minPrice.length > 0 || maxPrice.length > 0) && (
          <View style={styles.activeFilterBar}>
            <Ionicons name="funnel" size={14} color={colors.primary} />
            <Text style={[styles.activeFilterText, { color: colors.textSecondary }]}>
              Giá:{' '}
              {minPrice && maxPrice
                ? `${parseInt(minPrice).toLocaleString('vi-VN')} đ - ${parseInt(maxPrice).toLocaleString('vi-VN')} đ`
                : minPrice
                ? `Trên ${parseInt(minPrice).toLocaleString('vi-VN')} đ`
                : `Dưới ${parseInt(maxPrice).toLocaleString('vi-VN')} đ`}
            </Text>
            <TouchableOpacity onPress={() => { setMinPrice(''); setMaxPrice(''); }} style={styles.activeFilterClose}>
              <Ionicons name="close-circle" size={16} color={colors.primary} />
            </TouchableOpacity>
          </View>
        )}

        {/* Section Header */}
        <View style={styles.sectionHeader}>
          <View>
            <Text style={styles.sectionHeaderText}>🛍️ Tất cả sản phẩm</Text>
            <Text style={[styles.sectionHeaderCount, { color: colors.textTertiary, marginTop: 2 }]}>{filteredProducts.length} sản phẩm</Text>
          </View>
          <TouchableOpacity
            style={[
              styles.filterToggleBtn,
              { borderColor: colors.border },
              (showPriceFilter || minPrice || maxPrice) && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
            ]}
            onPress={() => setShowPriceFilter(!showPriceFilter)}
            activeOpacity={0.7}
          >
            <Ionicons
              name="funnel-outline"
              size={14}
              color={(showPriceFilter || minPrice || maxPrice) ? colors.primary : colors.textSecondary}
            />
            <Text style={[
              styles.filterToggleBtnText,
              { color: (showPriceFilter || minPrice || maxPrice) ? colors.primary : colors.textSecondary }
            ]}>
              {(minPrice || maxPrice) ? 'Đang lọc' : 'Lọc giá'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Product Grid */}
        {filteredProducts.length === 0 ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bag-handle-outline" size={64} color={colors.border} />
            <Text style={[styles.emptyTitle, { color: colors.text }]}>Chưa có sản phẩm</Text>
            <Text style={[styles.emptySubtitle, { color: colors.textTertiary }]}>Danh mục này chưa có sản phẩm nào.</Text>
          </View>
        ) : (
          <View style={styles.productGrid}>
            {filteredProducts.map((item) => (
              <View key={item.id} style={styles.productGridItem}>
                {renderProduct({ item })}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContent: {
    paddingBottom: 100,
  },

  // Banner
  bannerContainer: {
    width: '100%',
    height: 190,
    position: 'relative',
  },
  bannerImage: {
    width: '100%',
    height: '100%',
  },
  bannerOverlay: {
    position: 'absolute',
    inset: 0,
    padding: Spacing.lg,
    justifyContent: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
  },
  bannerBadge: {
    paddingHorizontal: Spacing.sm,
    paddingVertical: 3,
    borderRadius: BorderRadius.full,
    alignSelf: 'flex-start',
    marginBottom: Spacing.xs,
  },
  bannerBadgeText: {
    fontSize: FontSize.tiny,
    fontWeight: FontWeight.bold,
  },
  bannerTitle: {
    color: '#ffffff',
    fontSize: FontSize.headlineMd,
    fontWeight: FontWeight.bold,
    lineHeight: 28,
    marginBottom: Spacing.md,
    maxWidth: '80%',
  },
  bannerBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.sm,
    alignSelf: 'flex-start',
  },
  bannerBtnText: {
    fontSize: FontSize.labelSm,
    fontWeight: FontWeight.bold,
  },
  bannerDots: {
    flexDirection: 'row',
    justifyContent: 'center',
    position: 'absolute',
    bottom: Spacing.sm,
    left: 0,
    right: 0,
    gap: 6,
  },
  bannerDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: 'rgba(255,255,255,0.4)',
  },
  bannerDotActive: {
    width: 18,
    backgroundColor: '#ffffff',
  },

  // Category
  categorySection: {
    paddingVertical: Spacing.md,
  },
  sectionTitle: {
    paddingHorizontal: Spacing.lg,
    marginBottom: Spacing.sm,
    fontSize: FontSize.heading,
    fontWeight: FontWeight.bold,
    color: colors.text,
  },
  categoryScroll: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.xs,
    gap: Spacing.md,
  },
  categoryItem: {
    alignItems: 'center',
    width: 76,
    gap: Spacing.xs,
  },
  categoryIconCircle: {
    width: 60,
    height: 60,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
  },
  categoryName: {
    fontSize: FontSize.labelSm,
    fontWeight: FontWeight.medium,
    color: colors.textSecondary,
    textAlign: 'center',
    width: '100%',
  },

  // Price Filter
  priceFilterContainer: {
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
    backgroundColor: colors.card,
    marginHorizontal: Spacing.three,
    borderRadius: BorderRadius.md,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...Shadows.sm,
  },
  priceFilterLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: Spacing.xs,
  },
  priceInputsRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  priceInput: {
    flex: 1,
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.xs,
    fontSize: FontSize.caption,
    color: colors.text,
  },
  priceSeparator: {
    marginHorizontal: Spacing.sm,
    color: colors.textTertiary,
  },
  clearPriceBtn: {
    marginLeft: Spacing.sm,
    padding: 4,
  },
  presetContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
    marginBottom: Spacing.md,
    marginTop: Spacing.xs,
  },
  presetChip: {
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.backgroundElement,
  },
  presetChipActive: {
    borderColor: colors.primary,
    backgroundColor: colors.primaryLight,
  },
  presetChipText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
    color: colors.textSecondary,
  },
  presetChipTextActive: {
    color: colors.primary,
    fontWeight: FontWeight.bold,
  },
  activeFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xs + 2,
    marginHorizontal: Spacing.three,
    borderRadius: BorderRadius.full,
    marginBottom: Spacing.sm,
    gap: 8,
    alignSelf: 'flex-start',
  },
  activeFilterText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
  },
  activeFilterClose: {
    padding: 2,
  },
  filterToggleBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: Spacing.sm + 4,
    paddingVertical: Spacing.xs + 2,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
  },
  filterToggleBtnText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
  },

  // Section Header
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  sectionHeaderText: {
    fontSize: FontSize.heading,
    fontWeight: FontWeight.extrabold,
    color: colors.text,
    letterSpacing: -0.3,
  },
  sectionHeaderCount: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
  },

  // Product Grid
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: Spacing.three,
    gap: Spacing.md,
  },
  productGridItem: {
    width: '47%',
  },
  productCard: {
    borderRadius: BorderRadius.md,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: colors.border + '33',
    backgroundColor: colors.card,
    ...Shadows.sm,
  },
  productImageContainer: {
    width: '100%',
    aspectRatio: 1,
    backgroundColor: colors.backgroundElement,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    paddingHorizontal: 10,
    paddingTop: Spacing.sm,
    paddingBottom: 10,
    gap: 2,
  },
  productName: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: colors.text,
    lineHeight: 18,
    height: 36,
  },
  ratingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 2,
  },
  ratingText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.medium,
    color: colors.textSecondary,
    marginLeft: 2,
  },
  ratingDivider: {
    fontSize: FontSize.caption,
    color: colors.textTertiary,
    marginHorizontal: 3,
  },
  ratingCount: {
    fontSize: FontSize.caption,
    color: colors.textTertiary,
  },
  priceAndActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: Spacing.sm,
    width: '100%',
  },
  priceCol: {
    flex: 1,
    height: 40,
    justifyContent: 'flex-start',
  },
  productPrice: {
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.bold,
    color: colors.primary,
  },
  cartCircleBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    ...Shadows.sm,
  },

  // Empty
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.bold,
  },
  emptySubtitle: {
    fontSize: FontSize.caption,
  },
});
