import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  ScrollView,
  Alert,
  Modal,
  SafeAreaView,
  ActivityIndicator,
  Image,
  Platform
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useAuth } from './AuthContext';
import Header from './Header';
import ConfirmModal from './ConfirmModal';
import SuccessModal from './SuccessModal';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows } from '../../constants/theme';
import {
  getAllCategories,
  addCategory,
  updateCategory,
  deleteCategory,
  getAllUsers,
  updateUserRole,
  deleteUser,
  getAllOrders,
  updateOrderStatus,
  getOrderItems,
  addProduct,
  getAllProducts,
  updateProduct,
  deleteProduct,
  type Category,
  type User,
  type Order,
  type OrderItem,
  type ProductWithCategory
} from './database';
import { Dropdown } from 'react-native-element-dropdown';
import * as ImagePicker from 'expo-image-picker';

type AdminTab = 'categories' | 'products' | 'users' | 'orders';

export function AdminPanel() {
  const [activeTab, setActiveTab] = useState<AdminTab>('categories');

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

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Header hiển thị thông tin admin */}
        <Header />

        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.title}>Quản Trị Hệ Thống</Text>
          <Text style={styles.subtitle}>Bảng điều khiển Admin</Text>
        </View>

        {/* Tab Selector */}
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'categories' && styles.tabItemActive]}
            onPress={() => setActiveTab('categories')}
          >
            <Ionicons name="grid-outline" size={18} color={activeTab === 'categories' ? '#004ac6' : '#667085'} />
            <Text style={[styles.tabLabel, activeTab === 'categories' && styles.tabLabelActive]}>Danh mục</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'products' && styles.tabItemActive]}
            onPress={() => setActiveTab('products')}
          >
            <Ionicons name="basket-outline" size={18} color={activeTab === 'products' ? '#004ac6' : '#667085'} />
            <Text style={[styles.tabLabel, activeTab === 'products' && styles.tabLabelActive]}>Sản phẩm</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'users' && styles.tabItemActive]}
            onPress={() => setActiveTab('users')}
          >
            <Ionicons name="people-outline" size={18} color={activeTab === 'users' ? '#004ac6' : '#667085'} />
            <Text style={[styles.tabLabel, activeTab === 'users' && styles.tabLabelActive]}>Người dùng</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.tabItem, activeTab === 'orders' && styles.tabItemActive]}
            onPress={() => setActiveTab('orders')}
          >
            <Ionicons name="receipt-outline" size={18} color={activeTab === 'orders' ? '#004ac6' : '#667085'} />
            <Text style={[styles.tabLabel, activeTab === 'orders' && styles.tabLabelActive]}>Đơn hàng</Text>
          </TouchableOpacity>
        </View>

        {/* Content */}
        <View style={styles.content}>
          {renderContent()}
        </View>
      </View>
    </SafeAreaView>
  );
}

