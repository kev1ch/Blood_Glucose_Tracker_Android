import React from 'react';
import { View, Text, Button, StyleSheet } from 'react-native';

export default function AboutScreen({ onBack }: { onBack: () => void }) {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>About</Text>
      <Text style={styles.paragraph}>
        Blood Glucose Tracker
      </Text>
      <Text style={styles.paragraph}>Version 1.0.0</Text>
      <Text style={styles.paragraph}>A simple app to record glucose readings and notes.</Text>
      <View style={styles.button}>
        <Button title="Back" onPress={onBack} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 22,
    fontWeight: '600',
    marginBottom: 12,
  },
  paragraph: {
    fontSize: 16,
    marginBottom: 8,
    color: '#333',
  },
  button: {
    marginTop: 16,
    width: 120,
  },
});
