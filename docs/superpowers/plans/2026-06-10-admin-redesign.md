# Admin Page Redesign — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Redesign `AdminScreens.tsx` UI with modern card-based CRUD patterns inspired by ktm-reactnative, using theme tokens consistently.

**Architecture:** Single file rewrite of `AdminScreens.tsx`. No database changes, no new files, no new features. 4 tab components (Categories, Products, Users, Orders) redesigned with FAB, bottom sheet modals, card list items, search bars, filter pills.

**Tech Stack:** React Native, expo-router, SQLite, `react-native-element-dropdown`, `expo-image-picker`, `@expo/vector-icons`

---

### Task 1: Rewrite Admin Styles — Theme Token Migration

**Files:**
- Modify: `components/sqlite/AdminScreens.tsx:1076-1588`

Replace the entire StyleSheet with theme-token-based styles. Every hardcoded hex color, border radius, font size, shadow, and spacing value must use `colors.*`, `Spacing.*`, `BorderRadius.*`, `FontSize.*`, `FontWeight.*`, `Shadows.*`.

- [ ] **Step 1: Replace the existing styles with theme-token-based styles**

```typescript
// ==========================================
// STYLES SYSTEM
// ==========================================
const colors = Colors.light;

const styles = StyleSheet.create({
  // Layout
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: Spacing.three,
  },

  // Header
  headerWrapper: {
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.three,
  },
  headerTitle: {
    fontSize: FontSize.heading,
    fontWeight: FontWeight.extrabold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  headerSubtitle: {
    fontSize: FontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: FontWeight.semibold,
  },

  // Stats bar
  statsRow: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.four,
    paddingBottom: Spacing.three,
    gap: Spacing.two,
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.backgroundElement,
    borderRadius: BorderRadius.md,
    padding: Spacing.two,
    alignItems: 'center',
  },
  statValue: {
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.extrabold,
    color: colors.primary,
  },
  statLabel: {
    fontSize: FontSize.tiny,
    color: colors.textSecondary,
    fontWeight: FontWeight.medium,
    marginTop: 2,
  },

  // Tab Bar
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
    paddingHorizontal: Spacing.three,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.two + 4,
    gap: Spacing.one + 2,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: FontSize.labelSm,
    fontWeight: FontWeight.semibold,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: FontWeight.bold,
  },
  tabBadge: {
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
  },
  tabBadgeText: {
    fontSize: 9,
    fontWeight: FontWeight.extrabold,
    color: colors.primary,
  },

  // FAB
  fab: {
    position: 'absolute',
    right: Spacing.four,
    bottom: Spacing.four,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 100,
    ...Shadows.md,
  },

  // Card
  card: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    borderWidth: 1,
    borderColor: colors.border,
    ...Shadows.sm,
    marginBottom: Spacing.three,
  },
  cardTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: colors.text,
    marginBottom: Spacing.sm,
  },

  // Form elements
  formRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
    alignItems: 'center',
  },
  formInput: {
    flex: 1,
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.body,
    color: colors.text,
  },
  formBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: Spacing.four,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },
  formCancelBtn: {
    backgroundColor: colors.card,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: Spacing.three,
    paddingVertical: Spacing.sm + 2,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCancelBtnText: {
    color: colors.textSecondary,
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },

  // Search bar
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.md,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: Spacing.md,
    height: 44,
    gap: Spacing.sm,
    marginBottom: Spacing.three,
    ...Shadows.sm,
  },
  searchInput: {
    flex: 1,
    fontSize: FontSize.body,
    color: colors.text,
    padding: 0,
  },

  // Section header
  sectionHeader: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    color: colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },

  // List row (card item)
  listRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    ...Shadows.sm,
  },
  rowInfo: {
    flex: 1,
  },
  rowName: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: colors.text,
  },
  rowSub: {
    fontSize: FontSize.tiny,
    color: colors.textTertiary,
    marginTop: 2,
    fontWeight: FontWeight.medium,
  },
  rowActions: {
    flexDirection: 'row',
    gap: Spacing.xs,
    marginLeft: Spacing.sm,
  },
  actionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.sm,
    borderRadius: BorderRadius.sm,
  },
  actionBtnText: {
    fontSize: FontSize.tiny,
    fontWeight: FontWeight.bold,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: FontSize.body,
    marginTop: Spacing.six,
    fontWeight: FontWeight.medium,
  },

  // Modal bottom sheet
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalSheet: {
    backgroundColor: colors.card,
    borderTopLeftRadius: BorderRadius.xl,
    borderTopRightRadius: BorderRadius.xl,
    padding: Spacing.four,
    maxHeight: '85%',
  },
  modalDragHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.border,
    alignSelf: 'center',
    marginBottom: Spacing.three,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.three,
  },
  modalTitle: {
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.bold,
    color: colors.text,
  },
  modalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.backgroundElement,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    color: colors.textSecondary,
    marginBottom: Spacing.one + 2,
    marginTop: Spacing.md,
  },
  modalInput: {
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm + 2,
    fontSize: FontSize.body,
    color: colors.text,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
    paddingTop: Spacing.sm + 2,
  },
  selectImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    borderStyle: 'dashed',
    borderRadius: BorderRadius.sm,
    paddingVertical: Spacing.md,
    gap: Spacing.one + 2,
  },
  selectImageText: {
    color: colors.primary,
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: BorderRadius.sm,
    padding: Spacing.sm,
    gap: Spacing.md,
  },
  imagePreview: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.xs,
  },
  removeImageBtn: {
    backgroundColor: colors.dangerLight,
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.one + 2,
    borderRadius: BorderRadius.xs,
  },
  removeImageText: {
    color: colors.danger,
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
  },
  modalFooter: {
    flexDirection: 'row',
    gap: Spacing.md,
    marginTop: Spacing.four,
  },
  modalFooterBtn: {
    flex: 1,
    paddingVertical: Spacing.md,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalFooterBtnText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },
  dropdown: {
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.md,
    height: 46,
  },
  dropdownText: {
    fontSize: FontSize.body,
    color: colors.text,
    fontWeight: FontWeight.medium,
  },

  // Product admin image
  adminProductImage: {
    width: 50,
    height: 50,
    borderRadius: BorderRadius.xs,
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
  },

  // Filter pills (Orders)
  filterWrapper: {
    marginBottom: Spacing.md,
  },
  filterContainer: {
    gap: Spacing.sm,
  },
  filterChip: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderRadius: BorderRadius.full,
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
  },
  filterChipActive: {
    backgroundColor: colors.primary,
    borderColor: colors.primary,
  },
  filterText: {
    fontSize: FontSize.caption,
    color: colors.textSecondary,
    fontWeight: FontWeight.semibold,
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  // Order card
  orderCard: {
    backgroundColor: colors.card,
    borderRadius: BorderRadius.lg,
    padding: Spacing.three,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    ...Shadows.sm,
  },
  orderHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.sm,
  },
  orderId: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: colors.text,
  },
  statusBadge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.one + 2,
    borderRadius: BorderRadius.xs,
  },
  statusText: {
    fontSize: FontSize.tiny,
    fontWeight: FontWeight.bold,
  },
  orderDetail: {
    fontSize: FontSize.caption,
    color: colors.textTertiary,
    marginTop: 2,
    fontWeight: FontWeight.medium,
  },
  orderDate: {
    fontSize: FontSize.tiny,
    color: colors.textTertiary,
    marginTop: Spacing.xs,
    fontWeight: FontWeight.medium,
  },
  statusActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    paddingTop: Spacing.md,
    borderTopWidth: 1,
    borderTopColor: colors.border,
  },
  priceLabel: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.extrabold,
    color: colors.danger,
  },
  miniBtnGroup: {
    flexDirection: 'row',
    gap: Spacing.one + 2,
  },
  statusQuickBtn: {
    paddingHorizontal: Spacing.md,
    paddingVertical: Spacing.sm - 2,
    borderRadius: BorderRadius.xs,
  },
  quickBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.tiny,
    fontWeight: FontWeight.bold,
  },

  // Order detail modal
  infoSection: {
    gap: Spacing.one + 2,
  },
  infoTitle: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: colors.text,
    marginBottom: Spacing.xs,
  },
  infoText: {
    fontSize: FontSize.caption,
    color: colors.textTertiary,
  },
  infoLabel: {
    fontWeight: FontWeight.semibold,
    color: colors.text,
  },
  divider: {
    height: 1,
    backgroundColor: colors.border,
    marginVertical: Spacing.three,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },

  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.one + 2,
  },
  orderItemImage: {
    width: 40,
    height: 40,
    borderRadius: BorderRadius.xs,
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
  },
  orderItemInfo: {
    flex: 1,
    marginLeft: Spacing.sm,
  },
  orderItemName: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    color: colors.text,
  },
  orderItemQty: {
    fontSize: FontSize.tiny,
    color: colors.textTertiary,
  },
  orderItemPrice: {
    fontSize: FontSize.tiny,
    color: colors.textTertiary,
  },
  orderItemSubtotal: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    color: colors.text,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
    color: colors.text,
  },
  totalValue: {
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.extrabold,
    color: colors.danger,
  },

  // User avatar in list
  userAvatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.primaryGlow,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: Spacing.md,
  },
  userAvatarText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.extrabold,
    color: colors.primary,
  },
  roleBadge: {
    paddingHorizontal: Spacing.sm + 2,
    paddingVertical: Spacing.one,
    borderRadius: BorderRadius.xs,
    alignSelf: 'flex-start',
    marginTop: Spacing.one,
  },
  roleBadgeText: {
    fontSize: FontSize.tiny,
    fontWeight: FontWeight.bold,
  },
});
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No output (pass)

---

### Task 2: Rewrite AdminPanel Layout

**Files:**
- Modify: `components/sqlite/AdminScreens.tsx:48-120`

Rewrite the `AdminPanel` component with redesigned header, tab bar, and add FAB.

- [ ] **Step 1: Rewrite the AdminPanel component**

Replace `AdminPanel` function and its return JSX with:

```typescript
type AdminTab = 'categories' | 'products' | 'users' | 'orders';

