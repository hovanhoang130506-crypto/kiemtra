import { useState, useCallback, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  FlatList,
  Image,
  SafeAreaView,
  Platform,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useSQLiteContext } from 'expo-sqlite';
import { Ionicons } from '@expo/vector-icons';
import {
  getAllProducts,
  getProductsByCategory,
  getAllCategories,
  type ProductWithCategory,
  type Category,
} from '../components/sqlite/database';
import { useCart } from '../components/sqlite/CartContext';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows } from '../constants/theme';

const colors = Colors.light;

const POPULAR_SEARCHES = ['Điện thoại', 'Laptop', 'Phụ kiện', 'Tablet', 'Tai nghe'];

export default function SearchScreen() {
  const router = useRouter();
  const db = useSQLiteContext();
  const { addItem } = useCart();

  const [inputValue, setInputValue] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [showPriceFilter, setShowPriceFilter] = useState(false);

  const selectPricePreset = (min: string, max: string) => {
    setMinPrice(min);
    setMaxPrice(max);
  };

  const isPresetActive = (min: string, max: string) => {
    return minPrice === min && maxPrice === max;
  };

  useEffect(() => {
    getAllCategories(db).then(setCategories).catch(() => {});
  }, [db]);

  useEffect(() => {
    setIsLoading(true);
    const load = selectedCategoryId
      ? getProductsByCategory(db, selectedCategoryId)
      : getAllProducts(db);
    load
      .then(setProducts)
      .catch(() => {})
      .finally(() => setIsLoading(false));
  }, [db, selectedCategoryId]);

  const filteredProducts = products.filter((p) => {
    const matchesSearch = !searchQuery || (
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      p.category_name?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const price = p.price || 0;
    const minStr = minPrice.replace(/\D/g, '');
    const maxStr = maxPrice.replace(/\D/g, '');
    
    const min = minStr ? parseInt(minStr, 10) : 0;
    const max = maxStr ? parseInt(maxStr, 10) : Infinity;
    const matchesPrice = price >= min && price <= max;

    return matchesSearch && matchesPrice;
  });

  const handleSearch = () => setSearchQuery(inputValue.trim());
  const handlePopularSearch = (term: string) => {
    setInputValue(term);
    setSearchQuery(term);
  };

  const hasActiveSearch = searchQuery || selectedCategoryId || minPrice || maxPrice;

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
        <View style={styles.priceRow}>
          <Text style={styles.productPrice}>
            {item.price ? item.price.toLocaleString('vi-VN') : '0'} đ
          </Text>
        </View>
        <TouchableOpacity
          style={styles.cartBtn}
          onPress={() => addItem(item.id, 1)}
          activeOpacity={0.8}
        >
          <Ionicons name="cart-outline" size={16} color="#FFFFFF" />
        </TouchableOpacity>
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.safeArea}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={22} color={colors.text} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Tìm Kiếm</Text>
        <TouchableOpacity style={styles.cartBtnHeader} onPress={() => router.push('/cart')}>
          <Ionicons name="cart-outline" size={22} color={colors.primary} />
        </TouchableOpacity>
      </View>

      {/* Search Input */}
      <View style={styles.searchSection}>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: Spacing.sm }}>
          <View style={[styles.searchBar, { flex: 1 }]}>
            <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
            <TextInput
              style={styles.searchInput}
              placeholder="Tìm kiếm sản phẩm..."
              placeholderTextColor={colors.textTertiary}
              value={inputValue}
              onChangeText={setInputValue}
              onSubmitEditing={handleSearch}
              returnKeyType="search"
            />
            {inputValue.length > 0 && (
              <TouchableOpacity onPress={() => { setInputValue(''); setSearchQuery(''); }}>
                <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
              </TouchableOpacity>
            )}
          </View>
          <TouchableOpacity
            style={[
              styles.filterBtn,
              (showPriceFilter || minPrice || maxPrice) && { borderColor: colors.primary, backgroundColor: colors.primaryLight }
            ]}
            onPress={() => setShowPriceFilter(!showPriceFilter)}
            activeOpacity={0.7}
          >
            <Ionicons
              name={(showPriceFilter || minPrice || maxPrice) ? 'funnel' : 'funnel-outline'}
              size={18}
              color={(showPriceFilter || minPrice || maxPrice) ? colors.primary : colors.text}
            />
          </TouchableOpacity>
        </View>
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

      {/* Category Chips */}
      <View style={styles.chipSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.chipRow}>
          <TouchableOpacity
            style={[styles.chip, !selectedCategoryId && styles.chipActive]}
            onPress={() => setSelectedCategoryId(null)}
          >
            <Text style={[styles.chipText, !selectedCategoryId && styles.chipTextActive]}>
              Tất cả
            </Text>
          </TouchableOpacity>
          {categories.map((cat) => (
            <TouchableOpacity
              key={cat.id}
              style={[styles.chip, selectedCategoryId === cat.id && styles.chipActive]}
              onPress={() => setSelectedCategoryId(selectedCategoryId === cat.id ? null : cat.id)}
            >
              <Text style={[styles.chipText, selectedCategoryId === cat.id && styles.chipTextActive]}>
                {cat.name}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Small active filter indicator when panel is collapsed */}
      {!showPriceFilter && (minPrice.length > 0 || maxPrice.length > 0) && (
        <View style={styles.activeFilterBar}>
          <Ionicons name="funnel" size={14} color={colors.primary} />
          <Text style={[styles.activeFilterText, { color: colors.textSecondary }]}>
            Giá:{' '}
            {minPrice && maxPrice
              ? `${parseInt(minPrice.replace(/\D/g, '') || '0').toLocaleString('vi-VN')} đ - ${parseInt(maxPrice.replace(/\D/g, '') || '0').toLocaleString('vi-VN')} đ`
              : minPrice
              ? `Trên ${parseInt(minPrice.replace(/\D/g, '') || '0').toLocaleString('vi-VN')} đ`
              : `Dưới ${parseInt(maxPrice.replace(/\D/g, '') || '0').toLocaleString('vi-VN')} đ`}
          </Text>
          <TouchableOpacity onPress={() => { setMinPrice(''); setMaxPrice(''); }} style={styles.activeFilterClose}>
            <Ionicons name="close-circle" size={16} color={colors.primary} />
          </TouchableOpacity>
        </View>
      )}

      {/* Results count */}
      {hasActiveSearch && (
        <View style={styles.metadataBar}>
          <Text style={styles.resultsCount}>{filteredProducts.length} sản phẩm</Text>
          <TouchableOpacity onPress={() => { setSearchQuery(''); setSelectedCategoryId(null); setInputValue(''); setMinPrice(''); setMaxPrice(''); }}>
            <Text style={styles.clearFilters}>Xóa bộ lọc</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* Results or Suggestions */}
      {!hasActiveSearch ? (
        <ScrollView contentContainerStyle={styles.suggestions}>
          <Text style={styles.suggestTitle}>Tìm kiếm phổ biến</Text>
          <View style={styles.suggestTags}>
            {POPULAR_SEARCHES.map((term) => (
              <TouchableOpacity
                key={term}
                style={styles.suggestTag}
                onPress={() => handlePopularSearch(term)}
              >
                <Ionicons name="trending-up-outline" size={14} color={colors.primary} />
                <Text style={styles.suggestTagText}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProduct}
          keyExtractor={(item) => item.id.toString()}
          numColumns={2}
          contentContainerStyle={styles.listContent}
          columnWrapperStyle={styles.row}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Ionicons name="search-outline" size={64} color={colors.border} />
              <Text style={styles.emptyTitle}>Không tìm thấy kết quả</Text>
              <Text style={styles.emptySubtitle}>Hãy thử tìm kiếm với từ khóa khác</Text>
            </View>
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
    paddingTop: Platform.OS === 'android' ? 30 : 0,
  },
  filterBtn: {
    width: 48,
    height: 48,
    borderRadius: BorderRadius.xl,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.card,
  },
  priceFilterContainer: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    ...Shadows.sm,
  },
  priceFilterLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: Spacing.xs,
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
    fontSize: FontSize.labelSm,
    fontWeight: FontWeight.medium,
    color: colors.textSecondary,
  },
  presetChipTextActive: {
    color: colors.primary,
    fontWeight: FontWeight.bold,
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
  activeFilterBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.primaryLight,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.xs + 2,
    marginHorizontal: Spacing.marginMobile,
    borderRadius: BorderRadius.full,
    marginTop: Spacing.sm,
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
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.md,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  backBtn: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundElement,
  },
  headerTitle: {
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.extrabold,
    color: colors.text,
  },
  cartBtnHeader: {
    width: 38,
    height: 38,
    borderRadius: BorderRadius.full,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.primaryGlow,
  },
  searchSection: {
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.sm,
    backgroundColor: colors.card,
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElement,
    borderRadius: BorderRadius.xl,
    paddingHorizontal: Spacing.md,
    height: 48,
    gap: Spacing.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.body,
    color: colors.text,
    padding: 0,
  },
  chipSection: {
    backgroundColor: colors.card,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  chipRow: {
    paddingHorizontal: Spacing.marginMobile,
    gap: Spacing.sm,
  },
  chip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: 8,
    borderRadius: BorderRadius.full,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
  },
  chipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  chipText: {
    fontSize: FontSize.labelSm,
    fontWeight: FontWeight.medium,
    color: colors.textSecondary,
  },
  chipTextActive: {
    color: '#FFFFFF',
    fontWeight: FontWeight.bold,
  },
  metadataBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.marginMobile,
    paddingVertical: Spacing.sm,
  },
  resultsCount: {
    fontSize: FontSize.bodyMd,
    fontWeight: FontWeight.medium,
    color: colors.textSecondary,
  },
  clearFilters: {
    fontSize: FontSize.labelLg,
    fontWeight: FontWeight.bold,
    color: colors.error,
  },
  listContent: {
    padding: Spacing.marginMobile - 4,
    paddingBottom: 40,
  },
  row: {
    justifyContent: 'space-between',
  },
  productCard: {
    width: '48%',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    marginBottom: Spacing.md,
    overflow: 'hidden',
    ...Shadows.sm,
  },
  productImageContainer: {
    width: '100%',
    height: 140,
    backgroundColor: colors.backgroundElement,
  },
  productImage: {
    width: '100%',
    height: '100%',
  },
  productInfo: {
    padding: Spacing.sm,
  },
  productName: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    color: colors.text,
    marginBottom: 4,
  },
  priceRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
  },
  productPrice: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.extrabold,
    color: colors.primary,
  },
  cartBtn: {
    position: 'absolute',
    bottom: Spacing.sm,
    right: Spacing.sm,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestions: {
    padding: Spacing.marginMobile,
  },
  suggestTitle: {
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.bold,
    color: colors.text,
    marginBottom: Spacing.md,
  },
  suggestTags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: Spacing.sm,
  },
  suggestTag: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: Spacing.xs,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    ...Shadows.sm,
  },
  suggestTagText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.medium,
    color: colors.text,
  },
  emptyContainer: {
    alignItems: 'center',
    paddingTop: 80,
    gap: Spacing.sm,
  },
  emptyTitle: {
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.bold,
    color: colors.text,
  },
  emptySubtitle: {
    fontSize: FontSize.body,
    color: colors.textTertiary,
  },
});
