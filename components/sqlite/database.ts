import type { SQLiteDatabase } from 'expo-sqlite';

export interface Category {
  id: number;
  name: string;
}

export interface ProductWithCategory {
  id: number;
  name: string;
  img: string;
  price: number;
  categoryid: number;
  category_name: string;
  description: string;
}

/** 
 * Khởi tạo bảng dữ liệu và chèn thông tin mẫu nếu cơ sở dữ liệu trống hoặc phiên bản cũ.
 * Sử dụng PRAGMA user_version để quản lý và kiểm tra phiên bản của cơ sở dữ liệu SQLite.
 * 
 * @param db Đối tượng kết nối cơ sở dữ liệu SQLite cung cấp bởi expo-sqlite.
 */
export async function migrateDbIfNeeded(db: SQLiteDatabase): Promise<void> {
  const DATABASE_VERSION = 6;

  // Lấy ra phiên bản hiện tại của cơ sở dữ liệu
  const result = await db.getFirstAsync<{ user_version: number }>(
    'PRAGMA user_version'
  );
  let currentDbVersion = result?.user_version ?? 0;

  // Nếu phiên bản hiện tại đã mới nhất, bỏ qua quá trình cập nhật
  if (currentDbVersion >= DATABASE_VERSION) {
    return;
  }

  // Khởi tạo các bảng khi cơ sở dữ liệu mới tạo (phiên bản là 0)
  if (currentDbVersion === 0) {
    await db.execAsync(`
      PRAGMA journal_mode = 'wal';
      PRAGMA foreign_keys = ON;

      -- Tạo bảng danh mục (category) nếu chưa tồn tại
      CREATE TABLE IF NOT EXISTS category (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL
      );

      -- Tạo bảng sản phẩm (product) với khoá ngoại liên kết tới bảng danh mục
      CREATE TABLE IF NOT EXISTS product (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        img TEXT NOT NULL DEFAULT '',
        price INTEGER NOT NULL DEFAULT 0,
        categoryid INTEGER NOT NULL,
        description TEXT DEFAULT '',
        FOREIGN KEY (categoryid) REFERENCES category(id) ON DELETE CASCADE
      );

      -- Tạo bảng người dùng (users)
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fullname TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        phone TEXT DEFAULT '',
        address TEXT DEFAULT ''
      );

      -- Tạo bảng giỏ hàng (cart)
      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userid INTEGER NOT NULL,
        productid INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (productid) REFERENCES product(id) ON DELETE CASCADE
      );

      -- Tạo bảng đơn hàng (orders)
      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userid INTEGER NOT NULL,
        fullname TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        total_price INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Chờ xử lý',
        created_at TEXT NOT NULL,
        FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
      );

      -- Tạo bảng chi tiết đơn hàng (order_items)
      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderid INTEGER NOT NULL,
        productid INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price INTEGER NOT NULL,
        FOREIGN KEY (orderid) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (productid) REFERENCES product(id) ON DELETE CASCADE
      );
    `);

    // Chèn dữ liệu danh mục mẫu vào bảng
    await db.runAsync('INSERT INTO category (name) VALUES (?)', 'Điện thoại');
    await db.runAsync('INSERT INTO category (name) VALUES (?)', 'Laptop');
    await db.runAsync('INSERT INTO category (name) VALUES (?)', 'Phụ kiện');
    await db.runAsync('INSERT INTO category (name) VALUES (?)', 'Tablet');

    // Chèn dữ liệu sản phẩm mẫu (dùng link ảnh internet cho các sản phẩm)
    await db.runAsync(
      'INSERT INTO product (name, img, price, categoryid, description) VALUES (?, ?, ?, ?, ?)',
      'iPhone 15 Pro Max', 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80', 29990000, 1, 'iPhone 15 Pro Max sở hữu khung titan siêu bền và nhẹ, chip A17 Pro mạnh mẽ vượt trội.'
    );
    await db.runAsync(
      'INSERT INTO product (name, img, price, categoryid, description) VALUES (?, ?, ?, ?, ?)',
      'Samsung Galaxy S24 Ultra', 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80', 31990000, 1, 'Galaxy S24 Ultra trang bị camera 200MP đột phá, hỗ trợ AI thông minh và bút S Pen tiện lợi.'
    );
    await db.runAsync(
      'INSERT INTO product (name, img, price, categoryid, description) VALUES (?, ?, ?, ?, ?)',
      'MacBook Air M3', 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80', 27990000, 2, 'MacBook Air M3 mỏng nhẹ đỉnh cao, hiệu năng siêu tốc và thời lượng pin ấn tượng lên tới 18 giờ.'
    );
    await db.runAsync(
      'INSERT INTO product (name, img, price, categoryid, description) VALUES (?, ?, ?, ?, ?)',
      'Dell XPS 15', 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80', 49990000, 2, 'Dell XPS 15 sở hữu màn hình InfinityEdge tuyệt đẹp, vi xử lý Intel Core thế hệ mới hiệu năng cao.'
    );
    await db.runAsync(
      'INSERT INTO product (name, img, price, categoryid, description) VALUES (?, ?, ?, ?, ?)',
      'AirPods Pro 2', 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80', 5790000, 3, 'AirPods Pro 2 mang lại khả năng chủ động khử tiếng ồn tốt gấp đôi, âm thanh thích ứng đỉnh cao.'
    );
    await db.runAsync(
      'INSERT INTO product (name, img, price, categoryid, description) VALUES (?, ?, ?, ?, ?)',
      'iPad Air M2', 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80', 16990000, 4, 'iPad Air M2 siêu mạnh mẽ với chip Apple M2, màn hình Liquid Retina sắc nét cùng Apple Pencil Pro.'
    );

    // Chèn tài khoản mẫu
    await db.runAsync(
      "INSERT OR IGNORE INTO users (username, password, fullname, email, role, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)",
      "admin", "admin123", "System Administrator", "admin@shop.com", "admin", "0123456789", "Hà Nội, Việt Nam"
    );
    await db.runAsync(
      "INSERT OR IGNORE INTO users (username, password, fullname, email, role, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)",
      "user", "user123", "Regular User", "user@shop.com", "user", "0987654321", "TP. Hồ Chí Minh, Việt Nam"
    );

    currentDbVersion = 5;
  }

  // Thực hiện nâng cấp từ phiên bản 1 lên 2 nếu có
  if (currentDbVersion === 1) {
    await db.execAsync(`
      ALTER TABLE product ADD COLUMN price INTEGER NOT NULL DEFAULT 0;
    `);
    
    // Cập nhật giá mẫu cho các sản phẩm có sẵn
    await db.runAsync("UPDATE product SET price = 29990000 WHERE name = 'iPhone 15 Pro Max'");
    await db.runAsync("UPDATE product SET price = 31990000 WHERE name = 'Samsung Galaxy S24 Ultra'");
    await db.runAsync("UPDATE product SET price = 27990000 WHERE name = 'MacBook Air M3'");
    await db.runAsync("UPDATE product SET price = 49990000 WHERE name = 'Dell XPS 15'");
    await db.runAsync("UPDATE product SET price = 5790000 WHERE name = 'AirPods Pro 2'");
    await db.runAsync("UPDATE product SET price = 16990000 WHERE name = 'iPad Air M2'");
    
    currentDbVersion = 2;
  }

  // Thực hiện nâng cấp từ phiên bản 2 lên 3: Xóa toàn bộ link ảnh internet của các sản phẩm cũ
  if (currentDbVersion === 2) {
    await db.runAsync("UPDATE product SET img = ''");
    currentDbVersion = 3;
  }

  // Thực hiện nâng cấp từ phiên bản 3 lên 4: Thêm cột description
  if (currentDbVersion === 3) {
    await db.execAsync(`
      ALTER TABLE product ADD COLUMN description TEXT DEFAULT '';
    `);
    
    // Cập nhật mô tả mẫu cho các sản phẩm có sẵn
    await db.runAsync("UPDATE product SET description = 'iPhone 15 Pro Max sở hữu khung titan siêu bền và nhẹ, chip A17 Pro mạnh mẽ vượt trội.' WHERE name = 'iPhone 15 Pro Max'");
    await db.runAsync("UPDATE product SET description = 'Galaxy S24 Ultra trang bị camera 200MP đột phá, hỗ trợ AI thông minh và bút S Pen tiện lợi.' WHERE name = 'Samsung Galaxy S24 Ultra'");
    await db.runAsync("UPDATE product SET description = 'MacBook Air M3 mỏng nhẹ đỉnh cao, hiệu năng siêu tốc và thời lượng pin ấn tượng lên tới 18 giờ.' WHERE name = 'MacBook Air M3'");
    await db.runAsync("UPDATE product SET description = 'Dell XPS 15 sở hữu màn hình InfinityEdge tuyệt đẹp, vi xử lý Intel Core thế hệ mới hiệu năng cao.' WHERE name = 'Dell XPS 15'");
    await db.runAsync("UPDATE product SET description = 'AirPods Pro 2 mang lại khả năng chủ động khử tiếng ồn tốt gấp đôi, âm thanh thích ứng đỉnh cao.' WHERE name = 'AirPods Pro 2'");
    await db.runAsync("UPDATE product SET description = 'iPad Air M2 siêu mạnh mẽ với chip Apple M2, màn hình Liquid Retina sắc nét cùng Apple Pencil Pro.' WHERE name = 'iPad Air M2'");

    currentDbVersion = 4;
  }

  // Thực hiện nâng cấp từ phiên bản 4 lên 5: Tạo các bảng mới cho quản trị người dùng, giỏ hàng, đơn hàng
  if (currentDbVersion === 4) {
    await db.execAsync(`
      CREATE TABLE IF NOT EXISTS users (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        username TEXT UNIQUE NOT NULL,
        password TEXT NOT NULL,
        fullname TEXT NOT NULL,
        email TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'user',
        phone TEXT DEFAULT '',
        address TEXT DEFAULT ''
      );

      CREATE TABLE IF NOT EXISTS cart (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userid INTEGER NOT NULL,
        productid INTEGER NOT NULL,
        quantity INTEGER NOT NULL DEFAULT 1,
        FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE,
        FOREIGN KEY (productid) REFERENCES product(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS orders (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        userid INTEGER NOT NULL,
        fullname TEXT NOT NULL,
        phone TEXT NOT NULL,
        address TEXT NOT NULL,
        total_price INTEGER NOT NULL,
        status TEXT NOT NULL DEFAULT 'Chờ xử lý',
        created_at TEXT NOT NULL,
        FOREIGN KEY (userid) REFERENCES users(id) ON DELETE CASCADE
      );

      CREATE TABLE IF NOT EXISTS order_items (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        orderid INTEGER NOT NULL,
        productid INTEGER NOT NULL,
        quantity INTEGER NOT NULL,
        price INTEGER NOT NULL,
        FOREIGN KEY (orderid) REFERENCES orders(id) ON DELETE CASCADE,
        FOREIGN KEY (productid) REFERENCES product(id) ON DELETE CASCADE
      );
    `);

    // Chèn tài khoản mẫu
    await db.runAsync(
      "INSERT OR IGNORE INTO users (username, password, fullname, email, role, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)",
      "admin", "admin123", "System Administrator", "admin@shop.com", "admin", "0123456789", "Hà Nội, Việt Nam"
    );
    await db.runAsync(
      "INSERT OR IGNORE INTO users (username, password, fullname, email, role, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)",
      "user", "user123", "Regular User", "user@shop.com", "user", "0987654321", "TP. Hồ Chí Minh, Việt Nam"
    );

    currentDbVersion = 5;
  }

  // Thực hiện nâng cấp từ phiên bản 5 lên 6: Cập nhật hình ảnh sản phẩm thực tế
  if (currentDbVersion === 5) {
    await db.runAsync("UPDATE product SET img = 'https://images.unsplash.com/photo-1695048133142-1a20484d2569?auto=format&fit=crop&w=600&q=80' WHERE name = 'iPhone 15 Pro Max'");
    await db.runAsync("UPDATE product SET img = 'https://images.unsplash.com/photo-1610945265064-0e34e5519bbf?auto=format&fit=crop&w=600&q=80' WHERE name = 'Samsung Galaxy S24 Ultra'");
    await db.runAsync("UPDATE product SET img = 'https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=600&q=80' WHERE name = 'MacBook Air M3'");
    await db.runAsync("UPDATE product SET img = 'https://images.unsplash.com/photo-1593642632823-8f785ba67e45?auto=format&fit=crop&w=600&q=80' WHERE name = 'Dell XPS 15'");
    await db.runAsync("UPDATE product SET img = 'https://images.unsplash.com/photo-1600294037681-c80b4cb5b434?auto=format&fit=crop&w=600&q=80' WHERE name = 'AirPods Pro 2'");
    await db.runAsync("UPDATE product SET img = 'https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=600&q=80' WHERE name = 'iPad Air M2'");
    currentDbVersion = 6;
  }

  // Cập nhật phiên bản cơ sở dữ liệu lên phiên bản mới nhất
  await db.execAsync(`PRAGMA user_version = ${DATABASE_VERSION}`);
}