// ==========================================
// A. TAB QUẢN TRỊ LOẠI SẢN PHẨM (CATEGORIES)
// ==========================================
function AdminCategoriesTab() {
  const db = useSQLiteContext();
  const [categories, setCategories] = useState<Category[]>([]);
  const [categoryName, setCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  // States cho việc "Thêm sản phẩm cho loại tương ứng"
  const [isProductModalVisible, setIsProductModalVisible] = useState(false);
  const [targetCategory, setTargetCategory] = useState<Category | null>(null);
  const [prodName, setProdName] = useState('');
  const [prodPrice, setProdPrice] = useState('');
  const [prodImg, setProdImg] = useState('');
  const [prodDesc, setProdDesc] = useState('');

  // Modals for Success & Confirm
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');
  
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

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

  useEffect(() => {
    loadCategories();
  }, [loadCategories]);

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
    setConfirmModalTitle('Xác nhận xóa');
    setConfirmModalMessage(`Bạn có chắc chắn muốn xóa danh mục "${cat.name}"? Tất cả sản phẩm thuộc danh mục này cũng sẽ bị xóa.`);
    setOnConfirmAction(() => async () => {
      try {
        await deleteCategory(db, cat.id);
        setConfirmModalVisible(false);
        setSuccessModalTitle('Thành công');
        setSuccessModalMessage('Đã xóa danh mục thành công!');
        setSuccessModalVisible(true);
        loadCategories();
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể xóa danh mục.');
      }
    });
    setConfirmModalVisible(true);
  };

  // Mở modal thêm sản phẩm cho loại đã chọn
  const handleOpenAddProduct = (cat: Category) => {
    setTargetCategory(cat);
    setProdName('');
    setProdPrice('');
    setProdImg('');
    setProdDesc('');
    setIsProductModalVisible(true);
  };

  const pickImage = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      Alert.alert('Quyền truy cập', 'Ứng dụng cần quyền truy cập thư viện ảnh.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setProdImg(result.assets[0].uri);
    }
  };

  const handleSaveProduct = async () => {
    if (!prodName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên sản phẩm.');
      return;
    }
    const priceValue = parseInt(prodPrice.trim(), 10);
    if (isNaN(priceValue) || priceValue < 0) {
      Alert.alert('Thông báo', 'Giá sản phẩm không hợp lệ.');
      return;
    }
    if (!targetCategory) return;

    try {
      await addProduct(db, prodName.trim(), prodImg.trim(), priceValue, targetCategory.id, prodDesc.trim());
      Alert.alert('Thành công', `Đã thêm sản phẩm mới vào danh mục "${targetCategory.name}"!`);
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
        <TouchableOpacity
          style={[styles.miniBtn, { backgroundColor: '#EEF2F6' }]}
          onPress={() => handleOpenAddProduct(item)}
        >
          <Ionicons name="add-circle-outline" size={18} color="#004ac6" />
          <Text style={[styles.miniBtnText, { color: '#004ac6' }]}>+ SP</Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.miniBtn, { backgroundColor: '#eef0f3' }]}
          onPress={() => handleStartEdit(item)}
        >
          <Ionicons name="create-outline" size={16} color="#667085" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[styles.miniBtn, { backgroundColor: '#FEE2E2' }]}
          onPress={() => handleDeleteCategory(item)}
        >
          <Ionicons name="trash-outline" size={16} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.tabContent}>
      {/* Form thêm/sửa danh mục */}
      <View style={styles.card}>
        <Text style={styles.cardTitle}>{editingCategory ? 'Sửa Tên Danh Mục' : 'Thêm Danh Mục Mới'}</Text>
        <View style={styles.formRow}>
          <TextInput
            style={styles.formInput}
            placeholder="Tên danh mục mới..."
            value={categoryName}
            onChangeText={setCategoryName}
          />
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
        <ActivityIndicator size="small" color="#004ac6" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={categories}
          renderItem={renderCategoryRow}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có danh mục nào.</Text>
          }
        />
      )}

      {/* Modal Thêm sản phẩm cho loại tương ứng */}
      <Modal
        visible={isProductModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsProductModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Thêm SP vào loại: {targetCategory?.name}</Text>
              <TouchableOpacity onPress={() => setIsProductModalVisible(false)}>
                <Ionicons name="close" size={24} color="#98a2b3" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Tên sản phẩm *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập tên sản phẩm..."
                value={prodName}
                onChangeText={setProdName}
              />

              <Text style={styles.modalLabel}>Giá sản phẩm (VNĐ) *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập giá bán..."
                keyboardType="numeric"
                value={prodPrice}
                onChangeText={setProdPrice}
              />

              <Text style={styles.modalLabel}>Hình ảnh sản phẩm</Text>
              {prodImg ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: prodImg }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => setProdImg('')}>
                    <Text style={styles.removeImageText}>Xóa ảnh</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.selectImageButton} onPress={pickImage}>
                  <Ionicons name="image-outline" size={20} color="#004ac6" />
                  <Text style={styles.selectImageText}>Chọn từ thiết bị...</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.modalLabel}>Mô tả</Text>
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder="Mô tả sản phẩm..."
                multiline
                numberOfLines={3}
                value={prodDesc}
                onChangeText={setProdDesc}
              />

              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveProduct}>
                <Text style={styles.modalSaveBtnText}>Lưu sản phẩm</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={confirmModalVisible}
        title={confirmModalTitle}
        message={confirmModalMessage}
        confirmText="Đồng ý"
        cancelText="Hủy"
        onConfirm={onConfirmAction}
        onCancel={() => setConfirmModalVisible(false)}
      />

      <SuccessModal
        visible={successModalVisible}
        title={successModalTitle}
        message={successModalMessage}
        onClose={() => setSuccessModalVisible(false)}
      />
    </View>
  );
}

