import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  Alert,
  SafeAreaView,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSQLiteContext } from 'expo-sqlite';
import { useAuth } from './AuthContext';
import { loginUser, type User } from './database';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadows } from '../../constants/theme';

const colors = Colors.light;

interface SuccessModalProps {
  visible: boolean;
  title: string;
  message: string;
  buttonText: string;
  onClose: () => void;
}

const SuccessModal = ({ visible, title, message, buttonText, onClose }: SuccessModalProps) => (
  <Modal visible={visible} transparent animationType="fade">
    <View style={styles.modalOverlay}>
      <View style={styles.successModalCard}>
        <View style={styles.successIconCircle}>
          <Ionicons name="checkmark" size={40} color="#FFFFFF" />
        </View>
        <Text style={styles.successModalTitle}>{title}</Text>
        <Text style={styles.successModalMessage}>{message}</Text>
        <TouchableOpacity style={styles.successModalBtn} onPress={onClose} activeOpacity={0.8}>
          <Text style={styles.successModalBtnText}>{buttonText}</Text>
        </TouchableOpacity>
      </View>
    </View>
  </Modal>
);

interface AuthScreenProps {
  onSwitchTab: (tab: 'home' | 'login' | 'register') => void;
}

export function LoginScreen({ onSwitchTab }: AuthScreenProps) {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const [pendingUser, setPendingUser] = useState<User | null>(null);
  const { setLoggedInUser } = useAuth();
  const db = useSQLiteContext();

  const handleLogin = async () => {
    if (!username.trim() || !password.trim()) {
      if (Platform.OS === 'web') window.alert('Vui lòng nhập đầy đủ thông tin đăng nhập.');
      else Alert.alert('Thông báo', 'Vui lòng nhập đầy đủ thông tin đăng nhập.');
      return;
    }
    try {
      const user = await loginUser(db, username.trim(), password.trim());
      if (user) {
        setPendingUser(user);
        setSuccessVisible(true);
      } else {
        if (Platform.OS === 'web') window.alert('Tên tài khoản hoặc mật khẩu không chính xác.');
        else Alert.alert('Lỗi', 'Tên tài khoản hoặc mật khẩu không chính xác.');
      }
    } catch (error) {
      if (Platform.OS === 'web') window.alert('Có lỗi xảy ra trong quá trình đăng nhập.');
      else Alert.alert('Lỗi', 'Có lỗi xảy ra trong quá trình đăng nhập.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={[styles.logoSquare, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="bag-handle" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.brandTitle, { color: colors.primary }]}>S1DN</Text>
            <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>Chào mừng bạn trở lại!</Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadows.md]}>
            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Tên tài khoản</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Nhập tên tài khoản"
                  placeholderTextColor={colors.textTertiary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Mật khẩu</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="••••••••"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Forgot Password */}
            <TouchableOpacity style={styles.forgotBtn}>
              <Text style={[styles.forgotText, { color: colors.primary }]}>Quên mật khẩu?</Text>
            </TouchableOpacity>

            {/* Submit Button */}
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleLogin} activeOpacity={0.8}>
              <Text style={styles.submitText}>Đăng nhập</Text>
              <Ionicons name="log-in-outline" size={18} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Divider */}
            <View style={styles.dividerRow}>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
              <Text style={[styles.dividerText, { color: colors.textTertiary }]}>hoặc tiếp tục với</Text>
              <View style={[styles.dividerLine, { backgroundColor: colors.border }]} />
            </View>

            {/* Social Logins */}
            <View style={styles.socialRow}>
              <TouchableOpacity style={[styles.socialBtn, { borderColor: colors.border }]} activeOpacity={0.7}>
                <Ionicons name="logo-google" size={18} color={colors.text} />
                <Text style={[styles.socialText, { color: colors.text }]}>Google</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.socialBtn, { borderColor: colors.border }]} activeOpacity={0.7}>
                <Ionicons name="logo-apple" size={18} color={colors.text} />
                <Text style={[styles.socialText, { color: colors.text }]}>Apple</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Registration link */}
          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>Chưa có tài khoản? </Text>
            <TouchableOpacity onPress={() => onSwitchTab('register')}>
              <Text style={[styles.switchLink, { color: colors.primary }]}>Đăng ký ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={successVisible}
        title="Đăng nhập thành công"
        message="Chào mừng bạn quay trở lại với S1DN!"
        buttonText="Tiếp tục"
        onClose={() => {
          setSuccessVisible(false);
          if (pendingUser) {
            setLoggedInUser(pendingUser);
          }
          onSwitchTab('home');
        }}
      />
    </SafeAreaView>
  );
}