/**
 * Truy vấn lấy toàn bộ danh sách danh mục sản phẩm từ cơ sở dữ liệu.
 */
export async function getAllCategories(db: SQLiteDatabase): Promise<Category[]> {
  return await db.getAllAsync<Category>('SELECT * FROM category ORDER BY id');
}

/**
 * Truy vấn lấy toàn bộ danh sách sản phẩm, kèm theo tên danh mục tương ứng (JOIN).
 */
export async function getAllProducts(db: SQLiteDatabase): Promise<ProductWithCategory[]> {
  return await db.getAllAsync<ProductWithCategory>(
    `SELECT p.*, c.name AS category_name
     FROM product p
     LEFT JOIN category c ON p.categoryid = c.id
     ORDER BY p.id DESC`
  );
}

/**
 * Truy vấn danh sách sản phẩm được lọc theo mã danh mục (categoryid).
 */
export async function getProductsByCategory(db: SQLiteDatabase, categoryId: number): Promise<ProductWithCategory[]> {
  return await db.getAllAsync<ProductWithCategory>(
    `SELECT p.*, c.name AS category_name
     FROM product p
     LEFT JOIN category c ON p.categoryid = c.id
     WHERE p.categoryid = ?
     ORDER BY p.id DESC`,
    categoryId
  );
}

