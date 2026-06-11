import React from 'react';
import {
  StyleSheet,
  View,
  Text,
  Image,
  FlatList,
  TouchableOpacity,
  SafeAreaView,
  Alert,
  Dimensions,
} from 'react-native';


interface Product {
  id: string;
  name: string;
  price: string;
  image: string;
}

const PRODUCTS: Product[] = [
  {
    id: '1',
    name: 'Giày Thể Thao Nike',
    price: '3.450.000 đ',
    image: 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: '2',
    name: 'Điện Thoại iPhone 15',
    price: '28.990.000 đ',
    image: 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: '3',
    name: 'Tai Nghe Sony',
    price: '6.490.000 đ',
    image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: '4',
    name: 'Đồng Hồ Rolex',
    price: '245.000.000 đ',
    image: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: '5',
    name: 'Bàn Phím Cơ',
    price: '1.850.000 đ',
    image: 'https://images.unsplash.com/photo-1587829741301-dc798b83add3?w=500&auto=format&fit=crop&q=60',
  },
  {
    id: '6',
    name: 'Balo Du Lịch',
    price: '950.000 đ',
    image: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=500&auto=format&fit=crop&q=60',
  }
];

interface ProductCardProps {
  image: string;
  name: string;
  price: string;
  onBuy: () => void;
}

const ProductCard = ({ image, name, price, onBuy }: ProductCardProps) => {
  return (
    <View style={styles.card}>
      {/* 1. Ảnh sản phẩm */}
      <Image source={{ uri: image }} style={styles.productImage} />
      
      {/* 2. Tên sản phẩm */}
      <Text style={styles.productName} numberOfLines={1}>
        {name}
      </Text>
      
      {/* 3. Giá sản phẩm */}
      <Text style={styles.productPrice}>{price}</Text>
      
      {/* 4. Nút Mua ngay */}
      <TouchableOpacity 
        style={styles.buyButton} 
        onPress={onBuy}
      >
        <Text style={styles.buyButtonText}>Mua ngay</Text>
      </TouchableOpacity>
    </View>
  );
};

interface Layout3Props {
  products?: Product[];
  onBuyPress?: (productName: string) => void;
  headerTitle?: string;
}

export default function Layout3({
  products = PRODUCTS,
  onBuyPress,
  headerTitle = 'Trang Chủ Bán Hàng',
}: Layout3Props) {
  const handleBuy = (productName: string) => {
    if (onBuyPress) {
      onBuyPress(productName);
    } else {
      Alert.alert('Thông báo', `Đã thêm sản phẩm "${productName}" vào giỏ hàng!`);
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* Tiêu đề trang chủ đơn giản */}
        <Text style={styles.headerTitle}>{headerTitle}</Text>

        {/* Lưới sản phẩm dạng Grid */}
        <FlatList
          data={products}
          keyExtractor={(item) => item.id}
          numColumns={2}
          columnWrapperStyle={styles.gridRow}
          contentContainerStyle={styles.gridContainer}
          showsVerticalScrollIndicator={false}
          renderItem={({ item }) => (
            <ProductCard
              image={item.image}
              name={item.name}
              price={item.price}
              onBuy={() => handleBuy(item.name)}
            />
          )}
        />
      </View>
    </SafeAreaView>
  );
}



// Tính toán chiều rộng của mỗi cột sản phẩm
const { width } = Dimensions.get('window');
const cardWidth = (width - 36) / 2; // Chia đôi màn hình trừ đi các khoảng cách padding

// StyleSheet tối ưu giao diện đơn giản và sạch sẽ
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  container: {
    flex: 1,
    paddingHorizontal: 12,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    textAlign: 'center',
    marginVertical: 20,
  },
  gridContainer: {
    paddingBottom: 20,
  },
  gridRow: {
    justifyContent: 'space-between',
  },
  card: {
    width: cardWidth,
    backgroundColor: '#ffffff',
    borderRadius: 8,
    padding: 10,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#ddd',
    alignItems: 'center',
  },
  productImage: {
    width: '100%',
    height: 120,
    borderRadius: 6,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  productName: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 6,
    textAlign: 'center',
  },
  productPrice: {
    fontSize: 14,
    color: '#ff4d4f',
    fontWeight: 'bold',
    marginBottom: 10,
  },
  buyButton: {
    backgroundColor: '#1890ff',
    borderRadius: 4,
    paddingVertical: 8,
    width: '100%',
    alignItems: 'center',
  },
  buyButtonText: {
    color: '#ffffff',
    fontSize: 12,
    fontWeight: 'bold',
  },
});

