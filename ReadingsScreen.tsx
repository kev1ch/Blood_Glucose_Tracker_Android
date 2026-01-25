import React, { useEffect, useState } from 'react';
import { View, Text, Button, ScrollView, StyleSheet, Alert, TouchableOpacity } from 'react-native';
import { getReadingsPage, deleteReading, Reading as DBReading } from './DBHelper';

type Reading = {
  id: string;
  time: string;
  glucose: number;
  note: string;
  punctureSpot: string;
};

export default function ReadingsScreen({
  readings: initialReadings,
  onBack,
}: {
  readings?: Reading[];
  onBack: () => void;
}) {
  const [readings, setReadings] = useState<DBReading[]>(initialReadings ?? []);
  type SortBy = 'time' | 'glucose' | 'punctureSpot' | null;
  const [sortBy, setSortBy] = useState<SortBy>('time');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(false);

  async function load(pageArg?: number) {
    setLoading(true);
    try {
      const pageToLoad = pageArg ?? currentPage;
      const res = await getReadingsPage(pageToLoad, pageSize);
      if (res.items.length === 0 && pageToLoad > 1) {
        setCurrentPage(pageToLoad - 1);
        return;
      }
      setReadings(sortArray(res.items, sortBy, sortDir));
      setTotal(res.total);
    } catch (e) {
      console.warn('Failed to load readings', e);
    } finally {
      setLoading(false);
    }
  }

  function sortArray(items: DBReading[], by: SortBy, dir: 'asc' | 'desc') {
    if (!by) return items.slice();
    const a = items.slice();
    a.sort((x, y) => {
      let av: any;
      let bv: any;
      if (by === 'time') {
        av = new Date(x.time).getTime();
        bv = new Date(y.time).getTime();
        if (isNaN(av)) av = 0;
        if (isNaN(bv)) bv = 0;
      } else if (by === 'glucose') {
        av = x.glucose ?? 0;
        bv = y.glucose ?? 0;
      } else {
        av = (x.punctureSpot || '').toLowerCase();
        bv = (y.punctureSpot || '').toLowerCase();
      }

      if (typeof av === 'number' && typeof bv === 'number') {
        return dir === 'asc' ? av - bv : bv - av;
      }

      if (av < bv) return dir === 'asc' ? -1 : 1;
      if (av > bv) return dir === 'asc' ? 1 : -1;
      return 0;
    });
    return a;
  }

  useEffect(() => {
    load(currentPage);
  }, [currentPage, pageSize]);

  useEffect(() => {
    setReadings(prev => sortArray(prev, sortBy, sortDir));
  }, [sortBy, sortDir]);

  const handleDelete = (id: string) => {
    Alert.alert('Delete', 'Delete this reading?', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteReading(id);
            await load(currentPage);
          } catch (e) {
            console.warn('delete failed', e);
          }
        },
      },
    ]);
  };

  function handleSort(col: SortBy) {
    if (!col) return;
    const nextDir = sortBy === col ? (sortDir === 'asc' ? 'desc' : 'asc') : 'asc';
    setSortBy(col);
    setSortDir(nextDir);
  }

  const headerLabel = (label: string, col: SortBy) =>
    col && sortBy === col ? `${label} ${sortDir === 'asc' ? '▲' : '▼'}` : label;

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <Text style={styles.headerTitle}>Readings</Text>
        <View style={{ flexDirection: 'row' }}>
          <Button title={loading ? 'Loading...' : 'Refresh'} onPress={() => load()} />
          <View style={{ width: 8 }} />
          <Button title="Back" onPress={onBack} />
        </View>
      </View>

      <View style={styles.tableHeader}>
        <TouchableOpacity onPress={() => handleSort('time')} style={{ flex: 3 }}>
          <Text style={[styles.cell, styles.timeCell]}>{headerLabel('Time', 'time')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleSort('glucose')} style={{ flex: 1 }}>
          <Text style={[styles.cell, styles.glucoseCell]}>{headerLabel('Glucose (mg/dL)', 'glucose')}</Text>
        </TouchableOpacity>

        <Text style={[styles.cell, styles.noteCell]}>Notes</Text>

        <TouchableOpacity onPress={() => handleSort('punctureSpot')} style={{ flex: 1.5 }}>
          <Text style={[styles.cell, styles.spotCell]}>{headerLabel('Puncture Spot', 'punctureSpot')}</Text>
        </TouchableOpacity>

        <Text style={[styles.cell, { flex: 0.8 }]}> </Text>
      </View>

      <View style={{ flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginVertical: 8 }}>
        <Button title="Prev" disabled={currentPage <= 1 || loading} onPress={() => setCurrentPage(p => Math.max(1, p - 1))} />
        <View style={{ width: 12 }} />
        <Text style={{ alignSelf: 'center' }}>
          Page {currentPage} of {Math.max(1, Math.ceil(total / pageSize))} ({total} total)
        </Text>
        <View style={{ width: 12 }} />
        <Button
          title="Next"
          disabled={currentPage >= Math.ceil(Math.max(1, total) / pageSize) || loading}
          onPress={() => setCurrentPage(p => p + 1)}
        />
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
              <View style={{ flex: 0.8 }}>
                <Button title="Delete" color="#cc0000" onPress={() => handleDelete(r.id)} />
              </View>
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