/**
 * Thêm một sản phẩm mới vào cơ sở dữ liệu.
 */
export async function addProduct(
  db: SQLiteDatabase,
  name: string,
  img: string,
  price: number,
  categoryId: number,
  description: string
): Promise<void> {
  await db.runAsync(
    'INSERT INTO product (name, img, price, categoryid, description) VALUES (?, ?, ?, ?, ?)',
    name,
    img,
    price,
    categoryId,
    description
  );
}

/**
 * Cập nhật thông tin của một sản phẩm hiện tại.
 */
export async function updateProduct(
  db: SQLiteDatabase,
  id: number,
  name: string,
  img: string,
  price: number,
  categoryId: number,
  description: string
): Promise<void> {
  await db.runAsync(
    'UPDATE product SET name = ?, img = ?, price = ?, categoryid = ?, description = ? WHERE id = ?',
    name,
    img,
    price,
    categoryId,
    description,
    id
  );
}

/**
 * Xóa một sản phẩm khỏi cơ sở dữ liệu theo ID.
 */
export async function deleteProduct(
  db: SQLiteDatabase,
  id: number
): Promise<void> {
  await db.runAsync('DELETE FROM product WHERE id = ?', id);
}

/**
 * Lấy chi tiết thông tin của một sản phẩm theo ID.
 */