export function RegisterScreen({ onSwitchTab }: AuthScreenProps) {
  const [fullname, setFullname] = useState('');
  const [email, setEmail] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [successVisible, setSuccessVisible] = useState(false);
  const { register } = useAuth();

  const handleRegister = async () => {
    if (!fullname.trim() || !email.trim() || !username.trim() || !password.trim()) {
      if (Platform.OS === 'web') window.alert('Vui lòng điền đầy đủ các thông tin bắt buộc.');
      else Alert.alert('Thông báo', 'Vui lòng điền đầy đủ các thông tin bắt buộc.');
      return;
    }
    if (password !== confirmPassword) {
      if (Platform.OS === 'web') window.alert('Mật khẩu xác nhận không trùng khớp.');
      else Alert.alert('Lỗi', 'Mật khẩu xác nhận không trùng khớp.');
      return;
    }
    try {
      await register(username, password, fullname, email);
      setSuccessVisible(true);
    } catch (error: any) {
      if (Platform.OS === 'web') window.alert(error.message || 'Không thể đăng ký tài khoản.');
      else Alert.alert('Lỗi', error.message || 'Không thể đăng ký tài khoản.');
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={styles.container}>
        <ScrollView contentContainerStyle={styles.scrollContent} keyboardShouldPersistTaps="handled">
          {/* Brand Header */}
          <View style={styles.brandHeader}>
            <View style={[styles.logoSquare, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="person-add" size={32} color={colors.primary} />
            </View>
            <Text style={[styles.brandTitle, { color: colors.primary }]}>S1DN</Text>
            <Text style={[styles.brandSubtitle, { color: colors.textSecondary }]}>Tạo tài khoản mới</Text>
          </View>

          {/* Form Card */}
          <View style={[styles.formCard, { backgroundColor: colors.card, borderColor: colors.border }, Shadows.md]}>
            {/* Fullname */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Họ và tên *</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="card-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Nhập đầy đủ họ tên"
                  placeholderTextColor={colors.textTertiary}
                  value={fullname}
                  onChangeText={setFullname}
                />
              </View>
            </View>

            {/* Email */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Email *</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="mail-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="email@example.com"
                  placeholderTextColor={colors.textTertiary}
                  keyboardType="email-address"
                  value={email}
                  onChangeText={setEmail}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Username */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Tên tài khoản *</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="person-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Tên đăng nhập"
                  placeholderTextColor={colors.textTertiary}
                  value={username}
                  onChangeText={setUsername}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Mật khẩu *</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="lock-closed-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Tối thiểu 6 ký tự"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                  autoCapitalize="none"
                />
                <TouchableOpacity onPress={() => setShowPassword(!showPassword)} style={styles.eyeBtn}>
                  <Ionicons name={showPassword ? 'eye-off-outline' : 'eye-outline'} size={18} color={colors.textTertiary} />
                </TouchableOpacity>
              </View>
            </View>

            {/* Confirm Password */}
            <View style={styles.inputGroup}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>Xác nhận mật khẩu *</Text>
              <View style={[styles.inputRow, { backgroundColor: colors.card, borderColor: colors.border }]}>
                <Ionicons name="checkmark-circle-outline" size={18} color={colors.textTertiary} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, { color: colors.text }]}
                  placeholder="Nhập lại mật khẩu"
                  placeholderTextColor={colors.textTertiary}
                  secureTextEntry={!showPassword}
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  autoCapitalize="none"
                />
              </View>
            </View>

            {/* Submit Button */}
            <TouchableOpacity style={[styles.submitBtn, { backgroundColor: colors.primary }]} onPress={handleRegister} activeOpacity={0.8}>
              <Text style={styles.submitText}>Đăng Ký Tài Khoản</Text>
            </TouchableOpacity>
          </View>

          {/* Login link */}
          <View style={styles.switchRow}>
            <Text style={[styles.switchText, { color: colors.textSecondary }]}>Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => onSwitchTab('login')}>
              <Text style={[styles.switchLink, { color: colors.primary }]}>Đăng nhập ngay</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>

      <SuccessModal
        visible={successVisible}
        title="Đăng ký thành công"
        message={`Tài khoản "${username}" đã được tạo thành công!`}
        buttonText="Đến đăng nhập"
        onClose={() => {
          setSuccessVisible(false);
          onSwitchTab('login');
        }}
      />
    </SafeAreaView>
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
    flexGrow: 1,
    paddingHorizontal: Spacing.four,
    paddingTop: Spacing.five,
    paddingBottom: Spacing.five,
  },
  brandHeader: {
    alignItems: 'center',
    marginBottom: Spacing.five,
  },
  logoSquare: {
    width: 72,
    height: 72,
    borderRadius: BorderRadius.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.three,
  },
  brandTitle: {
    fontSize: FontSize.heading,
    fontWeight: FontWeight.extrabold,
    letterSpacing: -0.5,
  },
  brandSubtitle: {
    fontSize: FontSize.body,
    marginTop: Spacing.xs,
  },
  formCard: {
    borderRadius: BorderRadius.lg,
    padding: Spacing.four,
    borderWidth: 1,
  },
  inputGroup: {
    marginBottom: Spacing.three,
  },
  label: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
    marginBottom: Spacing.xs,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    paddingHorizontal: Spacing.sm,
    height: 48,
  },
  inputIcon: {
    marginRight: Spacing.sm,
  },
  input: {
    flex: 1,
    fontSize: FontSize.body,
    height: '100%',
  },
  eyeBtn: {
    padding: Spacing.xs,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: Spacing.three,
  },
  forgotText: {
    fontSize: FontSize.caption,
    fontWeight: FontWeight.semibold,
  },
  submitBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: BorderRadius.md,
    height: 48,
    gap: Spacing.sm,
  },
  submitText: {
    color: '#FFFFFF',
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.bold,
  },
  dividerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.four,
  },
  dividerLine: {
    flex: 1,
    height: 1,
  },
  dividerText: {
    marginHorizontal: Spacing.sm,
    fontSize: FontSize.caption,
  },
  socialRow: {
    flexDirection: 'row',
    gap: Spacing.three,
  },
  socialBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderRadius: BorderRadius.md,
    height: 44,
    gap: Spacing.sm,
  },
  socialText: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.semibold,
  },
  switchRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: Spacing.four,
  },
  switchText: {
    fontSize: FontSize.body,
  },
  switchLink: {
    fontSize: FontSize.body,
    fontWeight: FontWeight.bold,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.four,
  },
  successModalCard: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#FFFFFF',
    borderRadius: BorderRadius.xl,
    padding: Spacing.five,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 15,
    elevation: 10,
  },
  successIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: Spacing.four,
  },
  successModalTitle: {
    fontSize: FontSize.heading,
    fontWeight: FontWeight.bold,
    color: '#1F2937',
    marginBottom: Spacing.sm,
    textAlign: 'center',
  },
  successModalMessage: {
    fontSize: FontSize.body,
    color: '#6B7280',
    textAlign: 'center',
    marginBottom: Spacing.five,
    lineHeight: 22,
  },
  successModalBtn: {
    backgroundColor: colors.primary,
    width: '100%',
    paddingVertical: 14,
    borderRadius: BorderRadius.md,
    alignItems: 'center',
  },
  successModalBtnText: {
    color: '#FFFFFF',
    fontSize: FontSize.bodyLg,
    fontWeight: FontWeight.bold,
  },
});