// ==========================================
// A2. TAB QUẢN TRỊ SẢN PHẨM (PRODUCTS) - [MỚI]
// ==========================================
function AdminProductsTab() {
  const db = useSQLiteContext();
  const [products, setProducts] = useState<ProductWithCategory[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // States cho modal Add/Edit
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  
  const [formName, setFormName] = useState('');
  const [formPrice, setFormPrice] = useState('');
  const [formImg, setFormImg] = useState('');
  const [formCategoryId, setFormCategoryId] = useState<number>(1);
  const [formDescription, setFormDescription] = useState('');

  // Modals for Success & Confirm
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');
  
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

  const loadData = useCallback(async () => {
    setIsLoading(true);
    try {
      const prodList = await getAllProducts(db);
      const catList = await getAllCategories(db);
      setProducts(prodList);
      setCategories(catList);
      if (catList.length > 0 && !formCategoryId) {
        setFormCategoryId(catList[0].id);
      }
    } catch (error) {
      console.error('Lỗi khi tải dữ liệu sản phẩm admin:', error);
    } finally {
      setIsLoading(false);
    }
  }, [db, formCategoryId]);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenAdd = () => {
    setModalMode('add');
    setEditingProductId(null);
    setFormName('');
    setFormPrice('');
    setFormImg('');
    setFormDescription('');
    if (categories.length > 0) {
      setFormCategoryId(categories[0].id);
    }
    setIsModalVisible(true);
  };

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
      Alert.alert('Quyền truy cập', 'Cần quyền truy cập thư viện ảnh để chọn ảnh.');
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      allowsEditing: true,
      aspect: [1, 1],
      quality: 0.8,
    });
    if (!result.canceled) {
      setFormImg(result.assets[0].uri);
    }
  };

  const handleSave = async () => {
    if (!formName.trim()) {
      Alert.alert('Thông báo', 'Vui lòng nhập tên sản phẩm.');
      return;
    }
    const priceValue = parseInt(formPrice.trim(), 10);
    if (isNaN(priceValue) || priceValue < 0) {
      Alert.alert('Thông báo', 'Giá sản phẩm không hợp lệ.');
      return;
    }

    try {
      if (modalMode === 'add') {
        await addProduct(db, formName.trim(), formImg.trim(), priceValue, formCategoryId, formDescription.trim());
        Alert.alert('Thành công', 'Đã thêm sản phẩm mới thành công!');
      } else {
        if (editingProductId !== null) {
          await updateProduct(db, editingProductId, formName.trim(), formImg.trim(), priceValue, formCategoryId, formDescription.trim());
          Alert.alert('Thành công', 'Đã cập nhật sản phẩm thành công!');
        }
      }
      setIsModalVisible(false);
      loadData();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể lưu sản phẩm.');
    }
  };

  const handleDelete = (id: number) => {
    setConfirmModalTitle('Xác nhận xóa');
    setConfirmModalMessage('Bạn có chắc muốn xóa sản phẩm này? Thao tác không thể hoàn tác.');
    setOnConfirmAction(() => async () => {
      try {
        await deleteProduct(db, id);
        setConfirmModalVisible(false);
        setSuccessModalTitle('Thành công');
        setSuccessModalMessage('Đã xóa sản phẩm thành công!');
        setSuccessModalVisible(true);
        loadData();
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể xóa sản phẩm.');
      }
    });
    setConfirmModalVisible(true);
  };

  const renderProductRow = ({ item }: { item: ProductWithCategory }) => (
    <View style={styles.listRow}>
      <Image
        source={{ uri: item.img || 'https://placehold.co/200x200/e2e8f0/475569.png?text=No+Image' }}
        style={styles.adminProductImage}
        resizeMode="contain"
      />
      <View style={[styles.rowInfo, { marginLeft: 10 }]}>
        <Text style={styles.rowName} numberOfLines={1}>{item.name}</Text>
        <Text style={styles.rowSub}>Loại: {item.category_name}</Text>
        <Text style={[styles.rowSub, { color: '#EF4444', fontWeight: '700' }]}>{item.price.toLocaleString('vi-VN')} đ</Text>
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity
          style={[styles.miniBtn, { backgroundColor: '#eef0f3' }]}
          onPress={() => handleOpenEdit(item)}
        >
          <Ionicons name="create-outline" size={16} color="#667085" />
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.miniBtn, { backgroundColor: '#FEE2E2' }]}
          onPress={() => handleDelete(item.id)}
        >
          <Ionicons name="trash-outline" size={16} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.tabContent}>
      <TouchableOpacity style={styles.addProductHeaderBtn} onPress={handleOpenAdd}>
        <Ionicons name="add" size={20} color="#FFFFFF" />
        <Text style={styles.addProductHeaderBtnText}>Thêm sản phẩm mới</Text>
      </TouchableOpacity>

      <Text style={styles.sectionHeader}>Danh sách sản phẩm ({products.length})</Text>

      {isLoading ? (
        <ActivityIndicator size="small" color="#004ac6" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={products}
          renderItem={renderProductRow}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Chưa có sản phẩm nào.</Text>
          }
        />
      )}

      {/* Modal Add/Edit */}
      <Modal
        visible={isModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>{modalMode === 'add' ? 'Thêm sản phẩm mới' : 'Chỉnh sửa sản phẩm'}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#98a2b3" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.modalLabel}>Tên sản phẩm *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập tên sản phẩm..."
                value={formName}
                onChangeText={setFormName}
              />

              <Text style={styles.modalLabel}>Giá sản phẩm (VNĐ) *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Ví dụ: 15000000"
                keyboardType="numeric"
                value={formPrice}
                onChangeText={setFormPrice}
              />

              <Text style={styles.modalLabel}>Hình ảnh sản phẩm</Text>
              {formImg ? (
                <View style={styles.imagePreviewContainer}>
                  <Image source={{ uri: formImg }} style={styles.imagePreview} />
                  <TouchableOpacity style={styles.removeImageButton} onPress={() => setFormImg('')}>
                    <Text style={styles.removeImageText}>Xóa ảnh</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity style={styles.selectImageButton} onPress={pickImage}>
                  <Ionicons name="image-outline" size={20} color="#004ac6" />
                  <Text style={styles.selectImageText}>Chọn từ thiết bị...</Text>
                </TouchableOpacity>
              )}

              <Text style={styles.modalLabel}>Danh mục sản phẩm</Text>
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
              <TextInput
                style={[styles.modalInput, styles.textArea]}
                placeholder="Nhập mô tả sản phẩm..."
                multiline
                numberOfLines={4}
                value={formDescription}
                onChangeText={setFormDescription}
              />

              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSave}>
                <Text style={styles.modalSaveBtnText}>{modalMode === 'add' ? 'Thêm mới' : 'Lưu cập nhật'}</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={confirmModalVisible}
        title={confirmModalTitle}
        message={confirmModalMessage}
        confirmText="Đồng ý"
        cancelText="Hủy"
        onConfirm={onConfirmAction}
        onCancel={() => setConfirmModalVisible(false)}
      />

      <SuccessModal
        visible={successModalVisible}
        title={successModalTitle}
        message={successModalMessage}
        onClose={() => setSuccessModalVisible(false)}
      />
    </View>
  );
}