const TAB_CONFIG = [
  { key: 'categories' as AdminTab, icon: 'folder-outline', label: 'Danh mục' },
  { key: 'products' as AdminTab, icon: 'basket-outline', label: 'Sản phẩm' },
  { key: 'users' as AdminTab, icon: 'people-outline', label: 'Người dùng' },
  { key: 'orders' as AdminTab, icon: 'receipt-outline', label: 'Đơn hàng' },
];

```

Replace the `AdminPanel` function:
```typescript
export function AdminPanel() {
  const router = useRouter();
  const db = useSQLiteContext();
  const [activeTab, setActiveTab] = useState<AdminTab>('categories');
  const [productCount, setProductCount] = useState(0);
  const [userCount, setUserCount] = useState(0);
  const [orderCount, setOrderCount] = useState(0);

  useFocusEffect(useCallback(() => {
    getAllProducts(db).then(p => setProductCount(p.length)).catch(() => {});
    getAllUsers(db).then(u => setUserCount(u.length)).catch(() => {});
    getAllOrders(db).then(o => setOrderCount(o.length)).catch(() => {});
  }, [db]));

  const renderContent = () => {
    switch (activeTab) {
      case 'categories':
        return <AdminCategoriesTab />;
      case 'products':
        return <AdminProductsTab />;
      case 'users':
        return <AdminUsersTab />;
      case 'orders':
        return <AdminOrdersTab />;
      default:
        return <AdminCategoriesTab />;
    }
  };

  const getCount = (tab: AdminTab) => {
    switch (tab) {
      case 'products': return productCount;
      case 'users': return userCount;
      case 'orders': return orderCount;
      default: return 0;
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <Header showSearch={false} />

        <View style={styles.headerWrapper}>
          <View style={styles.headerRow}>
            <View>
              <Text style={styles.headerTitle}>S1DN Admin</Text>
              <Text style={styles.headerSubtitle}>Bảng điều khiển</Text>
            </View>
            <TouchableOpacity onPress={() => router.back()} style={{ width: 38, height: 38, borderRadius: 19, backgroundColor: colors.backgroundElement, alignItems: 'center', justifyContent: 'center' }}>
              <Ionicons name="close-outline" size={20} color={colors.text} />
            </TouchableOpacity>
          </View>

          {/* Stats */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{productCount}</Text>
              <Text style={styles.statLabel}>Sản phẩm</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{userCount}</Text>
              <Text style={styles.statLabel}>Người dùng</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statValue}>{orderCount}</Text>
              <Text style={styles.statLabel}>Đơn hàng</Text>
            </View>
          </View>
        </View>

        {/* Tab Bar */}
        <View style={styles.tabBar}>
          {TAB_CONFIG.map((tab) => {
            const isActive = activeTab === tab.key;
            const count = getCount(tab.key);
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabItem, isActive && styles.tabItemActive]}
                onPress={() => setActiveTab(tab.key)}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={16}
                  color={isActive ? colors.primary : colors.textSecondary}
                />
                <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
                  {tab.label}
                </Text>
                {count > 0 && (
                  <View style={styles.tabBadge}>
                    <Text style={styles.tabBadgeText}>{count > 99 ? '99+' : count}</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        {/* Content */}
        <View style={styles.content}>
          {renderContent()}
        </View>
      </View>
    </SafeAreaView>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No output (pass)

---

### Task 3: Rewrite AdminCategoriesTab

**Files:**
- Modify: `components/sqlite/AdminScreens.tsx:125-399`

Rewrite the Categories tab with theme-token inline form and card list.

- [ ] **Step 1: Rewrite the AdminCategoriesTab component**

Replace the entire `AdminCategoriesTab` function and its return JSX. The structure:
- Inline form card at top (existing pattern, styled with theme tokens)
- Category list with card items

```typescript
function AdminCategoriesTab() {
  const db = useSQLiteContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // States for "add product to category" modal
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [targetCategory, setTargetCategory] = useState<Category | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImg, setProdImg] = useState('');
  const [prodDesc, setProdDesc] = useState('');

  const loadCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getAllCategories(db);
      setCategories(list);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => { loadCategories(); }, [loadCategories]);

  const handleSaveCategory = async () => {
    if (!categoryName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên danh mục.');
      return;
    }
    try {
      if (editingCategory) {
        await updateCategory(db, editingCategory.id, categoryName.trim());
        Alert.alert('Thành công', 'Đã cập nhật tên danh mục!');
        setEditingCategory(null);
      } else {
        await addCategory(db, categoryName.trim());
        Alert.alert('Thành công', 'Đã thêm danh mục mới!');
      }
      setCategoryName('');
      loadCategories();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu danh mục.');
    }
  };

  const handleStartEdit = (cat: Category) => {
    setEditingCategory(cat);
    setCategoryName(cat.name);
  };

  const handleCancelEdit = () => {
    setEditingCategory(null);
    setCategoryName('');
  };

  const handleDeleteCategory = (cat: Category) => {
    Alert.alert('Xác nhận xóa', `Bạn có chắc chắn muốn xóa danh mục "${cat.name}"?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        try {
          await deleteCategory(db, cat.id);
          Alert.alert('Thành công', 'Đã xóa danh mục!');
          loadCategories();
        } catch (error) {
          Alert.alert('Lỗi', 'Không thể xóa danh mục.');
        }
      }},
    ]);
  };

  // Add product to category modal handlers (keep existing)
  const handleOpenAddProduct = (cat: Category) => {
    setTargetCategory(cat);
    setProdName(''); setProdPrice(''); setProdImg(''); setProdDesc('');
    setIsProductModalVisible(true);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setProdImg(result.assets[0].uri);
  };

  const handleSaveProduct = async () => {
    if (!prodName.trim()) { Alert.alert('Thông báo', 'Vui lòng nhập tên sản phẩm.'); return; }
    const priceValue = parseInt(prodPrice.trim(), 10);
    if (isNaN(priceValue) || priceValue < 0) { Alert.alert('Thông báo', 'Giá sản phẩm không hợp lệ.'); return; }
    if (!targetCategory) return;
    try {
      await addProduct(db, prodName.trim(), prodImg.trim(), priceValue, targetCategory.id, prodDesc.trim());
      Alert.alert('Thành công', `Đã thêm sản phẩm vào "${targetCategory.name}"!`);
      setIsProductModalVisible(false);
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm.');
    }
  };

  const renderCategoryRow = ({ item }: { item: Category }) => (
    <View style={styles.listRow}>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{item.name}</Text>
        <Text style={styles.rowSub}>ID: {item.id}</Text>
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primaryGlow }]} onPress={() => handleOpenAddProduct(item)}>
          <Ionicons name="add-circle-outline" size={16} color={colors.primary} />
          <Text style={[styles.actionBtnText, { color: colors.primary }]}>SP</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primaryGlow }]} onPress={() => handleStartEdit(item)}>
          <Ionicons name="create-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.dangerLight }]} onPress={() => handleDeleteCategory(item)}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.tabContent}>
      {/* Inline form */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{editingCategory ? 'Sửa Tên Danh Mục' : 'Thêm Danh Mục Mới'}</Text>
        <View style={styles.formRow}>
          <TextInput style={styles.formInput} placeholder="Tên danh mục..." value={categoryName} onChangeText={setCategoryName} />
          <TouchableOpacity style={styles.formBtn} onPress={handleSaveCategory}>
            <Text style={styles.formBtnText}>{editingCategory ? 'Lưu' : 'Thêm'}</Text>
          </TouchableOpacity>
          {editingCategory && (
            <TouchableOpacity style={styles.formCancelBtn} onPress={handleCancelEdit}>
              <Text style={styles.formCancelBtnText}>Hủy</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      <Text style={styles.sectionHeader}>Danh sách danh mục ({categories.length})</Text>

      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: Spacing.four }} />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategoryRow}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>Chưa có danh mục nào.</Text>}
        />
      )}

      {/* Modal add product to category */}
      <Modal visible={isProductModalVisible} animationType="slide" transparent onRequestClose={() => setIsProductModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalDragHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm SP: {targetCategory?.name}</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setIsProductModalVisible(false)}>
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Tên sản phẩm *</Text>
              <TextInput style={styles.modalInput} placeholder="Nhập tên..." value={prodName} onChangeText={setProdName} />

              <Text style={styles.modalLabel}>Giá (VNĐ) *</Text>
              <TextInput style={styles.modalInput} placeholder="Nhập giá..." keyboardType="numeric" value={prodPrice} onChangeText={setProdPrice} />

              <Text style={styles.modalLabel}>Hình ảnh</Text>
              {prodImg ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: prodImg }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => setProdImg('')}>
                    <Text style={styles.removeImageText}>Xóa ảnh</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.selectImageButton} onPress={pickImage}>
                  <Ionicons name="image-outline" size={20} color={colors.primary} />
                  <Text style={styles.selectImageText}>Chọn từ thiết bị...</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.modalLabel}>Mô tả</Text>
              <TextInput style={[styles.modalInput, styles.textArea]} placeholder="Mô tả..." multiline value={prodDesc} onChangeText={setProdDesc} />

              <TouchableOpacity style={[styles.formBtn, { marginTop: Spacing.four, paddingVertical: Spacing.md }]} onPress={handleSaveProduct}>
                <Text style={styles.formBtnText}>Lưu sản phẩm</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No output (pass)

