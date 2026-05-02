import React, {useCallback, useEffect, useState} from 'react';
import {
  View, Text, ScrollView, StyleSheet, 
  StatusBar, Linking, Platform, TouchableOpacity
} from 'react-native';
import db from '../database/db';
import Header from '../components/Header';

export const formatted = (inputDate: Date) => {
  const daysText = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  const monthsText = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  return `${daysText[inputDate.getDay()]}, ${monthsText[inputDate.getMonth()]} ${inputDate.getDate()}, ${inputDate.getFullYear()}`;
};

const formatDuration = (sec: number) => {
  if (!sec) return '0s';
  const h = Math.floor(sec / 3600);
  const m = Math.floor((sec % 3600) / 60);
  const s = sec % 60;
  return `${h}h ${m}m ${s}s`;
};

const ViewDoneDetailScreen = ({route, navigation}: any) => {
  const {id} = route.params;

  const [title, setTitle] = useState('');
  const [date, setDate] = useState<Date | null>(null);
  const [duration, setDuration] = useState(0);
  const [lat, setLat] = useState<number | null>(null);
  const [lng, setLng] = useState<number | null>(null);

  const openMap = () => {
    if (lat === null || lng === null) return;
    const url = Platform.OS === 'ios'
      ? `maps:0,0?q=${lat},${lng}`
      : `geo:${lat},${lng}?q=${lat},${lng}`;
    Linking.openURL(url);
  };

  const _loadData = useCallback(() => {
    db.transaction((tx: any) => {
      tx.executeSql(
        `
        SELECT 
          t.title,
          t.date,
          IFNULL(SUM(s.duration), 0) AS totalDuration,
          l.lat,
          l.lng
        FROM tasks t
        LEFT JOIN sessions s ON t.id = s.task_id
        LEFT JOIN locations l ON s.location_id = l.id
        WHERE t.id = ?
        GROUP BY t.id
        `,
        [Number(id)],
        (_: any, results: any) => {
          if (results.rows.length > 0) {
            const item = results.rows.item(0);
            console.log('DEBUG item:', JSON.stringify(item));

            setTitle(item.title || '');

            const raw = item.date;
            const parsed = isNaN(Number(raw)) ? new Date(raw) : new Date(Number(raw));
            setDate(parsed);

            setDuration(Number(item.totalDuration) || 0);
            setLat(item.lat ?? null);
            setLng(item.lng ?? null);
          }
        },
        (err: any) => { console.log('SQL ERROR:', err); return true; }
      );
    });
  }, [id]);

  useEffect(() => {
    _loadData();
  }, [_loadData]);

  return (
    <View style={styles.container}>
      <Header navigation={navigation} />
      <StatusBar barStyle="dark-content" backgroundColor="#F7F7F5" />

      <ScrollView contentContainerStyle={styles.content}>

        <Text style={styles.title}>{title}</Text>

        <View style={styles.card}>
          <Text style={styles.label}>Date</Text>
          <Text style={styles.value}>{date ? formatted(date) : '—'}</Text>
        </View>

        <View style={styles.card}>
          <Text style={styles.label}>Duration</Text>
          <Text style={styles.value}>{formatDuration(duration)}</Text>
        </View>

        <TouchableOpacity
          style={styles.card}
          onPress={openMap}
          disabled={lat === null || lng === null}
        >
          <Text style={styles.label}>Location</Text>
          {lat !== null && lng !== null ? (
            <>
              <Text style={styles.value}>{lat.toFixed(6)}, {lng.toFixed(6)}</Text>
              <Text style={styles.tapHint}>Tap to open in Maps →</Text>
            </>
          ) : (
            <Text style={styles.value}>N/A</Text>
          )}
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
};

export default ViewDoneDetailScreen;

const styles = StyleSheet.create({
  container: {flex: 1, backgroundColor: '#F7F7F5'},
  content: {padding: 24, paddingTop: 60},
  title: {fontSize: 26, fontWeight: '700', marginBottom: 24, color: '#1A1A1A'},
  card: {
    backgroundColor: '#fff',
    padding: 16,
    borderRadius: 14,
    marginBottom: 12,
  },
  label: {fontSize: 12, color: '#999', marginBottom: 4},
  value: {fontSize: 16, fontWeight: '600', color: '#1A1A1A'},
  tapHint: {fontSize: 12, color: '#4A90E2', marginTop: 6},
});