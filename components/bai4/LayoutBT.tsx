import { StyleSheet, Text, View } from 'react-native';

export default function LayoutBT() {
    return (
        <View style={styles.container}>
            {/* Vùng 1: Trên cùng */}
            <View style={[styles.box, styles.box1]}>
                <Text style={styles.text}>Vùng 1</Text>
            </View>

            {/* Vùng 2: Ở giữa */}
            <View style={[styles.box, styles.box2]}>
                <Text style={styles.text}>Vùng 2</Text>
            </View>

            {/* Vùng 3: Dưới cùng */}
            <View style={[styles.box, styles.box3]}>
                <Text style={styles.text}>Vùng 3</Text>
            </View>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row', // Hướng ngang — mặc định của React Native là column
    },
    box: {
        flex: 1, // Chia đều 3 vùng bằng nhau
        justifyContent: 'center',
        alignItems: 'center',
    },
    box1: {
        backgroundColor: '#3b82f6', // Màu xanh dương hiện đại
    },
    box2: {
        backgroundColor: '#10b981', // Màu xanh lá cây dịu mắt
    },
    box3: {
        backgroundColor: '#f59e0b', // Màu cam ấm áp
    },
    text: {
        color: '#ffffff',
        fontSize: 24,
        fontWeight: 'bold',
        letterSpacing: 1,
    },
});
