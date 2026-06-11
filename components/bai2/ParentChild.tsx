import { useState } from 'react';
import { StyleSheet, Text, View, TextInput } from 'react-native';

interface ChildProps {
  name: string;
  age: string;
  setName: (newName: string) => void;
  setAge: (newAge: string) => void;
}

// Component Con 
const ChildComponent = ({ name, age, setName, setAge }: ChildProps) => { //có thể dùng any cho ngắn gọn
  return (
    <View style={styles.section}>
      <Text style={styles.title}>Component Con</Text>

      <Text style={styles.text}>Tên nhận từ Cha: {name}</Text>
      <Text style={styles.text}>Tuổi nhận từ Cha: {age}</Text>

      <TextInput
        style={styles.input}
        placeholder="Con sửa Tên..."
        value={name}
        onChangeText={setName}
      />
      <TextInput
        style={styles.input}
        placeholder="Con sửa Tuổi..."
        value={age}
        onChangeText={setAge}
        keyboardType="numeric"
      />
    </View>
  );
};

// Component Cha
const ParentChild = () => {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');

  return (
    <View style={styles.container}>
      <View style={styles.section}>
        <Text style={styles.title}>Component Cha </Text>

        <Text style={styles.text}>Tên hiện tại: {name}</Text>
        <Text style={styles.text}>Tuổi hiện tại: {age}</Text>

        <TextInput
          style={styles.input}
          placeholder="Cha nhập Tên..."
          value={name}
          onChangeText={setName}
        />
        <TextInput
          style={styles.input}
          placeholder="Cha nhập Tuổi..."
          value={age}
          onChangeText={setAge}
          keyboardType="numeric"
        />
      </View>

      <ChildComponent
        name={name}
        age={age}
        setName={setName}
        setAge={setAge}
      />
    </View>
  );
};

export default ParentChild;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    paddingTop: 60,
    backgroundColor: '#ffffff',
  },
  section: {
    marginBottom: 30,
  },
  title: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#000000',
  },
  text: {
    fontSize: 14,
    marginVertical: 2,
    color: '#000000',
  },
  input: {
    borderWidth: 1,
    borderColor: '#000000',
    padding: 8,
    marginTop: 8,
    fontSize: 14,
  },
});
