import React, { useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TextInput,
  Button,
  Alert,
  ScrollView,
} from 'react-native';
import ReadingsScreen from './ReadingsScreen';

type Reading = {
  id: string;
  time: string;
  glucose: number;
  note: string;
  punctureSpot: string;
};

export default function App() {
  const [glucose, setGlucose] = useState('');
  const [note, setNote] = useState('');
  const [punctureSpot, setPunctureSpot] = useState('');
  const [lastSubmitted, setLastSubmitted] = useState<string | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [screen, setScreen] = useState<'home' | 'readings'>('home');

  const handleSubmit = () => {
    const trimmed = glucose.trim();
    if (!trimmed) {
      Alert.alert('Validation', 'Please enter a glucose value.');
      return;
    }
    const num = Number(trimmed);
    if (Number.isNaN(num) || num <= 0) {
      Alert.alert('Validation', 'Please enter a valid positive number.');
      return;
    }

    const newReading: Reading = {
      id: String(Date.now()),
      time: new Date().toLocaleString(),
      glucose: num,
      note: note.trim(),
      punctureSpot: punctureSpot.trim(),
    };
    setReadings(prev => [newReading, ...prev]);
    setLastSubmitted(trimmed);
    setGlucose('');
    setNote('');
    setPunctureSpot('');
    Alert.alert('Saved', `Glucose ${trimmed} saved.`);
  };

  if (screen === 'readings') {
    return (
      <ReadingsScreen
        readings={readings}
        onBack={() => setScreen('home')}
      />
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Blood Glucose Tracker</Text>

      <TextInput
        style={styles.input}
        keyboardType="numeric"
        placeholder="Enter glucose (mg/dL)"
        value={glucose}
        onChangeText={setGlucose}
      />

      <TextInput
        style={styles.input}
        placeholder="Note (optional)"
        value={note}
        onChangeText={setNote}
      />

      <TextInput
        style={styles.input}
        placeholder="Puncture Spot (e.g., finger & side)"
        value={punctureSpot}
        onChangeText={setPunctureSpot}
      />

      <View style={styles.rowButtons}>
        <View style={styles.button}>
          <Button title="Submit" onPress={handleSubmit} />
        </View>
        <View style={styles.button}>
          <Button title="View Readings" onPress={() => setScreen('readings')} />
        </View>
      </View>

      {lastSubmitted && <Text style={styles.confirmation}>Last: {lastSubmitted} mg/dL</Text>}
      <StatusBar style="auto" />
    </ScrollView>
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
    // when displayed in a row, let buttons share space
    flex: 1,
    marginBottom: 12,
  },
  rowButtons: {
    flexDirection: 'row',
    width: '100%',
    justifyContent: 'space-between',
    gap: 8,
    marginBottom: 12,
  },
  confirmation: {
    marginTop: 8,
    color: '#333',
  },
});
