import { Stack } from 'expo-router';
import "../global.css";
import { SQLiteProvider } from 'expo-sqlite';
import { migrateDbIfNeeded } from '../components/sqlite/database';
import { AuthProvider } from '../components/sqlite/AuthContext';
import { CartProvider } from '../components/sqlite/CartContext';

export default function RootLayout() {
  return (
    <SQLiteProvider databaseName="myapp.db" onInit={migrateDbIfNeeded}>
      <AuthProvider>
        <CartProvider>
          <Stack screenOptions={{ headerShown: false }} />
        </CartProvider>
      </AuthProvider>
    </SQLiteProvider>
  );
}