// ==========================================
// B. TAB QUẢN TRỊ NGƯỜI DÙNG (USERS)
// ==========================================
function AdminUsersTab() {
  const db = useSQLiteContext();
  const { currentUser } = useAuth();
  const [users, setUsers] = useState<User[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Edit User states
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [selectedUser, setSelectedUser] = useState<User | null>(null);
  const [formFullname, setFormFullname] = useState('');
  const [formEmail, setFormEmail] = useState('');
  const [formPhone, setFormPhone] = useState('');
  const [formAddress, setFormAddress] = useState('');
  const [formPassword, setFormPassword] = useState('');

  // Modals for Success & Confirm
  const [successModalVisible, setSuccessModalVisible] = useState(false);
  const [successModalTitle, setSuccessModalTitle] = useState('');
  const [successModalMessage, setSuccessModalMessage] = useState('');
  
  const [confirmModalVisible, setConfirmModalVisible] = useState(false);
  const [confirmModalTitle, setConfirmModalTitle] = useState('');
  const [confirmModalMessage, setConfirmModalMessage] = useState('');
  const [onConfirmAction, setOnConfirmAction] = useState<() => void>(() => {});

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

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  const handleChangeRole = async (user: User) => {
    if (user.id === currentUser?.id) {
      Alert.alert('Thông báo', 'Bạn không thể tự hạ quyền của chính mình.');
      return;
    }

    const newRole = user.role === 'admin' ? 'user' : 'admin';
    setConfirmModalTitle('Xác nhận vai trò');
    setConfirmModalMessage(`Bạn có muốn chuyển vai trò của "${user.username}" thành ${newRole === 'admin' ? 'Quản trị viên' : 'Thành viên'} không?`);
    setOnConfirmAction(() => async () => {
      try {
        await updateUserRole(db, user.id, newRole);
        setConfirmModalVisible(false);
        setSuccessModalTitle('Thành công');
        setSuccessModalMessage('Đã cập nhật vai trò người dùng!');
        setSuccessModalVisible(true);
        loadUsers();
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể đổi vai trò.');
      }
    });
    setConfirmModalVisible(true);
  };

  const handleDeleteUser = (user: User) => {
    if (user.id === currentUser?.id) {
      Alert.alert('Lỗi', 'Bạn không thể tự xóa tài khoản của chính mình.');
      return;
    }

    setConfirmModalTitle('Xác nhận xóa');
    setConfirmModalMessage(`Bạn có chắc chắn muốn xóa vĩnh viễn tài khoản "${user.fullname}" không?`);
    setOnConfirmAction(() => async () => {
      try {
        await deleteUser(db, user.id);
        setConfirmModalVisible(false);
        setSuccessModalTitle('Thành công');
        setSuccessModalMessage('Đã xóa tài khoản người dùng!');
        setSuccessModalVisible(true);
        loadUsers();
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể xóa người dùng.');
      }
    });
    setConfirmModalVisible(true);
  };

  const handleEditUser = (user: User) => {
    setSelectedUser(user);
    setFormFullname(user.fullname);
    setFormEmail(user.email);
    setFormPhone(user.phone || '');
    setFormAddress(user.address || '');
    setFormPassword('');
    setIsModalVisible(true);
  };

  const handleSaveUser = async () => {
    if (!formFullname.trim() || !formEmail.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập họ tên và email hợp lệ.');
      return;
    }
    if (selectedUser) {
      try {
        await updateUserProfile(db, selectedUser.id, formFullname.trim(), formEmail.trim(), formPhone.trim(), formAddress.trim(), formPassword.trim() || undefined);
        setIsModalVisible(false);
        setSuccessModalTitle('Thành công');
        setSuccessModalMessage('Đã cập nhật thông tin người dùng.');
        setSuccessModalVisible(true);
        loadUsers();
      } catch (error) {
        Alert.alert('Lỗi', 'Không thể cập nhật thông tin người dùng.');
      }
    }
  };

  const renderUserRow = ({ item }: { item: User }) => (
    <View style={styles.listRow}>
      <View style={styles.rowInfo}>
        <Text style={styles.rowName}>{item.fullname} ({item.username})</Text>
        <Text style={styles.rowSub}>Vai trò: {item.role === 'admin' ? 'Admin' : 'User'} • Email: {item.email}</Text>
        {item.phone ? <Text style={styles.rowSub}>SĐT: {item.phone}</Text> : null}
      </View>
      <View style={styles.rowActions}>
        <TouchableOpacity
          style={[styles.miniBtn, { backgroundColor: '#E0F2FE' }]}
          onPress={() => handleEditUser(item)}
        >
          <Ionicons name="create-outline" size={16} color="#0284C7" />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.miniBtn, { backgroundColor: item.role === 'admin' ? '#FEF3C7' : '#F3F4F6' }]}
          onPress={() => handleChangeRole(item)}
        >
          <Ionicons name="shield-outline" size={16} color={item.role === 'admin' ? '#D97706' : '#6B7280'} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.miniBtn, { backgroundColor: '#FEE2E2' }]}
          onPress={() => handleDeleteUser(item)}
        >
          <Ionicons name="trash-outline" size={16} color="#DC2626" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.tabContent}>
      <Text style={styles.sectionHeader}>Danh sách người dùng ({users.length})</Text>
      {isLoading ? (
        <ActivityIndicator size="small" color="#004ac6" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={users}
          renderItem={renderUserRow}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
        />
      )}

      {/* Edit User Modal */}
      <Modal
        visible={isModalVisible}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Sửa Thông Tin: {selectedUser?.username}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#64748b" />
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Text style={styles.inputLabel}>Họ và tên *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập họ và tên..."
                value={formFullname}
                onChangeText={setFormFullname}
              />

              <Text style={styles.inputLabel}>Email *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập email..."
                keyboardType="email-address"
                autoCapitalize="none"
                value={formEmail}
                onChangeText={setFormEmail}
              />

              <Text style={styles.inputLabel}>Số điện thoại</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập số điện thoại..."
                keyboardType="phone-pad"
                value={formPhone}
                onChangeText={setFormPhone}
              />

              <Text style={styles.inputLabel}>Địa chỉ</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập địa chỉ..."
                value={formAddress}
                onChangeText={setFormAddress}
              />

              <Text style={styles.inputLabel}>Mật khẩu mới (Để trống nếu không đổi)</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="Nhập mật khẩu mới..."
                secureTextEntry
                value={formPassword}
                onChangeText={setFormPassword}
              />

              <TouchableOpacity style={styles.modalSaveBtn} onPress={handleSaveUser}>
                <Text style={styles.modalSaveBtnText}>Lưu cập nhật</Text>
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      <ConfirmModal
        visible={confirmModalVisible}
        title={confirmModalTitle}
        message={confirmModalMessage}
        confirmText="Đồng ý"
        cancelText="Hủy"
        onConfirm={onConfirmAction}
        onCancel={() => setConfirmModalVisible(false)}
      />

      <SuccessModal
        visible={successModalVisible}
        title={successModalTitle}
        message={successModalMessage}
        onClose={() => setSuccessModalVisible(false)}
      />
    </View>
  );
}

