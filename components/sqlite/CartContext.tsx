import React, { createContext, useContext, useState, useEffect } from 'react';
import { useSQLiteContext } from 'expo-sqlite';
import { useAuth } from './AuthContext';
import { getCartItems, addToCart, updateCartQuantity, removeFromCart, clearCart, createOrder, type CartItem } from './database';
import { Alert } from 'react-native';

const GUEST_ID = -1;

interface CartContextType {
  cartItems: CartItem[];
  cartCount: number;
  cartTotal: number;
  isLoading: boolean;
  loadCart: () => Promise<void>;
  addItem: (productId: number, quantity?: number) => Promise<void>;
  updateQty: (cartId: number, quantity: number) => Promise<void>;
  removeItemFromCart: (cartId: number) => Promise<void>;
  checkout: (fullname: string, phone: string, address: string) => Promise<boolean>;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const db = useSQLiteContext();
  const { currentUser } = useAuth();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const userId = currentUser?.id ?? GUEST_ID;

  const loadCart = async () => {
    try {
      const items = await getCartItems(db, userId);
      setCartItems(items);
    } catch (error) {
      console.error('Lỗi khi tải giỏ hàng từ DB:', error);
    }
  };

  useEffect(() => {
    loadCart();
  }, [userId]);

  const addItem = async (productId: number, quantity: number = 1) => {
    try {
      await addToCart(db, userId, productId, quantity);
      await loadCart();
      Alert.alert('Thành công', 'Đã thêm sản phẩm vào giỏ hàng!');
    } catch (error) {
      console.error('Lỗi khi thêm vào giỏ hàng:', error);
      Alert.alert('Lỗi', 'Không thể thêm sản phẩm vào giỏ hàng.');
    }
  };

  const updateQty = async (cartId: number, quantity: number) => {
    try {
      await updateCartQuantity(db, cartId, quantity);
      await loadCart();
    } catch (error) {
      console.error('Lỗi khi cập nhật số lượng:', error);
    }
  };

  const removeItemFromCart = async (cartId: number) => {
    try {
      await removeFromCart(db, cartId);
      await loadCart();
      Alert.alert('Thông báo', 'Đã xóa sản phẩm khỏi giỏ hàng.');
    } catch (error) {
      console.error('Lỗi khi xóa sản phẩm giỏ hàng:', error);
    }
  };

  const checkout = async (fullname: string, phone: string, address: string): Promise<boolean> => {
    if (!currentUser) {
      Alert.alert('Yêu cầu đăng nhập', 'Vui lòng đăng nhập để đặt hàng.');
      return false;
    }
    if (cartItems.length === 0) {
      Alert.alert('Lỗi', 'Giỏ hàng trống, không thể thanh toán.');
      return false;
    }
    
    setIsLoading(true);
    try {
      const orderItems = cartItems.map(item => ({
        productid: item.productid,
        quantity: item.quantity,
        price: item.price
      }));
      
      const totalPrice = cartTotal;
      
      await createOrder(db, currentUser.id, fullname.trim(), phone.trim(), address.trim(), totalPrice, orderItems);
      await loadCart(); // Load lại giỏ hàng (sẽ trống)
      setIsLoading(false);
      return true;
    } catch (error) {
      setIsLoading(false);
      console.error('Lỗi đặt hàng:', error);
      Alert.alert('Lỗi', 'Có lỗi xảy ra trong quá trình đặt hàng. Vui lòng thử lại.');
      return false;
    }
  };

  // Tính tổng số lượng mặt hàng
  const cartCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Tính tổng tiền giỏ hàng
  const cartTotal = cartItems.reduce((total, item) => total + (item.price * item.quantity), 0);

  return (
    <CartContext.Provider
      value={{
        cartItems,
        cartCount,
        cartTotal,
        isLoading,
        loadCart,
        addItem,
        updateQty,
        removeItemFromCart,
        checkout
      }}
    >
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};
