import React from 'react';
import { View, Text, Button, ScrollView, StyleSheet } from 'react-native';

type Reading = {
  id: string;
  time: string;
  glucose: number;
  note: string;
  punctureSpot: string;
};

export default function ReadingsScreen({
  readings,
  onBack,
}: {
  readings: Reading[];
  onBack: () => void;
}) {
  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Readings</Text>
        <Button title="Back" onPress={onBack} />
      </View>

      <View style={styles.tableHeader}>
        <Text style={[styles.cell, styles.timeCell]}>Time</Text>
        <Text style={[styles.cell, styles.glucoseCell]}>Glucose (mg/dL)</Text>
        <Text style={[styles.cell, styles.noteCell]}>Note</Text>
        <Text style={[styles.cell, styles.spotCell]}>Puncture Spot</Text>
      </View>

      <ScrollView style={styles.list}>
        {readings.length === 0 ? (
          <Text style={styles.empty}>No readings yet.</Text>
        ) : (
          readings.map(r => (
            <View key={r.id} style={styles.row}>
              <Text style={[styles.cell, styles.timeCell]}>{r.time}</Text>
              <Text style={[styles.cell, styles.glucoseCell]}>{r.glucose}</Text>
              <Text style={[styles.cell, styles.noteCell]}>{r.note || '-'}</Text>
              <Text style={[styles.cell, styles.spotCell]}>{r.punctureSpot || '-'}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 48,
    paddingHorizontal: 12,
    backgroundColor: '#fff',
  },
  headerRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottomWidth: 1,
    borderBottomColor: '#ddd',
    paddingBottom: 6,
    marginBottom: 6,
  },
  list: {
    flex: 1,
  },
  row: {
    flexDirection: 'row',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  cell: {
    paddingHorizontal: 6,
  },
  timeCell: {
    flex: 3,
  },
  glucoseCell: {
    flex: 1,
    textAlign: 'center',
  },
  noteCell: {
    flex: 2,
  },
  spotCell: {
    flex: 1.5,
  },
  empty: {
    marginTop: 20,
    textAlign: 'center',
    color: '#666',
  },
});
