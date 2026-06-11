import { StyleSheet, Text, View, TextInput, Alert, TouchableOpacity } from 'react-native'
import { useState } from 'react'

const HelloState = () => {
  const [nameInput, setNameInput] = useState('');
  const [ageInput, setAgeInput] = useState('');

  const handlePress = () => {
    Alert.alert('Thông báo', `Xin chào ${nameInput}, bạn ${ageInput} tuổi`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.helloText}>HelloState</Text>
      <View style={styles.containerInput}>
        <TextInput style={styles.textInput}
          placeholder='nhập tên của bạn'
          value={nameInput}
          onChangeText={setNameInput}
        />
        <TextInput style={styles.textInput}
          placeholder='nhập tuổi của bạn'
          value={ageInput}
          onChangeText={setAgeInput}
          keyboardType='numeric'
        />
      </View>
      <TouchableOpacity style={styles.button} onPress={handlePress}>
        <Text style={styles.buttonText}>in kết quả</Text>
      </TouchableOpacity>
    </View>
  )
}

export default HelloState

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  containerInput: {
    marginVertical: 15
  },
  helloText: {
    color: '#f01010',
    fontSize: 40,
  },
  textInput: {
    color: '#079cf9',
    fontSize: 18,
    borderWidth: 2,
    borderRadius: 10,
    borderColor: '#f305e3',
    marginTop: 10,
    width: 320,
    height: 50,
    paddingHorizontal: 15,
  },
  button: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#18bfe0',
    width: 200,
    borderRadius: 10,
    marginTop: 10,
    paddingVertical: 8,
  },
  buttonText: {
    fontSize: 24,
    color: '#000000',
  }
})