---

### Task 4: Rewrite AdminProductsTab

**Files:**
- Modify: `components/sqlite/AdminScreens.tsx:404-666`

Rewrite the Products tab with search bar, card list, and bottom sheet modal for add/edit.

- [ ] **Step 1: Rewrite the AdminProductsTab component**

The component includes a FAB button for adding products. Key changes:
- Search bar filters products by name
- Card list with image thumbnail + info + action buttons
- Bottom sheet modal for add/edit with form fields and dropdown

```typescript
function AdminProductsTab() {
  const db = useSQLiteContext();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [search, setSearch] = useState('');

  // Modal states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formImg, setFormImg] = useState('');
  const [formCategoryId, setFormCategoryId] = useState<number>(1);
  const [formDescription, setFormDescription] = useState('');

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingProductId(null);
    setFormName(''); setFormPrice(''); setFormImg(''); setFormDescription('');
    if (categories.length > 0) setFormCategoryId(categories[0].id);
    setIsModalVisible(true);
  };

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const prodList = await getAllProducts(db);
      const catList = await getAllCategories(db);
      setProducts(prodList);
      setCategories(catList);
      if (catList.length > 0 && !formCategoryId) setFormCategoryId(catList[0].id);
    } catch (error) {
      console.error('Lỗi tải dữ liệu:', error);
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => { loadData(); }, [loadData]);

  const filteredProducts = search.trim()
    ? products.filter(p => p.name.toLowerCase().includes(search.toLowerCase()))
    : products;

  const handleOpenEdit = (prod: ProductWithCategory) => {
    setModalMode('edit');
    setEditingProductId(prod.id);
    setFormName(prod.name);
    setFormPrice(prod.price ? prod.price.toString() : '0');
    setFormImg(prod.img || '');
    setFormCategoryId(prod.categoryid);
    setFormDescription(prod.description || '');
    setIsModalVisible(true);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'], allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled) setFormImg(result.assets[0].uri);
  };

  const handleSave = async () => {
    if (!formName.trim()) { Alert.alert('Thông báo', 'Vui lòng nhập tên sản phẩm.'); return; }
    const priceValue = parseInt(formPrice.trim(), 10);
    if (isNaN(priceValue) || priceValue < 0) { Alert.alert('Thông báo', 'Giá không hợp lệ.'); return; }
    try {
      if (modalMode === 'add') {
        await addProduct(db, formName.trim(), formImg.trim(), priceValue, formCategoryId, formDescription.trim());
        Alert.alert('Thành công', 'Đã thêm sản phẩm!');
      } else if (editingProductId !== null) {
        await updateProduct(db, editingProductId, formName.trim(), formImg.trim(), priceValue, formCategoryId, formDescription.trim());
        Alert.alert('Thành công', 'Đã cập nhật sản phẩm!');
      }
      setIsModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm.');
    }
  };

  const handleDelete = (id: number) => {
    Alert.alert('Xác nhận xóa', 'Bạn có chắc muốn xóa sản phẩm này?', [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        try { await deleteProduct(db, id); Alert.alert('Thành công', 'Đã xóa sản phẩm.'); loadData(); }
        catch (error) { Alert.alert('Lỗi', 'Không thể xóa sản phẩm.'); }
      }},
    ]);
  };

  const renderProductRow = ({ item }: { item: ProductWithCategory }) => (
    <View style={styles.listRow}>
      <Image
        source={{ uri: item.img || 'https://placehold.co/200x200/e2e8f0/475569.png?text=N' }}
        style={styles.adminProductImage}
        resizeMode="contain"
      />
      <View style={[styles.rowInfo, { marginLeft: Spacing.md }]}>
        <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.rowSub}>{item.category_name}</Text>
        <Text style={[styles.rowSub, { color: colors.danger, fontWeight: FontWeight.bold }]}>
          {item.price ? item.price.toLocaleString('vi-VN') : '0'} đ
        </Text>
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.primaryGlow }]} onPress={() => handleOpenEdit(item)}>
          <Ionicons name="create-outline" size={16} color={colors.primary} />
        </TouchableOpacity>
        <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.dangerLight }]} onPress={() => handleDelete(item.id)}>
          <Ionicons name="trash-outline" size={16} color={colors.danger} />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.tabContent}>
      {/* Search */}
      <View style={styles.searchBar}>
        <Ionicons name="search-outline" size={18} color={colors.textTertiary} />
        <TextInput style={styles.searchInput} placeholder="Tìm kiếm sản phẩm..." value={search} onChangeText={setSearch} />
        {search.length > 0 && (
          <TouchableOpacity onPress={() => setSearch('')}>
            <Ionicons name="close-circle" size={18} color={colors.textTertiary} />
          </TouchableOpacity>
        )}
      </View>

      <Text style={styles.sectionHeader}>Danh sách sản phẩm ({filteredProducts.length})</Text>

      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: Spacing.four }} />
      ) : (
        <FlatList
          data={filteredProducts}
          renderItem={renderProductRow}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>{search ? 'Không tìm thấy sản phẩm phù hợp.' : 'Chưa có sản phẩm nào.'}</Text>}
        />
      )}

      {/* FAB */}
      <TouchableOpacity style={styles.fab} onPress={handleOpenAdd} activeOpacity={0.8}>
        <Ionicons name="add" size={28} color="#FFFFFF" />
      </TouchableOpacity>

      {/* Bottom sheet modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalDragHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalMode === 'add' ? 'Thêm sản phẩm' : 'Sửa sản phẩm'}</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>
            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Tên sản phẩm *</Text>
              <TextInput style={styles.modalInput} placeholder="Nhập tên..." value={formName} onChangeText={setFormName} />

              <Text style={styles.modalLabel}>Giá (VNĐ) *</Text>
              <TextInput style={styles.modalInput} placeholder="Ví dụ: 15000000" keyboardType="numeric" value={formPrice} onChangeText={setFormPrice} />

              <Text style={styles.modalLabel}>Hình ảnh</Text>
              {formImg ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: formImg }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageBtn} onPress={() => setFormImg('')}>
                    <Text style={styles.removeImageText}>Xóa ảnh</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.selectImageButton} onPress={pickImage}>
                  <Ionicons name="image-outline" size={20} color={colors.primary} />
                  <Text style={styles.selectImageText}>Chọn từ thiết bị...</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.modalLabel}>Danh mục</Text>
              <Dropdown
                style={styles.dropdown}
                selectedTextStyle={styles.dropdownText}
                data={categories}
                labelField="name"
                valueField="id"
                value={formCategoryId}
                onChange={(item) => setFormCategoryId(item.id)}
              />

              <Text style={styles.modalLabel}>Mô tả</Text>
              <TextInput style={[styles.modalInput, styles.textArea]} placeholder="Mô tả sản phẩm..." multiline value={formDescription} onChangeText={setFormDescription} />

              <View style={styles.modalFooter}>
                <TouchableOpacity style={[styles.modalFooterBtn, { backgroundColor: colors.backgroundElement }]} onPress={() => setIsModalVisible(false)}>
                  <Text style={[styles.modalFooterBtnText, { color: colors.textSecondary }]}>Hủy</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.modalFooterBtn, { backgroundColor: colors.primary }]} onPress={handleSave}>
                  <Text style={[styles.modalFooterBtnText, { color: '#FFFFFF' }]}>{modalMode === 'add' ? 'Thêm mới' : 'Lưu'}</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          </View>
        </View>
      </Modal>
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No output (pass)

---

### Task 5: Rewrite AdminUsersTab

**Files:**
- Modify: `components/sqlite/AdminScreens.tsx:671-790`

Rewrite the Users tab with avatar + role badges + styled action buttons.

- [ ] **Step 1: Rewrite the AdminUsersTab component**

```typescript
function AdminUsersTab() {
  const db = useSQLiteContext();
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const loadUsers = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getAllUsers(db);
      setUsers(list);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [db]);

  useEffect(() => { loadUsers(); }, [loadUsers]);

  const handleChangeRole = (user: User) => {
    if (user.id === currentUser?.id) {
      Alert.alert('Thông báo', 'Bạn không thể tự hạ quyền của chính mình.');
      return;
    }
    const newRole = user.role === 'admin' ? 'user' : 'admin';
    Alert.alert('Xác nhận vai trò', `Chuyển "${user.username}" thành ${newRole === 'admin' ? 'Quản trị viên' : 'Thành viên'}?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Thay đổi', onPress: async () => {
        try { await updateUserRole(db, user.id, newRole); Alert.alert('Thành công', 'Đã cập nhật vai trò!'); loadUsers(); }
        catch (error) { Alert.alert('Lỗi', 'Không thể đổi vai trò.'); }
      }},
    ]);
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser?.id) {
      Alert.alert('Lỗi', 'Bạn không thể tự xóa tài khoản của mình.');
      return;
    }
    Alert.alert('Xác nhận xóa', `Xóa vĩnh viễn tài khoản "${user.fullname}"?`, [
      { text: 'Hủy', style: 'cancel' },
      { text: 'Xóa', style: 'destructive', onPress: async () => {
        try { await deleteUser(db, user.id); Alert.alert('Thành công', 'Đã xóa tài khoản!'); loadUsers(); }
        catch (error) { Alert.alert('Lỗi', 'Không thể xóa người dùng.'); }
      }},
    ]);
  };

  const getInitial = (name: string) => name.charAt(0).toUpperCase();

  const renderUserRow = ({ item }: { item: User }) => {
    const isAdmin = item.role === 'admin';
    return (
      <View style={styles.listRow}>
        <View style={styles.userAvatar}>
          <Text style={styles.userAvatarText}>{getInitial(item.fullname)}</Text>
        </View>
        <View style={styles.rowInfo}>
          <Text style={styles.rowName}>{item.fullname} ({item.username})</Text>
          <View style={[styles.roleBadge, { backgroundColor: isAdmin ? colors.warningLight : colors.infoLight }]}>
            <Text style={[styles.roleBadgeText, { color: isAdmin ? colors.warning : colors.info }]}>
              {isAdmin ? 'Quản trị viên' : 'Thành viên'}
            </Text>
          </View>
          {item.phone ? <Text style={styles.rowSub}>SĐT: {item.phone}</Text> : null}
        </View>
        <View style={styles.rowActions}>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: isAdmin ? colors.warningLight : colors.infoLight }]} onPress={() => handleChangeRole(item)}>
            <Ionicons name="shield-outline" size={16} color={isAdmin ? colors.warning : colors.info} />
          </TouchableOpacity>
          <TouchableOpacity style={[styles.actionBtn, { backgroundColor: colors.dangerLight }]} onPress={() => handleDeleteUser(item)}>
            <Ionicons name="trash-outline" size={16} color={colors.danger} />
          </TouchableOpacity>
        </View>
      </View>
    );
  };

  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionHeader}>Danh sách người dùng ({users.length})</Text>
      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: Spacing.four }} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserRow}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
        />
      )}
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No output (pass)

---

### Task 6: Rewrite AdminOrdersTab

**Files:**
- Modify: `components/sqlite/AdminScreens.tsx:795-1071`

Rewrite the Orders tab with filter pills, styled order cards with quick actions, and bottom sheet modal for order details.

- [ ] **Step 1: Rewrite the AdminOrdersTab component**

```typescript
function AdminOrdersTab() {
  const db = useSQLiteContext();
  const [orders, setOrders] = useState<Order[]>([]);
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrderItems, setSelectedOrderItems] = useState<OrderItem[]>([]);
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [filterStatus, setFilterStatus] = useState<string>('Tất cả');

  const statuses = [
    { label: 'Tất cả', value: 'Tất cả' },
    { label: 'Chờ xử lý', value: 'Chờ xử lý' },
    { label: 'Đang giao', value: 'Đang giao' },
    { label: 'Đã giao', value: 'Đã giao' },
    { label: 'Đã hủy', value: 'Đã hủy' },
  ];

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    try {
      const list = await getAllOrders(db);
      setOrders(list);
      applyFilter(list, filterStatus);
    } catch (error) {
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  }, [db, filterStatus]);

  useEffect(() => { loadOrders(); }, [loadOrders]);

  const applyFilter = (list: Order[], status: string) => {
    if (status === 'Tất cả') setFilteredOrders(list);
    else setFilteredOrders(list.filter(o => o.status === status));
  };

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    applyFilter(orders, status);
  };

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await updateOrderStatus(db, orderId, status);
      Alert.alert('Thành công', `Đã cập nhật trạng thái thành "${status}"!`);
      if (selectedOrder && selectedOrder.id === orderId) setSelectedOrder({ ...selectedOrder, status });
      loadOrders();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái.');
    }
  };

  const handleViewDetails = async (order: Order) => {
    try {
      const items = await getOrderItems(db, order.id);
      setSelectedOrder(order);
      setSelectedOrderItems(items);
      setIsModalVisible(true);
    } catch (error) {
      console.error(error);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'Chờ xử lý': return { bg: colors.warningLight, text: colors.warning };
      case 'Đang giao': return { bg: colors.infoLight, text: colors.info };
      case 'Đã giao': return { bg: colors.successLight, text: colors.success };
      case 'Đã hủy': return { bg: colors.dangerLight, text: colors.danger };
      default: return { bg: colors.backgroundElement, text: colors.textSecondary };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch { return isoString; }
  };

  const renderOrderRow = ({ item }: { item: Order }) => {
    const sc = getStatusColor(item.status);
    return (
      <TouchableOpacity style={styles.orderCard} onPress={() => handleViewDetails(item)} activeOpacity={0.8}>
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: sc.bg }]}>
            <Text style={[styles.statusText, { color: sc.text }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.orderDetail}>Khách hàng: {item.fullname}</Text>
        <Text style={styles.orderDetail}>SĐT: {item.phone}</Text>
        <Text style={styles.orderDate}>Đặt: {formatDate(item.created_at)}</Text>

        <View style={styles.statusActionRow}>
          <Text style={styles.priceLabel}>{item.total_price.toLocaleString('vi-VN')} đ</Text>
          <View style={styles.miniBtnGroup}>
            {item.status === 'Chờ xử lý' && (
              <>
                <TouchableOpacity style={[styles.statusQuickBtn, { backgroundColor: colors.info }]} onPress={() => handleUpdateStatus(item.id, 'Đang giao')}>
                  <Text style={styles.quickBtnText}>Giao hàng</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.statusQuickBtn, { backgroundColor: colors.danger }]} onPress={() => handleUpdateStatus(item.id, 'Đã hủy')}>
                  <Text style={styles.quickBtnText}>Hủy</Text>
                </TouchableOpacity>
              </>
            )}
            {item.status === 'Đang giao' && (
              <>
                <TouchableOpacity style={[styles.statusQuickBtn, { backgroundColor: colors.success }]} onPress={() => handleUpdateStatus(item.id, 'Đã giao')}>
                  <Text style={styles.quickBtnText}>Đã giao</Text>
                </TouchableOpacity>
                <TouchableOpacity style={[styles.statusQuickBtn, { backgroundColor: colors.danger }]} onPress={() => handleUpdateStatus(item.id, 'Đã hủy')}>
                  <Text style={styles.quickBtnText}>Hủy</Text>
                </TouchableOpacity>
              </>
            )}
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.tabContent}>
      {/* Filter pills */}
      <View style={styles.filterWrapper}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterContainer}>
          {statuses.map(s => (
            <TouchableOpacity
              key={s.value}
              style={[styles.filterChip, filterStatus === s.value && styles.filterChipActive]}
              onPress={() => handleStatusChange(s.value)}
            >
              <Text style={[styles.filterText, filterStatus === s.value && styles.filterTextActive]}>{s.label}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {isLoading ? (
        <ActivityIndicator size="small" color={colors.primary} style={{ marginTop: Spacing.four }} />
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderRow}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 100 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={<Text style={styles.emptyText}>Không có đơn hàng nào.</Text>}
        />
      )}

      {/* Order detail modal */}
      <Modal visible={isModalVisible} animationType="slide" transparent onRequestClose={() => setIsModalVisible(false)}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalSheet}>
            <View style={styles.modalDragHandle} />
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Đơn hàng #{selectedOrder?.id}</Text>
              <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={18} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.infoSection}>
                  <Text style={styles.infoTitle}>Thông tin nhận hàng</Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Khách hàng:</Text> {selectedOrder.fullname}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Điện thoại:</Text> {selectedOrder.phone}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Địa chỉ:</Text> {selectedOrder.address}
                  </Text>
                  <Text style={styles.infoText}>
                    <Text style={styles.infoLabel}>Ngày đặt:</Text> {formatDate(selectedOrder.created_at)}
                  </Text>

                  <View style={[styles.row, { marginTop: Spacing.sm, gap: Spacing.sm }]}>
                    <Text style={styles.infoText}><Text style={styles.infoLabel}>Trạng thái:</Text></Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status).bg }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(selectedOrder.status).text }]}>
                        {selectedOrder.status}
                      </Text>
                    </View>
                  </View>

                  <Text style={{ fontSize: FontSize.caption, fontWeight: FontWeight.semibold, color: colors.textSecondary, marginTop: Spacing.md }}>
                    Cập nhật trạng thái:
                  </Text>
                  <Dropdown
                    style={[styles.dropdown, { marginTop: Spacing.one + 2 }]}
                    selectedTextStyle={styles.dropdownText}
                    data={statuses.slice(1)}
                    labelField="label"
                    valueField="value"
                    value={selectedOrder.status}
                    onChange={(item) => handleUpdateStatus(selectedOrder.id, item.value)}
                  />
                </View>

                <View style={styles.divider} />

                <Text style={styles.infoTitle}>Sản phẩm</Text>
                {selectedOrderItems.map((item) => (
                  <View key={item.id} style={styles.orderItemRow}>
                    <Image
                      source={{ uri: item.product_img || 'https://placehold.co/200x200/e2e8f0/475569.png?text=N' }}
                      style={styles.orderItemImage}
                      resizeMode="contain"
                    />
                    <View style={styles.orderItemInfo}>
                      <Text style={styles.orderItemName} numberOfLines={1}>{item.product_name}</Text>
                      <Text style={styles.orderItemQty}>SL: {item.quantity} x {item.price.toLocaleString('vi-VN')} đ</Text>
                    </View>
                    <Text style={styles.orderItemSubtotal}>
                      {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                    </Text>
                  </View>
                ))}

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Tổng thanh toán</Text>
                  <Text style={styles.totalValue}>{selectedOrder.total_price.toLocaleString('vi-VN')} đ</Text>
                </View>
              </ScrollView>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}
