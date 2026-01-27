import React from 'react';
import { ScrollView, View, Text, Button, StyleSheet, TouchableOpacity, Alert } from 'react-native';

type Props = {
  onBack: () => void;
};

export default function SettingsScreen({ onBack }: Props) {
  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Settings</Text>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Pagination</Text>
        <Text style={styles.placeholder}>Items per page (placeholder)</Text>
        <View style={styles.row}>
          <Button title="10" onPress={() => Alert.alert('Placeholder', 'Set to 10')} />
          <Button title="20" onPress={() => Alert.alert('Placeholder', 'Set to 20')} />
          <Button title="50" onPress={() => Alert.alert('Placeholder', 'Set to 50')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Font Size</Text>
        <View style={styles.row}>
          <Button title="Small" onPress={() => Alert.alert('Placeholder', 'Small')} />
          <Button title="Medium" onPress={() => Alert.alert('Placeholder', 'Medium')} />
          <Button title="Large" onPress={() => Alert.alert('Placeholder', 'Large')} />
        </View>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Colour Scheme</Text>
        <View style={styles.row}>
          <Button title="Light" onPress={() => Alert.alert('Placeholder', 'Light')} />
          <Button title="Dark" onPress={() => Alert.alert('Placeholder', 'Dark')} />
          <Button title="System" onPress={() => Alert.alert('Placeholder', 'System')} />
        </View>
      </View>

      <View style={styles.backButton}>
        <Button title="Back" onPress={onBack} />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  title: {
    fontSize: 20,
    fontWeight: '600',
    marginBottom: 16,
  },
  section: {
    width: '100%',
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  placeholder: {
    marginBottom: 8,
    color: '#444',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 8,
  },
  backButton: {
    marginTop: 24,
    width: '100%',
  },
});
