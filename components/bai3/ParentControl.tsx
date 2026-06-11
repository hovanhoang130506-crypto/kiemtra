import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import LightControl from './LightControl';

export default function ParentControl() {
  const [isOn, setIsOn] = useState(false);
  const [brightness, setBrightness] = useState(50);

  const toggleLight = () => setIsOn((prev) => !prev);

  const increaseBrightness = () => {
    if (!isOn) return;
    setBrightness((prev) => Math.min(prev + 10, 100));
  };

  const decreaseBrightness = () => {
    if (!isOn) return;
    setBrightness((prev) => Math.max(prev - 10, 0));
  };

  return (
    <ScrollView
      style={styles.scrollView}
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
    >
      <Text style={styles.header}>===== COMPONENT CHA =====</Text>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Trạng thái đèn:</Text>
        <Text style={[styles.value, { color: isOn ? '#27ae60' : '#e74c3c' }]}>
          {isOn ? 'Bật' : 'Tắt'}
        </Text>
      </View>

      <View style={styles.infoBox}>
        <Text style={styles.label}>Độ sáng hiện tại:</Text>
        <Text style={styles.value}>{brightness}</Text>
      </View>

      <LightControl
        isOn={isOn}
        brightness={brightness}
        onToggle={toggleLight}
        onIncrease={increaseBrightness}
        onDecrease={decreaseBrightness}
      />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  scrollView: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  content: {
    padding: 20,
    paddingTop: 60,
    paddingBottom: 40,
    alignItems: 'center',
  },
  header: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 20,
  },
  infoBox: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
    gap: 8,
  },
  label: {
    fontSize: 16,
    color: '#555',
  },
  value: {
    fontSize: 16,
    fontWeight: '700',
    color: '#2c3e50',
  },
});
