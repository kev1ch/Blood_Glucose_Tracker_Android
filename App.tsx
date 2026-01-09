import React, { useState, useEffect } from 'react';
import { initDB, addReading, getReadings, Reading as DBReading } from './DBHelper';
import { StatusBar } from 'expo-status-bar';
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  TextInput,
  Button,
  Alert,
  ScrollView,
  Platform,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import ReadingsScreen from './ReadingsScreen';
import AboutScreen from './AboutScreen';

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
  const [date, setDate] = useState<Date>(new Date());
  const [showPicker, setShowPicker] = useState(false);
  const [pickerMode, setPickerMode] = useState<'date' | 'time'>('date');
  const [lastSubmitted, setLastSubmitted] = useState<string | null>(null);
  const [readings, setReadings] = useState<Reading[]>([]);
  const [screen, setScreen] = useState<'home' | 'readings' | 'about'>('home');

  const handleSubmit = async () => {
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
      time: date.toLocaleString(),
      glucose: num,
      note: note.trim(),
      punctureSpot: punctureSpot.trim(),
    };
    try {
      await addReading(newReading as DBReading);
      const rows = await getReadings();
      setReadings(rows);
    } catch (e) {
      console.warn('save failed', e);
    }
    setLastSubmitted(trimmed);
    setGlucose('');
    setNote('');
    setPunctureSpot('');
    Alert.alert('Saved', `Glucose ${trimmed} saved.`);
  };

  const onChangeDateTime = (event: any, selected?: Date) => {
    const current = selected || date;
    if (Platform.OS !== 'ios') {
      setShowPicker(false);
    }
    setDate(current);
  };

  useEffect(() => {
    (async () => {
      try {
        await initDB();
        const rows = await getReadings();
        setReadings(rows);
      } catch (e) {
        console.warn('init DB failed', e);
      }
    })();
  }, []);

  if (screen === 'readings') {
    return (
      <ReadingsScreen
        readings={readings}
        onBack={() => setScreen('home')}
      />
    );
  }

  if (screen === 'about') {
    return <AboutScreen onBack={() => setScreen('home')} />;
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Blood Glucose Tracker</Text>

      <View style={{ width: '100%', marginBottom: 12 }}>
        <Text style={{ marginBottom: 6 }}>Selected time: {date.toLocaleString()}</Text>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <View style={{ flex: 1 }}>
            <Button
              title="Set Date"
              onPress={() => {
                setPickerMode('date');
                setShowPicker(true);
              }}
            />
          </View>
          <View style={{ flex: 1 }}>
            <Button
              title="Set Time"
              onPress={() => {
                setPickerMode('time');
                setShowPicker(true);
              }}
            />
          </View>
        </View>
        {showPicker && (
          <DateTimePicker
            value={date}
            mode={pickerMode}
            is24Hour={false}
            display="default"
            onChange={onChangeDateTime}
          />
        )}
      </View>

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
      <TouchableOpacity style={styles.footer} onPress={() => setScreen('about')}>
        <Text style={styles.linkText}>About</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
    paddingBottom: 100,
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
  footer: {
    position: 'absolute',
    bottom: 20,
    alignSelf: 'center',
    paddingVertical: 12,
  },
  linkText: {
    color: '#0066cc',
    textDecorationLine: 'underline',
  },
});
