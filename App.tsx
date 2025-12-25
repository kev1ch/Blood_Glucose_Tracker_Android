import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View, TextInput, Button, Alert } from 'react-native';

export default function App() {
  const [value, setValue] = useState('');
  const [lastSubmitted, setLastSubmitted] = useState<string | null>(null);

  const handleSubmit = () => {
    const trimmed = value.trim();
    if (!trimmed) {
      Alert.alert('Validation', 'Please enter a glucose value.');
      return;
    }
    const num = Number(trimmed);
    if (Number.isNaN(num) || num <= 0) {
      Alert.alert('Validation', 'Please enter a valid positive number.');
      return;
    }
    setLastSubmitted(trimmed);
    setValue('');
    Alert.alert('Saved', `Glucose ${trimmed} saved.`);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blood Glucose Tracker</Text>
      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter glucose (mg/dL)"
        value={value}
        onChangeText={setValue}
      />
      <View style={styles.button}>
        <Button title="Submit" onPress={handleSubmit} />
      </View>
      {lastSubmitted && <Text style={styles.confirmation}>Last: {lastSubmitted} mg/dL</Text>}
      <StatusBar style="auto" />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  input: {
    width: '100%',
    height: 44,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 6,
    paddingHorizontal: 10,
    marginBottom: 12,
  },
  button: {
    width: '100%',
    marginBottom: 12,
  },
  confirmation: {
    marginTop: 8,
    color: '#333',
  },
});