```

- [ ] **Step 2: Verify TypeScript**

Run: `npx tsc --noEmit`
Expected: No output (pass)

---

### Task 7: Final Verification

**Files:**
- Verify: `components/sqlite/AdminScreens.tsx`

- [ ] **Step 1: Verify all imports are present**

Check that `AdminScreens.tsx` imports:
- React hooks: `useState`, `useEffect`, `useCallback`, `useRef`, `useMemo`
- RN: `View, Text, StyleSheet, FlatList, TouchableOpacity, TextInput, ScrollView, Alert, Modal, SafeAreaView, ActivityIndicator, Image`
- `Ionicons` from `@expo/vector-icons`
- `useSQLiteContext` from `expo-sqlite`
- `useAuth` from `./AuthContext`
- `Header` from `./Header`
- Theme tokens from `../../constants/theme`
- Database functions: `getAllCategories, addCategory, updateCategory, deleteCategory, getAllUsers, updateUserRole, deleteUser, getAllOrders, updateOrderStatus, getOrderItems, addProduct, getAllProducts, updateProduct, deleteProduct, type Category, type User, type Order, type OrderItem, type ProductWithCategory`
- `Dropdown` from `react-native-element-dropdown`
- `ImagePicker` from `expo-image-picker`
- `useFocusEffect, useRouter` from `expo-router`

- [ ] **Step 2: Run TypeScript check**

```bash
npx tsc --noEmit
```
Expected: No output (pass)

- [ ] **Step 3: Run lint**

```bash
npm run lint
```
Expected: No errors or warnings