export async function getProductById(
  db: SQLiteDatabase,
  id: number
): Promise<ProductWithCategory | null> {
  return await db.getFirstAsync<ProductWithCategory>(
    `SELECT p.*, c.name AS category_name
     FROM product p
     LEFT JOIN category c ON p.categoryid = c.id
     WHERE p.id = ?`,
    id
  );
}

// ==========================================
// CÁC ĐỊNH NGHĨA KIỂU DỮ LIỆU & HÀM BỔ SUNG
// ==========================================

export interface User {
  id: number;
  username: string;
  fullname: string;
  email: string;
  role: 'user' | 'admin';
  phone: string;
  address: string;
}

export interface CartItem {
  id: number;
  userid: number;
  productid: number;
  quantity: number;
  name: string;
  img: string;
  price: number;
  categoryid: number;
  category_name: string;
}

export interface Order {
  id: number;
  userid: number;
  fullname: string;
  phone: string;
  address: string;
  total_price: number;
  status: string; // 'Chờ xử lý' | 'Đang giao' | 'Đã giao' | 'Đã hủy'
  created_at: string;
}

export interface OrderItem {
  id: number;
  orderid: number;
  productid: number;
  quantity: number;
  price: number;
  product_name: string;
  product_img: string;
}

// --- QUẢN TRỊ USER ---
export async function registerUser(
  db: SQLiteDatabase,
  username: string,
  password: string,
  fullname: string,
  email: string
): Promise<void> {
  // Kiểm tra trùng username trước
  const existing = await db.getFirstAsync<{ id: number }>('SELECT id FROM users WHERE username = ?', username);
  if (existing) {
    throw new Error('Tên tài khoản đã tồn tại trên hệ thống!');
  }
  await db.runAsync(
    'INSERT INTO users (username, password, fullname, email, role, phone, address) VALUES (?, ?, ?, ?, ?, ?, ?)',
    username, password, fullname, email, 'user', '', ''
  );
}

