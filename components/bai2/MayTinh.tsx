import { useState, useMemo } from 'react';
import { Text, View, TextInput, Button, StyleSheet } from 'react-native';
import RadioGroup, { RadioButtonProps } from 'react-native-radio-buttons-group';

export default function MayTinh() {
    const [soA, setSoA] = useState('');
    const [soB, setSoB] = useState('');
    const [ketQua, setKetQua] = useState('');
    const [selectedId, setSelectedId] = useState<string | undefined>('+');

    const radioButtons: RadioButtonProps[] = useMemo(() => ([
        {
            id: '+',
            label: 'Cộng (+)',
            value: '+',
            color: '#007BFF',
        },
        {
            id: '-',
            label: 'Trừ (-)',
            value: '-',
            color: '#007BFF',
        },
        {
            id: 'x',
            label: 'Nhân (x)',
            value: 'x',
            color: '#007BFF',
        },
        {
            id: '/',
            label: 'Chia (/)',
            value: '/',
            color: '#007BFF',
        }
    ]), []);

    const tinh = () => {
        const a = parseFloat(soA);
        const b = parseFloat(soB);
        const kq = selectedId === '+' ? a + b : selectedId === '-' ? a - b : selectedId === 'x' ? a * b : a / b;
        setKetQua(`Kết quả: ${a} ${selectedId} ${b} = ${kq}`);
    };

    return (
        <View style={styles.container}>
            <Text style={styles.title}>MayTinh</Text>

            <TextInput
                style={styles.input}
                placeholder="giá trị a"
                value={soA}
                onChangeText={setSoA}
                keyboardType="numeric"
            />
            <TextInput
                style={styles.input}
                placeholder="giá trị b"
                value={soB}
                onChangeText={setSoB}
                keyboardType="numeric"
            />

            <Text style={styles.label}>Chọn phép tính:</Text>
            <View style={styles.radioContainer}>
                <RadioGroup 
                    radioButtons={radioButtons} 
                    onPress={setSelectedId}
                    selectedId={selectedId}
                    layout="column"
                    containerStyle={styles.radioGroup}
                />
            </View>

            <View style={styles.buttonWrapper}>
                <Button title="Tính kết quả" onPress={tinh} />
            </View>

            {ketQua ? <Text style={styles.result}>{ketQua}</Text> : null}
        </View>
    );
}

const styles = StyleSheet.create({
    input: {
        borderWidth: 1,
        borderColor: '#ccc',
        padding: 10,
        marginVertical: 5,
        borderRadius: 5,
        fontSize: 16,
    },
    container: {
        flex: 1,
        justifyContent: 'center',
        padding: 20,
        backgroundColor: '#fff',
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        textAlign: 'center',
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginTop: 15,
        marginBottom: 5,
        color: '#000',
    },
    radioContainer: {
        marginVertical: 10,
    },
    radioGroup: {
        alignItems: 'flex-start',
    },
    buttonWrapper: {
        marginVertical: 15,
    },
    result: {
        marginTop: 20,
        fontSize: 24,
        fontWeight: 'bold',
        color: 'blue',
        textAlign: 'center',
    },
});