// ==========================================
// C. TAB QUẢN TRỊ ĐƠN HÀNG (ORDERS)
// ==========================================
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
    { label: 'Đã hủy', value: 'Đã hủy' }
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

  useEffect(() => {
    loadOrders();
  }, [loadOrders]);

  const applyFilter = (list: Order[], status: string) => {
    if (status === 'Tất cả') {
      setFilteredOrders(list);
    } else {
      setFilteredOrders(list.filter(o => o.status === status));
    }
  };

  const handleStatusChange = (status: string) => {
    setFilterStatus(status);
    applyFilter(orders, status);
  };

  const handleUpdateStatus = async (orderId: number, status: string) => {
    try {
      await updateOrderStatus(db, orderId, status);
      Alert.alert('Thành công', `Đã cập nhật trạng thái đơn hàng thành "${status}"!`);
      
      // Update selected order detail state if open
      if (selectedOrder && selectedOrder.id === orderId) {
        setSelectedOrder({ ...selectedOrder, status });
      }

      loadOrders();
    } catch (error) {
      Alert.alert('Lỗi', 'Không thể cập nhật trạng thái đơn hàng.');
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
      case 'Chờ xử lý': return { bg: '#FEF3C7', text: '#D97706' };
      case 'Đang giao': return { bg: '#DBEAFE', text: '#2563EB' };
      case 'Đã giao': return { bg: '#D1FAE5', text: '#059669' };
      case 'Đã hủy': return { bg: '#FEE2E2', text: '#DC2626' };
      default: return { bg: '#eef0f3', text: '#667085' };
    }
  };

  const formatDate = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return `${date.getHours().toString().padStart(2, '0')}:${date.getMinutes().toString().padStart(2, '0')} ${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
    } catch (e) {
      return isoString;
    }
  };

  const renderOrderRow = ({ item }: { item: Order }) => {
    const colors = getStatusColor(item.status);
    return (
      <TouchableOpacity
        style={styles.orderCard}
        onPress={() => handleViewDetails(item)}
        activeOpacity={0.8}
      >
        <View style={styles.orderHeader}>
          <Text style={styles.orderId}>Đơn hàng #{item.id}</Text>
          <View style={[styles.statusBadge, { backgroundColor: colors.bg }]}>
            <Text style={[styles.statusText, { color: colors.text }]}>{item.status}</Text>
          </View>
        </View>
        <Text style={styles.orderDetail}>Khách hàng: {item.fullname}</Text>
        <Text style={styles.orderDetail}>SĐT: {item.phone}</Text>
        <Text style={styles.orderDate}>Ngày đặt: {formatDate(item.created_at)}</Text>
        
        {/* Nút cập nhật trạng thái nhanh */}
        <View style={styles.statusActionRow}>
          <Text style={styles.priceLabel}>{item.total_price.toLocaleString('vi-VN')} đ</Text>
          <View style={styles.miniBtnGroup}>
            {item.status === 'Chờ xử lý' && (
              <>
                <TouchableOpacity
                  style={[styles.statusQuickBtn, { backgroundColor: '#3B82F6' }]}
                  onPress={() => handleUpdateStatus(item.id, 'Đang giao')}
                >
                  <Text style={styles.quickBtnText}>Giao hàng</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusQuickBtn, { backgroundColor: '#EF4444' }]}
                  onPress={() => handleUpdateStatus(item.id, 'Đã hủy')}
                >
                  <Text style={styles.quickBtnText}>Hủy đơn</Text>
                </TouchableOpacity>
              </>
            )}
            {item.status === 'Đang giao' && (
              <>
                <TouchableOpacity
                  style={[styles.statusQuickBtn, { backgroundColor: '#10B981' }]}
                  onPress={() => handleUpdateStatus(item.id, 'Đã giao')}
                >
                  <Text style={styles.quickBtnText}>Đã giao</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.statusQuickBtn, { backgroundColor: '#EF4444' }]}
                  onPress={() => handleUpdateStatus(item.id, 'Đã hủy')}
                >
                  <Text style={styles.quickBtnText}>Hủy đơn</Text>
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
      {/* Bộ lọc trạng thái đơn hàng */}
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
        <ActivityIndicator size="small" color="#004ac6" style={{ marginTop: 20 }} />
      ) : (
        <FlatList
          data={filteredOrders}
          renderItem={renderOrderRow}
          keyExtractor={(item) => item.id.toString()}
          contentContainerStyle={{ paddingBottom: 20 }}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <Text style={styles.emptyText}>Không có đơn hàng nào.</Text>
          }
        />
      )}

      {/* Modal chi tiết đơn hàng */}
      <Modal
        visible={isModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setIsModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Chi Tiết Đơn Hàng #{selectedOrder?.id}</Text>
              <TouchableOpacity onPress={() => setIsModalVisible(false)}>
                <Ionicons name="close" size={24} color="#98a2b3" />
              </TouchableOpacity>
            </View>

            {selectedOrder && (
              <ScrollView showsVerticalScrollIndicator={false}>
                <View style={styles.infoSection}>
                  <Text style={styles.infoTitle}>Thông tin nhận hàng</Text>
                  <Text style={styles.infoText}><Text style={styles.semibold}>Khách hàng:</Text> {selectedOrder.fullname}</Text>
                  <Text style={styles.infoText}><Text style={styles.semibold}>Điện thoại:</Text> {selectedOrder.phone}</Text>
                  <Text style={styles.infoText}><Text style={styles.semibold}>Địa chỉ nhận:</Text> {selectedOrder.address}</Text>
                  <Text style={styles.infoText}><Text style={styles.semibold}>Ngày đặt:</Text> {formatDate(selectedOrder.created_at)}</Text>
                  
                  {/* Thay đổi trạng thái trực tiếp trong modal chi tiết */}
                  <View style={[styles.row, { marginTop: 8 }]}>
                    <Text style={styles.infoText}><Text style={styles.semibold}>Trạng thái đơn hàng:</Text></Text>
                    <View style={[styles.statusBadge, { backgroundColor: getStatusColor(selectedOrder.status).bg, marginLeft: 8 }]}>
                      <Text style={[styles.statusText, { color: getStatusColor(selectedOrder.status).text }]}>
                        {selectedOrder.status}
                      </Text>
                    </View>
                  </View>
                  
                  {/* Dropdown chỉnh trạng thái */}
                  <Text style={[styles.semibold, { marginTop: 12, fontSize: 13, color: '#667085' }]}>Cập nhật trạng thái:</Text>
                  <View style={styles.dropdownRow}>
                    <Dropdown
                      style={styles.dropdown}
                      selectedTextStyle={styles.dropdownText}
                      data={[
                        { label: 'Chờ xử lý', value: 'Chờ xử lý' },
                        { label: 'Đang giao', value: 'Đang giao' },
                        { label: 'Đã giao', value: 'Đã giao' },
                        { label: 'Đã hủy', value: 'Đã hủy' }
                      ]}
                      labelField="label"
                      valueField="value"
                      value={selectedOrder.status}
                      onChange={(item) => handleUpdateStatus(selectedOrder.id, item.value)}
                    />
                  </View>
                </View>

                <View style={styles.divider} />

                <Text style={styles.infoTitle}>Danh sách mặt hàng</Text>
                {selectedOrderItems.map((item) => (
                  <View key={item.id} style={styles.orderItemRow}>
                    <Image
                      source={{ uri: item.product_img || 'https://placehold.co/200x200/e2e8f0/475569.png?text=No+Image' }}
                      style={styles.orderItemImage}
                      resizeMode="contain"
                    />
                    <View style={styles.orderItemInfo}>
                      <Text style={styles.orderItemName} numberOfLines={1}>{item.product_name}</Text>
                      <Text style={styles.orderItemQty}>Số lượng: {item.quantity}</Text>
                      <Text style={styles.orderItemPrice}>Đơn giá: {item.price.toLocaleString('vi-VN')} đ</Text>
                    </View>
                    <Text style={styles.orderItemSubtotal}>
                      {(item.price * item.quantity).toLocaleString('vi-VN')} đ
                    </Text>
                  </View>
                ))}

                <View style={styles.divider} />

                <View style={styles.summaryRow}>
                  <Text style={styles.totalLabel}>Tổng tiền hàng:</Text>
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

// ==========================================
// STYLES SYSTEM
// ==========================================
const colors = Colors.light;

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: colors.background,
  },
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.three,
    paddingBottom: Spacing.three,
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  title: {
    fontSize: FontSize.heading,
    fontWeight: FontWeight.extrabold,
    color: colors.text,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: FontSize.caption,
    color: colors.textSecondary,
    marginTop: 2,
    fontWeight: FontWeight.semibold,
  },
  
  // Custom Tab Bar ở top
  tabBar: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderBottomWidth: 1,
    borderBottomColor: colors.border,
  },
  tabItem: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    gap: 6,
    borderBottomWidth: 2,
    borderBottomColor: 'transparent',
  },
  tabItemActive: {
    borderBottomColor: colors.primary,
  },
  tabLabel: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
    color: colors.textSecondary,
  },
  tabLabelActive: {
    color: colors.primary,
    fontWeight: FontWeight.bold,
  },

  content: {
    flex: 1,
  },
  tabContent: {
    flex: 1,
    padding: Spacing.three,
  },

  // Cards
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
  formRow: {
    flexDirection: 'row',
    gap: Spacing.sm,
  },
  formInput: {
    flex: 1,
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: BorderRadius.sm,
    paddingHorizontal: Spacing.sm,
    paddingVertical: Spacing.sm,
    fontSize: FontSize.body,
    color: colors.text,
  },
  formBtn: {
    backgroundColor: colors.primary,
    paddingHorizontal: Spacing.three,
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
    backgroundColor: colors.backgroundElement,
    borderWidth: 1,
    borderColor: colors.border,
    paddingHorizontal: Spacing.sm,
    borderRadius: BorderRadius.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  formCancelBtnText: {
    color: colors.textSecondary,
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },

  // Danh sách dòng
  sectionHeader: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.bold,
    color: colors.textSecondary,
    marginBottom: Spacing.sm,
    marginTop: Spacing.sm,
  },
  listRow: {
    flexDirection: 'row',
    backgroundColor: colors.card,
    borderRadius: BorderRadius.md,
    padding: Spacing.sm + 4,
    marginBottom: Spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    justifyContent: 'space-between',
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
  miniBtn: {
    padding: Spacing.sm,
    borderRadius: BorderRadius.sm,
    alignItems: 'center',
    justifyContent: 'center',
    flexDirection: 'row',
    gap: 4,
  },
  miniBtnText: {
    fontSize: FontSize.tiny,
    fontWeight: FontWeight.bold,
  },
  emptyText: {
    textAlign: 'center',
    color: colors.textTertiary,
    fontSize: FontSize.body,
    marginTop: 40,
    fontWeight: FontWeight.medium,
  },

  // Modal
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    padding: 20,
    width: '100%',
    maxHeight: '85%',
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
    fontSize: 17,
    fontWeight: '800',
    color: '#101828',
  },
  modalLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: '#667085',
    marginBottom: 6,
    marginTop: 12,
  },
  modalInput: {
    backgroundColor: '#f7f9fb',
    borderWidth: 1,
    borderColor: '#eef0f3',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 14,
    color: '#101828',
  },
  textArea: {
    height: 60,
    textAlignVertical: 'top',
  },
  selectImageButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#f7f9fb',
    borderWidth: 1,
    borderColor: '#eef0f3',
    borderStyle: 'dashed',
    borderRadius: 10,
    paddingVertical: 12,
    gap: 6,
  },
  selectImageText: {
    color: '#004ac6',
    fontSize: 14,
    fontWeight: '600',
  },
  imagePreviewContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f9fb',
    borderWidth: 1,
    borderColor: '#eef0f3',
    borderRadius: 10,
    padding: 8,
    gap: 12,
  },
  imagePreview: {
    width: 50,
    height: 50,
    borderRadius: 6,
  },
  removeImageButton: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  removeImageText: {
    color: '#DC2626',
    fontSize: 12,
    fontWeight: '600',
  },
  modalSaveBtn: {
    backgroundColor: '#004ac6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    marginTop: 20,
  },
  modalSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },

  // Đơn hàng
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
    marginBottom: 8,
  },
  orderId: {
    fontSize: 14,
    fontWeight: '700',
    color: '#101828',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  orderDetail: {
    fontSize: 13,
    color: '#667085',
    marginTop: 2,
    fontWeight: '500',
  },
  orderDate: {
    fontSize: 12,
    color: '#98a2b3',
    marginTop: 4,
    fontWeight: '500',
  },
  statusActionRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#eef0f3',
  },
  priceLabel: {
    fontSize: 15,
    fontWeight: '800',
    color: '#EF4444',
  },
  miniBtnGroup: {
    flexDirection: 'row',
    gap: 6,
  },
  statusQuickBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 6,
  },
  quickBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },

  // Lọc
  filterWrapper: {
    backgroundColor: 'transparent',
    marginBottom: 12,
  },
  filterContainer: {
    gap: 6,
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#eef0f3',
  },
  filterChipActive: {
    backgroundColor: '#004ac6',
  },
  filterText: {
    fontSize: 12,
    color: '#667085',
    fontWeight: '600',
  },
  filterTextActive: {
    color: '#FFFFFF',
  },

  // Dropdown
  dropdownRow: {
    marginTop: 6,
    width: '100%',
  },
  dropdown: {
    backgroundColor: '#f7f9fb',
    borderWidth: 1,
    borderColor: '#eef0f3',
    borderRadius: 10,
    paddingHorizontal: 12,
    height: 44,
  },
  dropdownText: {
    fontSize: 14,
    color: '#101828',
    fontWeight: '500',
  },

  infoSection: {
    gap: 4,
  },
  infoTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#101828',
    marginBottom: 6,
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
  divider: {
    height: 1,
    backgroundColor: '#eef0f3',
    marginVertical: 12,
  },

  orderItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 6,
  },
  orderItemImage: {
    width: 36,
    height: 36,
    borderRadius: 6,
    backgroundColor: '#f7f9fb',
    borderWidth: 1,
    borderColor: '#eef0f3',
  },
  orderItemInfo: {
    flex: 1,
    marginLeft: 8,
  },
  orderItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#101828',
  },
  orderItemQty: {
    fontSize: 10,
    color: '#98a2b3',
  },
  orderItemPrice: {
    fontSize: 10,
    color: '#98a2b3',
  },
  orderItemSubtotal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#101828',
  },
  totalLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#101828',
  },
  totalValue: {
    fontSize: 16,
    fontWeight: '800',
    color: '#EF4444',
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  adminProductImage: {
    width: 50,
    height: 50,
    borderRadius: 8,
    backgroundColor: '#f7f9fb',
    borderWidth: 1,
    borderColor: '#eef0f3',
  },
  addProductHeaderBtn: {
    flexDirection: 'row',
    backgroundColor: '#004ac6',
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 16,
  },
  addProductHeaderBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
});