export async function loginUser(
  db: SQLiteDatabase,
  username: string,
  password: string
): Promise<User | null> {
  return await db.getFirstAsync<User>(
    'SELECT id, username, fullname, email, role, phone, address FROM users WHERE username = ? AND password = ?',
    username, password
  );
}

export async function updateUserProfile(
  db: SQLiteDatabase,
  id: number,
  fullname: string,
  email: string,
  phone: string,
  address: string,
  password?: string
): Promise<void> {
  if (password && password.trim().length > 0) {
    await db.runAsync(
      'UPDATE users SET fullname = ?, email = ?, phone = ?, address = ?, password = ? WHERE id = ?',
      fullname, email, phone, address, password, id
    );
  } else {
    await db.runAsync(
      'UPDATE users SET fullname = ?, email = ?, phone = ?, address = ? WHERE id = ?',
      fullname, email, phone, address, id
    );
  }
}

export async function getAllUsers(db: SQLiteDatabase): Promise<User[]> {
  return await db.getAllAsync<User>('SELECT id, username, fullname, email, role, phone, address FROM users ORDER BY id');
}

export async function updateUserRole(db: SQLiteDatabase, id: number, role: string): Promise<void> {
  await db.runAsync('UPDATE users SET role = ? WHERE id = ?', role, id);
}

export async function deleteUser(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM users WHERE id = ?', id);
}

// --- QUẢN TRỊ CATEGORY ---
export async function addCategory(db: SQLiteDatabase, name: string): Promise<void> {
  await db.runAsync('INSERT INTO category (name) VALUES (?)', name);
}

export async function updateCategory(db: SQLiteDatabase, id: number, name: string): Promise<void> {
  await db.runAsync('UPDATE category SET name = ? WHERE id = ?', name, id);
}

export async function deleteCategory(db: SQLiteDatabase, id: number): Promise<void> {
  await db.runAsync('DELETE FROM category WHERE id = ?', id);
}

