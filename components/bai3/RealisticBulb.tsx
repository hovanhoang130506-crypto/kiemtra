import React from 'react';
import { View, StyleSheet } from 'react-native';
import Svg, {
  Path,
  Defs,
  RadialGradient,
  Stop,
  Line,
  Rect,
  G,
  Circle,
  LinearGradient,
} from 'react-native-svg';

interface RealisticBulbProps {
  isOn: boolean;
  brightness: number; // 0 → 100
  size?: number;      // kích thước tổng thể, mặc định 200
}

/**
 * Bóng đèn thực tế vẽ bằng SVG + Toán học
 *
 * Toán học sử dụng:
 * 1. Đường cong Bézier bậc 3 (Cubic Bezier) cho bầu thủy tinh
 * 2. Hàm sin() cho dây tóc (filament)
 * 3. Lượng giác sin()/cos() cho tia sáng tỏa ra
 * 4. Nội suy tuyến tính (linear interpolation) cho màu nhiệt độ
 * 5. Radial Gradient cho hiệu ứng phát sáng
 */
export default function RealisticBulb({
  isOn,
  brightness,
  size = 200,
}: RealisticBulbProps) {
  // Tỷ lệ scale theo kích thước
  const scale = size / 200;
  const cx = 100; // center x trong viewBox 200x240
  const cy = 120; // center y

  // ========== TOÁN HỌC: Nội suy tuyến tính cho màu nhiệt độ ==========
  // Brightness 0 = tối (đỏ cam nhạt), 100 = sáng chói (trắng vàng)
  const t = isOn ? brightness / 100 : 0;

  // Nhiệt độ màu: lerp từ đỏ cam (1800K) → vàng ấm (2700K) → trắng ấm (4000K)
  // R: 255 → 255 → 255
  // G: 120 → 200 → 240
  // B: 20 → 80 → 200
  const r = 255;
  const g = Math.round(120 + t * 120); // 120 → 240
  const b = Math.round(20 + t * 180);  // 20 → 200

  const glowColor = `rgb(${r}, ${g}, ${b})`;
  const glowOpacity = t * 0.85; // 0 → 0.85

  // Filament color: cam đậm → vàng sáng → trắng
  const fR = 255;
  const fG = Math.round(80 + t * 175);  // 80 → 255
  const fB = Math.round(0 + t * 200);   // 0 → 200
  const filamentColor = `rgb(${fR}, ${fG}, ${fB})`;
  const filamentWidth = 1.5 + t * 1;    // dày hơn khi sáng

  // ========== TOÁN HỌC: Đường cong Bézier cho bầu thủy tinh ==========
  // Bầu đèn: dùng 2 đường Bézier bậc 3 (cubic bezier) đối xứng
  // P0(60,130) → C1(30,80) → C2(40,20) → P3(100,18) : nửa trái
  // P0(100,18) → C1(160,20) → C2(170,80) → P3(140,130) : nửa phải
  const bulbPath = `
    M 60 130
    C 30 80, 40 20, 100 18
    C 160 20, 170 80, 140 130
    Z
  `;

  // Phần cổ đèn nối bầu với đuôi
  const neckPath = `
    M 60 130
    Q 65 145, 70 150
    L 130 150
    Q 135 145, 140 130
  `;

  // ========== TOÁN HỌC: Hàm sin() cho dây tóc (filament) ==========
  // Dây tóc zigzag dùng hàm sin
  // y = centerY + amplitude * sin(frequency * x)
  const generateFilament = () => {
    const startX = 78;
    const endX = 122;
    const centerY = 75;
    const amplitude = 12;
    const frequency = 0.5; // chu kỳ
    const steps = 40;

    let path = `M ${startX} ${centerY}`;
    for (let i = 1; i <= steps; i++) {
      const x = startX + (endX - startX) * (i / steps);
      const y = centerY + amplitude * Math.sin(frequency * i * Math.PI);
      path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return path;
  };

  // Dây tóc phụ (coil - cuộn xoắn nhỏ hơn)
  const generateCoilFilament = () => {
    const startX = 82;
    const endX = 118;
    const centerY = 90;
    const amplitude = 6;
    const frequency = 0.9;
    const steps = 30;

    let path = `M ${startX} ${centerY}`;
    for (let i = 1; i <= steps; i++) {
      const x = startX + (endX - startX) * (i / steps);
      const y = centerY + amplitude * Math.sin(frequency * i * Math.PI);
      path += ` L ${x.toFixed(1)} ${y.toFixed(1)}`;
    }
    return path;
  };

  // Dây dẫn từ đuôi lên dây tóc
  const supportWire1 = `M 88 150 L 78 75`;
  const supportWire2 = `M 112 150 L 122 75`;
  const supportWire3 = `M 92 150 L 82 90`;
  const supportWire4 = `M 108 150 L 118 90`;

  // ========== TOÁN HỌC: Lượng giác cho tia sáng ==========
  // Tia sáng tỏa ra từ tâm bóng đèn dùng sin(θ) và cos(θ)
  const generateRays = () => {
    if (!isOn || brightness < 10) return null;

    const rays = [];
    const numRays = 12;
    const innerRadius = 72;
    const outerRadius = 72 + 15 + (brightness / 100) * 25; // 87 → 112

    for (let i = 0; i < numRays; i++) {
      // θ = (i / numRays) * 2π — phân bố đều quanh vòng tròn
      const angle = (i / numRays) * 2 * Math.PI;
      const x1 = cx + innerRadius * Math.cos(angle);
      const y1 = 74 + innerRadius * Math.sin(angle);
      const x2 = cx + outerRadius * Math.cos(angle);
      const y2 = 74 + outerRadius * Math.sin(angle);

      rays.push(
        <Line
          key={`ray-${i}`}
          x1={x1.toFixed(1)}
          y1={y1.toFixed(1)}
          x2={x2.toFixed(1)}
          y2={y2.toFixed(1)}
          stroke={glowColor}
          strokeWidth={1 + (brightness / 100) * 1.5}
          strokeLinecap="round"
          opacity={0.3 + (brightness / 100) * 0.5}
        />
      );
    }
    return rays;
  };

  // ========== TOÁN HỌC: Đuôi đèn (screw base) với sọc hình sin ==========
  // Sọc xoắn ốc mô phỏng bằng đường cong sin nhỏ
  const generateScrewLines = () => {
    const lines = [];
    const screwTop = 150;
    const screwBottom = 185;
    const numLines = 5;

    for (let i = 0; i < numLines; i++) {
      const y = screwTop + ((screwBottom - screwTop) / (numLines + 1)) * (i + 1);
      // Đường cong nhẹ dùng quadratic bezier để tạo hiệu ứng 3D
      lines.push(
        <Path
          key={`screw-${i}`}
          d={`M 70 ${y} Q 100 ${y + 3}, 130 ${y}`}
          stroke="#8a8a8a"
          strokeWidth={1.5}
          fill="none"
          opacity={0.7}
        />
      );
    }
    return lines;
  };

  return (
    <View style={[styles.container, { width: size, height: size * 1.2 }]}>
      <Svg
        width={size}
        height={size * 1.2}
        viewBox="0 0 200 240"
      >
        <Defs>
          {/* Gradient phát sáng cho bầu đèn */}
          <RadialGradient id="bulbGlow" cx="50%" cy="40%" r="50%">
            <Stop
              offset="0%"
              stopColor={isOn ? glowColor : '#e8e8e8'}
              stopOpacity={isOn ? 0.95 : 0.3}
            />
            <Stop
              offset="40%"
              stopColor={isOn ? glowColor : '#d0d0d0'}
              stopOpacity={isOn ? 0.6 * t : 0.2}
            />
            <Stop
              offset="100%"
              stopColor={isOn ? `rgba(${r}, ${g}, ${b}, 0.1)` : '#c0c0c0'}
              stopOpacity={isOn ? 0.15 : 0.15}
            />
          </RadialGradient>

          {/* Gradient cho vầng sáng bên ngoài */}
          <RadialGradient id="outerGlow" cx="50%" cy="35%" r="60%">
            <Stop offset="0%" stopColor={glowColor} stopOpacity={glowOpacity * 0.5} />
            <Stop offset="60%" stopColor={glowColor} stopOpacity={glowOpacity * 0.15} />
            <Stop offset="100%" stopColor={glowColor} stopOpacity={0} />
          </RadialGradient>

          {/* Gradient cho thân đuôi đèn (metallic) */}
          <LinearGradient id="screwGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <Stop offset="0%" stopColor="#a0a0a0" />
            <Stop offset="30%" stopColor="#d0d0d0" />
            <Stop offset="50%" stopColor="#e0e0e0" />
            <Stop offset="70%" stopColor="#d0d0d0" />
            <Stop offset="100%" stopColor="#909090" />
          </LinearGradient>

          {/* Gradient phản chiếu trên bầu thủy tinh */}
          <RadialGradient id="glassReflect" cx="35%" cy="30%" r="40%">
            <Stop offset="0%" stopColor="#ffffff" stopOpacity={0.5} />
            <Stop offset="100%" stopColor="#ffffff" stopOpacity={0} />
          </RadialGradient>
        </Defs>

        {/* === Vầng sáng bên ngoài (outer glow) === */}
        {isOn && brightness > 5 && (
          <Circle
            cx={cx}
            cy={74}
            r={90 + (brightness / 100) * 30}
            fill="url(#outerGlow)"
          />
        )}

        {/* === Tia sáng === */}
        {generateRays()}

        {/* === Bầu thủy tinh (glass bulb) === */}
        <Path
          d={bulbPath}
          fill="url(#bulbGlow)"
          stroke={isOn ? `rgba(${r}, ${g}, ${Math.min(b + 50, 255)}, 0.6)` : '#b0b0b0'}
          strokeWidth={2}
        />

        {/* === Phản chiếu trên thủy tinh === */}
        <Path
          d={bulbPath}
          fill="url(#glassReflect)"
        />

        {/* === Phần cổ đèn === */}
        <Path
          d={neckPath}
          fill={isOn ? `rgba(${r}, ${g}, ${b}, 0.3)` : '#c8c8c8'}
          stroke="none"
        />

        {/* === Dây dẫn (support wires) === */}
        <Path d={supportWire1} stroke="#666" strokeWidth={1} opacity={0.5} />
        <Path d={supportWire2} stroke="#666" strokeWidth={1} opacity={0.5} />
        <Path d={supportWire3} stroke="#666" strokeWidth={0.8} opacity={0.4} />
        <Path d={supportWire4} stroke="#666" strokeWidth={0.8} opacity={0.4} />

        {/* === Dây tóc chính (main filament) - sin wave === */}
        <Path
          d={generateFilament()}
          stroke={isOn ? filamentColor : '#888'}
          strokeWidth={isOn ? filamentWidth : 1.2}
          fill="none"
          strokeLinecap="round"
          opacity={isOn ? 0.9 : 0.4}
        />

        {/* === Dây tóc phụ (coil filament) - sin wave nhỏ === */}
        <Path
          d={generateCoilFilament()}
          stroke={isOn ? filamentColor : '#888'}
          strokeWidth={isOn ? filamentWidth * 0.8 : 1}
          fill="none"
          strokeLinecap="round"
          opacity={isOn ? 0.7 : 0.3}
        />

        {/* === Inner glow quanh dây tóc khi sáng === */}
        {isOn && brightness > 15 && (
          <Circle
            cx={cx}
            cy={82}
            r={20 + (brightness / 100) * 10}
            fill={glowColor}
            opacity={0.15 + (brightness / 100) * 0.2}
          />
        )}

        {/* === Đuôi đèn (screw base) === */}
        {/* Hình thang nối cổ đèn xuống đuôi */}
        <Path
          d="M 70 150 L 65 155 L 65 185 Q 65 195, 100 195 Q 135 195, 135 185 L 135 155 L 130 150 Z"
          fill="url(#screwGrad)"
          stroke="#808080"
          strokeWidth={1}
        />

        {/* Sọc xoắn ốc trên đuôi */}
        {generateScrewLines()}

        {/* Điểm tiếp xúc dưới cùng */}
        <Rect
          x={85}
          y={195}
          width={30}
          height={6}
          rx={3}
          fill="#707070"
          stroke="#606060"
          strokeWidth={0.5}
        />

        {/* Chấm tiếp xúc */}
        <Circle cx={100} cy={204} r={5} fill="#606060" stroke="#505050" strokeWidth={0.5} />
      </Svg>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
});
