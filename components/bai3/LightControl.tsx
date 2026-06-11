import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import RealisticBulb from './RealisticBulb';

interface LightControlProps {
  isOn: boolean;
  brightness: number;
  onToggle: () => void;
  onIncrease: () => void;
  onDecrease: () => void;
}

export default function LightControl({
  isOn,
  brightness,
  onToggle,
  onIncrease,
  onDecrease,
}: LightControlProps) {
  const statusColor = isOn ? '#27ae60' : '#e74c3c';

  return (
    <View style={styles.container}>
      <Text style={styles.header}>===== COMPONENT CON =====</Text>

      {/* Bóng đèn thực tế vẽ bằng SVG + Toán học */}
      <View style={styles.bulbWrap}>
        <RealisticBulb isOn={isOn} brightness={brightness} size={180} />
      </View>

      {/* Trạng thái nhận được */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Trạng thái nhận được: </Text>
        <Text style={[styles.infoValue, { color: statusColor }]}>
          {isOn ? 'Bật' : 'Tắt'}
        </Text>
      </View>

      {/* Độ sáng nhận được */}
      <View style={styles.infoRow}>
        <Text style={styles.infoLabel}>Độ sáng nhận được: </Text>
        <Text style={styles.infoValue}>{brightness}</Text>
      </View>

      {/* Thanh độ sáng */}
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            {
              width: `${isOn ? brightness : 0}%`,
              backgroundColor: isOn ? '#f39c12' : '#ccc',
            },
          ]}
        />
      </View>

      {/* Nút Bật/Tắt */}
      <TouchableOpacity
        style={[styles.button, styles.toggleBtn]}
        onPress={onToggle}
        activeOpacity={0.8}
      >
        <Text style={styles.buttonText}>
          {isOn ? 'Tắt đèn' : 'Bật đèn'}
        </Text>
      </TouchableOpacity>

      {/* Nút Tăng/Giảm */}
      <View style={styles.row}>
        <TouchableOpacity
          style={[
            styles.button,
            styles.actionBtn,
            !isOn && styles.buttonDisabled,
          ]}
          onPress={onDecrease}
          disabled={!isOn}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, !isOn && styles.textDisabled]}>
            Giảm độ sáng
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.button,
            styles.actionBtn,
            !isOn && styles.buttonDisabled,
          ]}
          onPress={onIncrease}
          disabled={!isOn}
          activeOpacity={0.7}
        >
          <Text style={[styles.buttonText, !isOn && styles.textDisabled]}>
            Tăng độ sáng
          </Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    backgroundColor: '#f8f9fa',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#dee2e6',
    padding: 20,
    marginTop: 16,
    alignItems: 'center',
  },
  header: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 16,
  },

  bulbWrap: {
    marginBottom: 8,
    alignItems: 'center',
  },

  // Thông tin
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 15,
    color: '#666',
  },
  infoValue: {
    fontSize: 15,
    fontWeight: '700',
    color: '#2c3e50',
  },

  // Thanh độ sáng
  progressBar: {
    width: '100%',
    height: 8,
    backgroundColor: '#e9ecef',
    borderRadius: 4,
    marginTop: 8,
    marginBottom: 16,
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
  },

  // Nút
  row: {
    flexDirection: 'row',
    gap: 10,
    width: '100%',
  },
  button: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  toggleBtn: {
    width: '100%',
    backgroundColor: '#2c3e50',
    marginBottom: 10,
  },
  actionBtn: {
    flex: 1,
    backgroundColor: '#3498db',
  },
  buttonDisabled: {
    backgroundColor: '#bdc3c7',
  },
  buttonText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#ffffff',
  },
  textDisabled: {
    color: '#7f8c8d',
  },
});