// --- GIỎ HÀNG (CART) ---
export async function getCartItems(db: SQLiteDatabase, userId: number): Promise<CartItem[]> {
  return await db.getAllAsync<CartItem>(
    `SELECT c.id, c.userid, c.productid, c.quantity, p.name, p.img, p.price, p.categoryid, cat.name AS category_name
     FROM cart c
     JOIN product p ON c.productid = p.id
     LEFT JOIN category cat ON p.categoryid = cat.id
     WHERE c.userid = ?
     ORDER BY c.id DESC`,
    userId
  );
}

export async function addToCart(
  db: SQLiteDatabase,
  userId: number,
  productId: number,
  quantity: number = 1
): Promise<void> {
  const existing = await db.getFirstAsync<{ id: number; quantity: number }>(
    'SELECT id, quantity FROM cart WHERE userid = ? AND productid = ?',
    userId, productId
  );

  if (existing) {
    await db.runAsync(
      'UPDATE cart SET quantity = ? WHERE id = ?',
      existing.quantity + quantity,
      existing.id
    );
  } else {
    await db.runAsync(
      'INSERT INTO cart (userid, productid, quantity) VALUES (?, ?, ?)',
      userId, productId, quantity
    );
  }
}

export async function updateCartQuantity(
  db: SQLiteDatabase,
  cartId: number,
  quantity: number
): Promise<void> {
  if (quantity <= 0) {
    await db.runAsync('DELETE FROM cart WHERE id = ?', cartId);
  } else {
    await db.runAsync('UPDATE cart SET quantity = ? WHERE id = ?', quantity, cartId);
  }
}

export async function removeFromCart(db: SQLiteDatabase, cartId: number): Promise<void> {
  await db.runAsync('DELETE FROM cart WHERE id = ?', cartId);
}

export async function clearCart(db: SQLiteDatabase, userId: number): Promise<void> {
  await db.runAsync('DELETE FROM cart WHERE userid = ?', userId);
}

// --- ĐƠN HÀNG (ORDERS) ---
export async function createOrder(
  db: SQLiteDatabase,
  userId: number,
  fullname: string,
  phone: string,
  address: string,
  totalPrice: number,
  items: { productid: number; quantity: number; price: number }[]
): Promise<void> {
  const createdAt = new Date().toISOString();
  
  await db.withTransactionAsync(async () => {
    // 1. Tạo đơn hàng mới
    const result = await db.runAsync(
      'INSERT INTO orders (userid, fullname, phone, address, total_price, status, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)',
      userId, fullname, phone, address, totalPrice, 'Chờ xử lý', createdAt
    );
    
    const orderId = result.lastInsertRowId;
    
    // 2. Thêm các sản phẩm vào chi tiết đơn hàng
    for (const item of items) {
      await db.runAsync(
        'INSERT INTO order_items (orderid, productid, quantity, price) VALUES (?, ?, ?, ?)',
        orderId, item.productid, item.quantity, item.price
      );
    }
    
    // 3. Xóa sạch giỏ hàng của user sau khi đặt hàng thành công
    await db.runAsync('DELETE FROM cart WHERE userid = ?', userId);
  });
}

export async function getUserOrders(db: SQLiteDatabase, userId: number): Promise<Order[]> {
  return await db.getAllAsync<Order>(
    'SELECT * FROM orders WHERE userid = ? ORDER BY id DESC',
    userId
  );
}

export async function getAllOrders(db: SQLiteDatabase): Promise<Order[]> {
  return await db.getAllAsync<Order>(
    'SELECT * FROM orders ORDER BY id DESC'
  );
}

export async function updateOrderStatus(db: SQLiteDatabase, orderId: number, status: string): Promise<void> {
  await db.runAsync('UPDATE orders SET status = ? WHERE id = ?', status, orderId);
}

export async function getOrderItems(db: SQLiteDatabase, orderId: number): Promise<OrderItem[]> {
  return await db.getAllAsync<OrderItem>(
    `SELECT oi.id, oi.orderid, oi.productid, oi.quantity, oi.price, p.name AS product_name, p.img AS product_img
     FROM order_items oi
     JOIN product p ON oi.productid = p.id
     WHERE oi.orderid = ?
     ORDER BY oi.id`,
    orderId
  );
}
