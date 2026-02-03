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
        av = parseTime(x.time);
        bv = parseTime(y.time);
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

  function parseTime(t: any): number {
    if (t == null) return 0;
    if (typeof t === 'number') return t;
    const s = String(t).trim();
    if (/^\d+$/.test(s)) return Number(s);

    // ISO or other formats parseable by Date.parse
    let ms = Date.parse(s);
    if (!isNaN(ms)) return ms;

    // Try US locale like "1/9/2026, 6:03:35 PM" or variants
    const us = s.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4}),?\s*(\d{1,2}):(\d{2})(?::(\d{2}))?\s*(AM|PM)?/i);
    if (us) {
      const month = Number(us[1]);
      const day = Number(us[2]);
      const year = Number(us[3]);
      let hour = Number(us[4]);
      const minute = Number(us[5] || 0);
      const second = Number(us[6] || 0);
      const ampm = us[7];
      if (ampm) {
        if (/pm/i.test(ampm) && hour < 12) hour += 12;
        if (/am/i.test(ampm) && hour === 12) hour = 0;
      }
      return new Date(year, month - 1, day, hour, minute, second).getTime();
    }

    // As a last attempt, normalize some characters and try parse again
    try {
      const alt = s.replace(/\u202F|\u00A0/g, ' ').replace(/,/g, '').replace(/\//g, '-');
      ms = Date.parse(alt);
      if (!isNaN(ms)) return ms;
    } catch (_) {}

    return 0;
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
        <TouchableOpacity onPress={() => handleSort('time')} style={{ flex: 2 }}>
          <Text style={[styles.cell, styles.timeCell]}>{headerLabel('Time', 'time')}</Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={() => handleSort('glucose')} style={{ flex: 1.6 }}>
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
    flex: 2,
  },
  glucoseCell: {
    flex: 1.6,
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
