import { useState } from 'react';
import { Host, Row, Picker, Spacer, Text } from '@expo/ui';

const PHEPTINH_OPTIONS = [
    { label: 'Cộng (+)', value: '+' },
    { label: 'Trừ (-)', value: '-' },
    { label: 'Nhân (x)', value: 'x' },
    { label: 'Chia (/)', value: '/' },
];

export default function PickerMenuExample() {
    const [value, setValue] = useState('+');

    return (
        <Host style={{ flex: 1 }}>
            <Row alignment="center" spacing={12} style={{ padding: 16 }}>
                <Text>Flavour:</Text>
                <Spacer flexible />
                <Picker selectedValue={value} onValueChange={setValue}>
                    {PHEPTINH_OPTIONS.map(f => (
                        <Picker.Item key={f.value} label={f.label} value={f.value} />
                    ))}
                </Picker>
            </Row>
        </Host>
    );
}