import { StyleSheet, View } from 'react-native';

export default function Layout1() {
    return (
        <View style={styles.container}>
            <View style={styles.vung1} />
            <View style={styles.vung2} />
            <View style={styles.vung3} />
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'column',
    },
    vung1: {
        flex: 1,
        backgroundColor: '#f59e0b',
    },
    vung2: {
        flex: 1,
        backgroundColor: '#3b82f6',
    },
    vung3: {
        flex: 1,
        backgroundColor: '#10b981',
    },
});
